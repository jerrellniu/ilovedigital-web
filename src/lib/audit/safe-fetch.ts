// Fetching URLs a stranger typed into a form.
//
// The audit fetches whatever URL a visitor submits, from inside our Vercel project.
// Without care that is a server-side request forgery hole: a visitor could point it
// at 169.254.169.254, localhost, or a private range and read the response back in
// the report. So this module:
//
//   - allows http and https on ports 80 and 443 only;
//   - resolves the hostname itself and refuses any private, loopback, link-local,
//     carrier-grade NAT, multicast or reserved address (IPv4 and IPv6);
//   - pins the connection to the address it checked, via the `lookup` option, so a
//     second DNS answer cannot swap in a private address (DNS rebinding);
//   - follows redirects by hand, re-checking every hop;
//   - caps time and body size, and decompresses gzip, deflate and brotli itself.
//
// node:http(s) is used rather than fetch() because fetch offers no per-request
// lookup hook without pulling in a second copy of undici.

import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
import net from 'node:net';
import zlib from 'node:zlib';
import type { LookupFunction } from 'node:net';

export const USER_AGENT =
  'Mozilla/5.0 (compatible; ILoveDigitalAudit/1.0; +https://ilovedigital.com.au/audit)';

export class BlockedUrlError extends Error {}

export interface SafeResponse {
  url: string;
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  body: string;
  /** Each hop, first to last, so redirect chains can be reported. */
  chain: { url: string; status: number }[];
  ms: number;
}

interface Options {
  method?: 'GET' | 'HEAD';
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
}

const ALLOW_PRIVATE = process.env.AUDIT_ALLOW_PRIVATE === '1' && process.env.NODE_ENV !== 'production';

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
}

const V4_BLOCKS: [string, number][] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

export function isBlockedAddress(address: string): boolean {
  if (ALLOW_PRIVATE) return false;
  if (net.isIPv4(address)) {
    const n = ipv4ToInt(address);
    return V4_BLOCKS.some(([base, bits]) => {
      const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
      return (n & mask) === (ipv4ToInt(base) & mask);
    });
  }
  if (net.isIPv6(address)) {
    const a = address.toLowerCase();
    // IPv4-mapped and IPv4-compatible forms carry a v4 address: judge that instead.
    const mapped = a.match(/^::(?:ffff:)?(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedAddress(mapped[1]);
    if (a === '::' || a === '::1') return true;
    if (/^f[cd]/.test(a)) return true; // unique local fc00::/7
    if (/^fe[89ab]/.test(a)) return true; // link-local fe80::/10
    if (/^ff/.test(a)) return true; // multicast
    if (a.startsWith('2001:db8')) return true; // documentation
    if (a.startsWith('64:ff9b')) return true; // NAT64 can reach v4 private space
    return false;
  }
  return true;
}

/**
 * Refuse the whole answer if any address is non-public. One bad record is enough:
 * a resolver can rotate through them, so "the first one is fine" is not safe.
 */
export function vetAddresses(hostname: string, list: { address: string }[]): Error | null {
  if (!list.length) return new Error(`no address for ${hostname}`);
  if (list.some((a) => isBlockedAddress(a.address))) {
    return new BlockedUrlError(`${hostname} resolves to a non-public address`);
  }
  return null;
}

/** Validates every address the resolver returns, and hands back only checked ones. */
const guardedLookup: LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { all: true, verbatim: true }, (err, addresses) => {
    if (err) return callback(err, '', 4);
    const list = addresses as dns.LookupAddress[];
    const refused = vetAddresses(hostname, list);
    if (refused) return callback(refused, '', 4);
    if ((options as { all?: boolean }).all) {
      return (callback as unknown as (e: null, a: dns.LookupAddress[]) => void)(null, list);
    }
    callback(null, list[0].address, list[0].family);
  });
};

/** Normalise what a visitor typed into an absolute URL we are willing to fetch. */
export function normaliseInputUrl(input: string): URL {
  let raw = input.trim();
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = `https://${raw}`;
  const url = new URL(raw);
  assertFetchable(url);
  url.hash = '';
  return url;
}

export function assertFetchable(url: URL) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BlockedUrlError('only http and https addresses can be audited');
  }
  if (url.username || url.password) throw new BlockedUrlError('addresses with credentials are not allowed');
  if (url.port && url.port !== '80' && url.port !== '443') {
    throw new BlockedUrlError('only standard web ports can be audited');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) && isBlockedAddress(host)) throw new BlockedUrlError('that address is not public');
  if (!net.isIP(host) && !host.includes('.')) throw new BlockedUrlError('that is not a public web address');
  if (/(^|\.)(localhost|local|internal|lan|home\.arpa)$/i.test(host) && !ALLOW_PRIVATE) {
    throw new BlockedUrlError('that is not a public web address');
  }
}

function decode(buf: Buffer, encoding: string | undefined): Buffer {
  switch ((encoding || '').toLowerCase()) {
    case 'gzip':
    case 'x-gzip':
      return zlib.gunzipSync(buf);
    case 'deflate':
      try {
        return zlib.inflateSync(buf);
      } catch {
        return zlib.inflateRawSync(buf);
      }
    case 'br':
      return zlib.brotliDecompressSync(buf);
    default:
      return buf;
  }
}

function once(url: URL, opts: Required<Options>, deadline: number): Promise<SafeResponse> {
  assertFetchable(url);
  const started = Date.now();
  const mod = url.protocol === 'https:' ? https : http;
  const remaining = Math.max(1000, Math.min(opts.timeoutMs, deadline - Date.now()));

  return new Promise((resolve, reject) => {
    const req = mod.request(
      url,
      {
        method: opts.method,
        lookup: guardedLookup,
        headers: {
          'user-agent': USER_AGENT,
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
          'accept-encoding': 'gzip, deflate, br',
          'accept-language': 'en-AU,en;q=0.9',
        },
        timeout: remaining,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;
        let truncated = false;
        res.on('data', (c: Buffer) => {
          size += c.length;
          if (size > opts.maxBytes) {
            truncated = true;
            res.destroy();
            return;
          }
          chunks.push(c);
        });
        const finish = () => {
          const headers: Record<string, string> = {};
          for (const [k, v] of Object.entries(res.headers)) {
            if (v !== undefined) headers[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : String(v);
          }
          let body = '';
          if (opts.method === 'GET' && chunks.length) {
            try {
              body = decode(Buffer.concat(chunks), headers['content-encoding']).toString('utf8');
            } catch {
              // A truncated compressed body cannot be inflated. Report it empty
              // rather than as garbage.
              body = truncated ? '' : Buffer.concat(chunks).toString('utf8');
            }
          }
          resolve({
            url: url.toString(),
            finalUrl: url.toString(),
            status: res.statusCode ?? 0,
            headers,
            body,
            chain: [{ url: url.toString(), status: res.statusCode ?? 0 }],
            ms: Date.now() - started,
          });
        };
        res.on('end', finish);
        res.on('close', () => {
          if (truncated) finish();
        });
        res.on('error', reject);
      },
    );
    req.on('timeout', () => req.destroy(new Error('timed out')));
    req.on('error', reject);
    req.end();
  });
}

/** Fetch with manual, re-validated redirects. Never throws on HTTP status, only on transport. */
export async function safeFetch(input: string | URL, options: Options = {}): Promise<SafeResponse> {
  const opts: Required<Options> = {
    method: options.method ?? 'GET',
    timeoutMs: options.timeoutMs ?? 10000,
    maxBytes: options.maxBytes ?? 3 * 1024 * 1024,
    maxRedirects: options.maxRedirects ?? 5,
  };
  const deadline = Date.now() + opts.timeoutMs * 2;
  let url = typeof input === 'string' ? new URL(input) : new URL(input.toString());
  const chain: { url: string; status: number }[] = [];
  const started = Date.now();

  for (let hop = 0; hop <= opts.maxRedirects; hop++) {
    const res = await once(url, opts, deadline);
    chain.push({ url: url.toString(), status: res.status });
    const location = res.headers['location'];
    if (res.status >= 300 && res.status < 400 && location) {
      url = new URL(location, url);
      continue;
    }
    return { ...res, url: chain[0].url, finalUrl: url.toString(), chain, ms: Date.now() - started };
  }
  throw new Error('too many redirects');
}
