// Findings. Each check turns measurements into one Finding with its own fix copy.
//
// Copy rules for every string here: Australian English, full sentences, say what we
// found and then what to do and why it helps. No pricing, no jargon a business owner
// would need to look up, and no figure that was not measured on this run.

import type { RobotsInfo, SitemapInfo } from './crawl';
import type { CategoryScore, Category, Finding, PageSnapshot, Priority, SpeedResult, Status } from './types';

export interface Collected {
  homeUrl: string;
  finalUrl: string;
  homeStatus: number;
  homeMs: number;
  redirectHops: number;
  hsts: boolean;
  httpRedirectsToHttps: boolean | null;
  robots: RobotsInfo;
  sitemap: SitemapInfo;
  llmsTxt: boolean;
  pages: PageSnapshot[];
  brokenLinks: { url: string; status: number }[];
  linksChecked: number;
  unverifiedLinks: number;
  speed: SpeedResult[];
  hasPhone: boolean;
  hasEmail: boolean;
  hasAboutLink: boolean;
  hasContactLink: boolean;
}

const short = (u: string) => {
  try {
    const p = new URL(u);
    return p.pathname === '/' ? p.hostname : p.pathname + p.search;
  } catch {
    return u;
  }
};

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
/** Verb agreement for counts: are(1) -> "is", has(3) -> "have". */
const are = (n: number) => (n === 1 ? 'is' : 'are');
const has = (n: number) => (n === 1 ? 'has' : 'have');
const s1 = (n: number, one: string, many: string) => (n === 1 ? one : many);

function f(
  id: string,
  category: Category,
  status: Status,
  priority: Priority,
  title: string,
  detail: string,
  fix = '',
  urls?: string[],
): Finding {
  return { id, category, status, priority, title, detail, fix: status === 'pass' ? '' : fix, urls: urls?.slice(0, 5) };
}

function technical(c: Collected): Finding[] {
  const out: Finding[] = [];
  const home = c.pages[0];

  out.push(
    c.finalUrl.startsWith('https:')
      ? f('tech.https', 'technical', 'pass', 'critical', 'Secure connection (HTTPS)', 'Your homepage loads over a secure HTTPS connection.')
      : f(
          'tech.https',
          'technical',
          'fail',
          'critical',
          'Secure connection (HTTPS)',
          'Your homepage loads over plain HTTP, so browsers mark it as "Not secure".',
          'Install an SSL certificate and send all traffic to the https:// address. Visitors trust the padlock, and Google ranks secure pages ahead of insecure ones.',
        ),
  );

  if (c.httpRedirectsToHttps === false && c.finalUrl.startsWith('https:')) {
    out.push(
      f(
        'tech.http-redirect',
        'technical',
        'warn',
        'high',
        'HTTP to HTTPS redirect',
        'The http:// version of your site does not redirect to the secure https:// version.',
        'Add a permanent (301) redirect from http:// to https://. Every visitor and search engine then lands on one secure address, and your ranking signals stay in one place.',
      ),
    );
  } else if (c.httpRedirectsToHttps) {
    out.push(f('tech.http-redirect', 'technical', 'pass', 'high', 'HTTP to HTTPS redirect', 'The http:// version of your site redirects to https://.'));
  }

  if (c.redirectHops >= 3) {
    out.push(
      f(
        'tech.redirect-chain',
        'technical',
        'warn',
        'low',
        'Redirect chain on the homepage',
        `Your homepage address passes through ${c.redirectHops} redirects before it loads.`,
        'Point the address straight at the final URL in one hop. Each extra redirect slows the first visit and weakens the link value passed along.',
      ),
    );
  }

  out.push(
    c.homeMs <= 1500
      ? f('tech.response', 'technical', 'pass', 'medium', 'Server response time', `Your homepage downloaded in ${c.homeMs} ms from our test server.`)
      : f(
          'tech.response',
          'technical',
          c.homeMs > 3000 ? 'fail' : 'warn',
          c.homeMs > 3000 ? 'high' : 'medium',
          'Server response time',
          `Your homepage took ${c.homeMs} ms to download from our test server.`,
          'Move to faster hosting or add page caching. A quicker server gets every page on screen sooner, and fewer visitors leave before it loads.',
        ),
  );

  if (!c.hsts && c.finalUrl.startsWith('https:')) {
    out.push(
      f(
        'tech.hsts',
        'technical',
        'warn',
        'low',
        'HSTS security header',
        'Your site does not send the Strict-Transport-Security header.',
        'Turn on HSTS at your host or CDN. It tells browsers to always use the secure address, which closes a common downgrade attack.',
      ),
    );
  }

  if (c.robots.blocksAll) {
    out.push(
      f(
        'tech.robots',
        'technical',
        'fail',
        'critical',
        'robots.txt blocks search engines',
        'Your robots.txt tells every search engine not to crawl any page on the site.',
        'Remove the "Disallow: /" rule for all user agents. While it is there, Google cannot crawl your pages, so they drop out of search results.',
      ),
    );
  } else if (!c.robots.found) {
    out.push(
      f(
        'tech.robots',
        'technical',
        'warn',
        'low',
        'robots.txt file',
        'We could not find a robots.txt file at the root of your site.',
        'Add a robots.txt that allows crawling and lists your sitemap. Search engines find your pages faster when you point them at the sitemap.',
      ),
    );
  } else {
    out.push(f('tech.robots', 'technical', 'pass', 'critical', 'robots.txt file', 'Your robots.txt is present and does not block search engines.'));
  }

  out.push(
    c.sitemap.found && !c.sitemap.unreadable
      ? f('tech.sitemap', 'technical', 'pass', 'medium', 'XML sitemap', `Your XML sitemap lists ${plural(c.sitemap.urlCount, 'URL')}.`)
      : c.sitemap.found
        ? f('tech.sitemap', 'technical', 'warn', 'medium', 'XML sitemap', 'We found your sitemap but could not read any page addresses from it.',
            'Open the sitemap in a browser and check it lists your pages, then resubmit it in Google Search Console. An empty or unreadable sitemap gives Google nothing to work from.')
        : f(
          'tech.sitemap',
          'technical',
          'warn',
          'medium',
          'XML sitemap',
          'We could not find an XML sitemap at the usual addresses or in robots.txt.',
          'Generate a sitemap.xml, list it in robots.txt and submit it in Google Search Console. Google then discovers new and updated pages without waiting to stumble on them.',
        ),
  );

  if (home?.noindex) {
    out.push(
      f(
        'tech.noindex-home',
        'technical',
        'fail',
        'critical',
        'Homepage hidden from Google',
        'Your homepage carries a "noindex" instruction, which tells Google to leave it out of search results.',
        'Remove the noindex meta tag or X-Robots-Tag header from the homepage. Until it is gone, the most important page on your site cannot rank.',
      ),
    );
  }
  const noindexOthers = c.pages.slice(1).filter((p) => p.noindex);
  if (noindexOthers.length) {
    out.push(
      f(
        'tech.noindex-pages',
        'technical',
        'warn',
        'high',
        'Pages hidden from Google',
        `${plural(noindexOthers.length, 'page')} we checked ${s1(noindexOthers.length, 'carries', 'carry')} a "noindex" instruction.`,
        'Check each page listed. If it should appear in Google, remove the noindex tag so it can rank and bring in visitors.',
        noindexOthers.map((p) => p.url),
      ),
    );
  }

  // 401/403 are logins or firewalls, and 0 means no answer after retries: neither
  // proves the page is broken. 4xx is a missing page. 5xx after three tries is a
  // server problem worth raising, but it can be temporary, so it is worded that way.
  const missingPages = c.pages.filter((p) => p.status >= 400 && p.status < 500 && p.status !== 401 && p.status !== 403 && p.status !== 429);
  const serverErrors = c.pages.filter((p) => p.status >= 500);
  if (missingPages.length) {
    out.push(
      f(
        'tech.page-errors',
        'technical',
        'fail',
        'high',
        'Pages returning errors',
        `${plural(missingPages.length, 'page')} linked from your site returned "not found" when we loaded ${s1(missingPages.length, 'it', 'them')}.`,
        'Fix or redirect each page listed. Error pages lose visitors at the exact moment they were interested.',
        missingPages.map((p) => `${p.url} (${p.status})`),
      ),
    );
  }
  if (serverErrors.length) {
    out.push(
      f(
        'tech.server-errors',
        'technical',
        'warn',
        'medium',
        'Server errors while loading',
        `${plural(serverErrors.length, 'page')} returned a server error on three tries during our check.`,
        'Ask your host to check the server logs for these pages. It can be temporary, but any visitor who hits it sees a broken page instead of your business.',
        serverErrors.map((p) => `${p.url} (${p.status})`),
      ),
    );
  }

  if (c.brokenLinks.length) {
    out.push(
      f(
        'tech.broken-links',
        'technical',
        'fail',
        'high',
        'Broken internal links',
        `${plural(c.brokenLinks.length, 'internal link')} out of ${c.linksChecked} we tested ${s1(c.brokenLinks.length, 'leads', 'lead')} to a missing page.`,
        'Update each link to a working page, or redirect the old address. Broken links frustrate visitors and waste the crawl time Google gives your site.',
        c.brokenLinks.map((b) => `${b.url} (${b.status})`),
      ),
    );
  } else if (c.linksChecked > 0) {
    out.push(f('tech.broken-links', 'technical', 'pass', 'high', 'Broken internal links', `None of the ${c.linksChecked} internal links we tested were broken.${c.unverifiedLinks ? ` A further ${c.unverifiedLinks} did not answer in time, so we could not check them.` : ''}`));
  }

  const missingCanonical = c.pages.filter((p) => p.status === 200 && !p.canonical);
  const foreignCanonical = c.pages.filter((p) => {
    if (!p.canonical) return false;
    try {
      const a = new URL(p.canonical, p.url).hostname.replace(/^www\./, '');
      const b = new URL(p.url).hostname.replace(/^www\./, '');
      return a !== b;
    } catch {
      return false;
    }
  });
  if (foreignCanonical.length) {
    out.push(
      f(
        'tech.canonical-foreign',
        'technical',
        'fail',
        'high',
        'Canonical tags point to another site',
        `${plural(foreignCanonical.length, 'page')} ${s1(foreignCanonical.length, 'tells', 'tell')} Google the "real" version lives on a different domain.`,
        'Set each canonical tag to the page\'s own address on your domain. Otherwise Google credits the other site instead of yours.',
        foreignCanonical.map((p) => p.url),
      ),
    );
  }
  if (missingCanonical.length) {
    out.push(
      f(
        'tech.canonical',
        'technical',
        'warn',
        'medium',
        'Canonical tags',
        `${plural(missingCanonical.length, 'page')} out of ${c.pages.length} ${has(missingCanonical.length)} no canonical tag.`,
        'Add a self-referencing canonical tag to every page. It stops duplicate addresses, such as tracking links, from splitting your ranking signals.',
        missingCanonical.map((p) => p.url),
      ),
    );
  } else if (c.pages.length) {
    out.push(f('tech.canonical', 'technical', 'pass', 'medium', 'Canonical tags', `All ${c.pages.length} pages we checked have a canonical tag.`));
  }

  const noViewport = c.pages.filter((p) => p.status === 200 && !p.viewport);
  out.push(
    noViewport.length
      ? f(
          'tech.viewport',
          'technical',
          'fail',
          'high',
          'Mobile viewport',
          `${plural(noViewport.length, 'page')} ${are(noViewport.length)} missing the mobile viewport tag, so phones show ${s1(noViewport.length, 'it', 'them')} zoomed out.`,
          'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to every page. Most local searches happen on phones, and Google ranks the mobile version of your site.',
          noViewport.map((p) => p.url),
        )
      : f('tech.viewport', 'technical', 'pass', 'high', 'Mobile viewport', 'Every page we checked is set up for mobile screens.'),
  );

  const mixed = c.pages.filter((p) => p.mixedContent > 0);
  if (mixed.length) {
    out.push(
      f(
        'tech.mixed-content',
        'technical',
        'warn',
        'medium',
        'Insecure files on secure pages',
        `${plural(mixed.length, 'page')} ${s1(mixed.length, 'loads', 'load')} images or scripts over insecure http://.`,
        'Change those file addresses to https://. Browsers block or flag insecure files, which can break the page and shake visitor trust.',
        mixed.map((p) => p.url),
      ),
    );
  }

  if (home && !home.lang) {
    out.push(
      f(
        'tech.lang',
        'technical',
        'warn',
        'low',
        'Page language',
        'Your homepage does not declare its language.',
        'Add lang="en-AU" to the <html> tag. Screen readers pronounce the page correctly, and search engines match it to Australian searches.',
      ),
    );
  }

  return out;
}

function onpage(c: Collected): Finding[] {
  const out: Finding[] = [];
  const ok = c.pages.filter((p) => p.status === 200);
  if (!ok.length) return out;

  const noTitle = ok.filter((p) => !p.title);
  const badTitle = ok.filter((p) => p.title && (p.title.length < 30 || p.title.length > 65));
  if (noTitle.length) {
    out.push(
      f('onpage.title-missing', 'onpage', 'fail', 'high', 'Missing page titles', `${plural(noTitle.length, 'page')} ${has(noTitle.length)} no title tag.`,
        'Write a unique title for each page that leads with the service and location. The title is the blue headline people click in Google.',
        noTitle.map((p) => p.url)),
    );
  }
  out.push(
    badTitle.length
      ? f('onpage.title-length', 'onpage', 'warn', 'medium', 'Page title length',
          `${plural(badTitle.length, 'page title')} ${s1(badTitle.length, 'falls', 'fall')} outside 30 to 65 characters, so Google may cut ${s1(badTitle.length, 'it', 'them')} short or rewrite ${s1(badTitle.length, 'it', 'them')}.`,
          'Keep each title between 30 and 65 characters, with the main service first. A complete, specific title earns more clicks from the same ranking.',
          badTitle.map((p) => `${p.url} (${p.title!.length} characters)`))
      : f('onpage.title-length', 'onpage', 'pass', 'medium', 'Page title length', 'Every page title we checked is a sensible length.'),
  );

  const titleCounts = new Map<string, string[]>();
  ok.forEach((p) => p.title && titleCounts.set(p.title, [...(titleCounts.get(p.title) || []), p.url]));
  const dupTitles = [...titleCounts.values()].filter((v) => v.length > 1).flat();
  if (dupTitles.length) {
    out.push(
      f('onpage.title-duplicate', 'onpage', 'warn', 'medium', 'Duplicate page titles', `${dupTitles.length} pages share their title with another page.`,
        'Give every page its own title that says what is on it. Duplicate titles make pages compete with each other in Google.',
        dupTitles),
    );
  }

  const noDesc = ok.filter((p) => !p.description);
  const badDesc = ok.filter((p) => p.description && (p.description.length < 70 || p.description.length > 160));
  out.push(
    noDesc.length
      ? f('onpage.description', 'onpage', 'warn', 'medium', 'Meta descriptions', `${plural(noDesc.length, 'page')} out of ${ok.length} ${has(noDesc.length)} no meta description.`,
          'Write a 120 to 155 character description for each page that states the benefit and a call to action. It is the sales pitch under your headline in Google.',
          noDesc.map((p) => p.url))
      : f('onpage.description', 'onpage', 'pass', 'medium', 'Meta descriptions', `All ${ok.length} pages we checked have a meta description.`),
  );
  if (badDesc.length) {
    out.push(
      f('onpage.description-length', 'onpage', 'warn', 'low', 'Meta description length',
        `${plural(badDesc.length, 'meta description')} ${s1(badDesc.length, 'falls', 'fall')} outside 70 to 160 characters.`,
        'Rewrite each of these meta descriptions to 120 to 155 characters. Short ones waste space in the results, and long ones get cut off mid-sentence.',
        badDesc.map((p) => `${p.url} (${p.description!.length} characters)`)),
    );
  }

  const noH1 = ok.filter((p) => p.h1.length === 0);
  const multiH1 = ok.filter((p) => p.h1.length > 1);
  out.push(
    noH1.length
      ? f('onpage.h1', 'onpage', 'warn', 'medium', 'Main headings (H1)', `${plural(noH1.length, 'page')} ${has(noH1.length)} no H1 heading.`,
          'Give each page one H1 that names the service and location. It tells visitors and Google what the page is about at a glance.',
          noH1.map((p) => p.url))
      : f('onpage.h1', 'onpage', 'pass', 'medium', 'Main headings (H1)', 'Every page we checked has a main heading.'),
  );
  if (multiH1.length) {
    out.push(
      f('onpage.h1-multiple', 'onpage', 'warn', 'low', 'More than one H1', `${plural(multiH1.length, 'page')} ${has(multiH1.length)} more than one H1 heading.`,
        'Keep one H1 per page and use H2s for sections. A clear outline helps search engines and screen readers follow the page.',
        multiH1.map((p) => `${p.url} (${p.h1.length} H1s)`)),
    );
  }

  const imgTotal = ok.reduce((n, p) => n + p.imagesTotal, 0);
  const imgMissing = ok.reduce((n, p) => n + p.imagesMissingAlt, 0);
  if (imgTotal > 0) {
    out.push(
      imgMissing
        ? f('onpage.alt', 'onpage', 'warn', 'medium', 'Image alt text', `${imgMissing} of ${imgTotal} images ${has(imgMissing)} no alt text.`,
            'Describe each meaningful image in its alt text, in plain words. It makes the site usable for screen-reader users and helps your images appear in Google Images.',
            ok.filter((p) => p.imagesMissingAlt > 0).map((p) => `${p.url} (${p.imagesMissingAlt} missing)`))
        : f('onpage.alt', 'onpage', 'pass', 'medium', 'Image alt text', `All ${imgTotal} images we found have alt text.`),
    );
  }

  const thin = ok.filter((p) => p.wordCount < 250);
  out.push(
    thin.length
      ? f('onpage.thin', 'onpage', 'warn', 'medium', 'Thin pages', `${plural(thin.length, 'page')} ${has(thin.length)} fewer than 250 words of text.`,
          'Expand each page with the questions customers actually ask: what you do, where, how it works and what it includes. Pages that answer fully rank higher and convert better.',
          thin.map((p) => `${p.url} (${p.wordCount} words)`))
      : f('onpage.thin', 'onpage', 'pass', 'medium', 'Content depth', 'Every page we checked has a reasonable amount of text.'),
  );

  const home = ok[0];
  if (home && (!home.ogTitle || !home.ogImage)) {
    out.push(
      f('onpage.social', 'onpage', 'warn', 'low', 'Social sharing preview', 'Your homepage is missing Open Graph tags, so links shared on Facebook or LinkedIn show no proper title or image.',
        'Add og:title, og:description and og:image tags. A shared link with a clear image and headline gets far more clicks than a bare URL.'),
    );
  }

  const anySchema = ok.some((p) => p.schemaTypes.length > 0 && !p.schemaTypes.every((t) => t === '(invalid JSON-LD)'));
  const invalid = ok.filter((p) => p.schemaTypes.includes('(invalid JSON-LD)'));
  out.push(
    anySchema
      ? f('onpage.schema', 'onpage', 'pass', 'medium', 'Structured data', `Structured data found: ${[...new Set(ok.flatMap((p) => p.schemaTypes))].filter((t) => t !== '(invalid JSON-LD)').slice(0, 8).join(', ')}.`)
      : f('onpage.schema', 'onpage', 'warn', 'medium', 'Structured data', 'We found no structured data (schema markup) on the pages we checked.',
          'Add LocalBusiness schema to the homepage and FAQPage schema where you answer questions. It helps Google show rich results and helps AI tools understand your business.'),
  );
  if (invalid.length) {
    out.push(
      f('onpage.schema-invalid', 'onpage', 'warn', 'medium', 'Broken structured data', `${plural(invalid.length, 'page')} ${s1(invalid.length, 'contains', 'contain')} structured data that is not valid JSON.`,
        'Fix the markup and test it in Google\'s Rich Results Test. Broken schema is ignored, so you get none of its benefit.',
        invalid.map((p) => p.url)),
    );
  }

  return out;
}

function speedFindings(c: Collected): Finding[] {
  const out: Finding[] = [];
  for (const s of c.speed) {
    if (s.performance === null) continue;
    const label = s.strategy === 'mobile' ? 'Mobile' : 'Desktop';
    const lab = [s.lcp && `largest content in ${s.lcp}`, s.tbt && `${s.tbt} blocking time`, s.cls && `layout shift of ${s.cls}`]
      .filter(Boolean)
      .join(', ');
    const status: Status = s.performance >= 90 ? 'pass' : s.performance >= 50 ? 'warn' : 'fail';
    const priority: Priority = s.strategy === 'mobile' ? (status === 'fail' ? 'high' : 'medium') : status === 'fail' ? 'medium' : 'low';
    out.push(
      f(`speed.${s.strategy}`, 'speed', status, priority, `${label} speed score`,
        `Google PageSpeed scores your homepage ${s.performance} out of 100 on ${s.strategy}${lab ? ` (${lab})` : ''}.`,
        s.strategy === 'mobile'
          ? 'Compress and resize images, serve them as WebP, and defer scripts that are not needed straight away. Most visitors arrive on phones, and every second saved keeps more of them on the page.'
          : 'Compress images and trim unused scripts and styles. A faster desktop experience matters most for visitors researching larger jobs at work.'),
    );
  }

  const mobile = c.speed.find((s) => s.strategy === 'mobile');
  if (mobile && mobile.performance !== null) {
    if (mobile.fieldCategory) {
      const parts = [
        mobile.fieldLcpMs !== null && `largest content in ${(mobile.fieldLcpMs / 1000).toFixed(1)} s`,
        mobile.fieldInpMs !== null && `response to taps in ${mobile.fieldInpMs} ms`,
        mobile.fieldCls !== null && `layout shift of ${mobile.fieldCls.toFixed(2)}`,
      ].filter(Boolean);
      const st: Status = mobile.fieldCategory === 'FAST' ? 'pass' : mobile.fieldCategory === 'AVERAGE' ? 'warn' : 'fail';
      out.push(
        f('speed.cwv', 'speed', st, st === 'fail' ? 'high' : 'medium', 'Core Web Vitals (real visitors)',
          `Real Chrome users on phones rate your site ${mobile.fieldCategory.toLowerCase()}${parts.length ? `: ${parts.join(', ')}` : ''}.`,
          'Work through the mobile speed fixes, then recheck in Google Search Console after 28 days. Core Web Vitals are a Google ranking factor measured on your real visitors.'),
      );
    } else {
      out.push(
        f('speed.cwv', 'speed', 'info', 'low', 'Core Web Vitals (real visitors)',
          'Google does not have enough real-visitor data for your site yet, so these results rely on the lab test only.'),
      );
    }
    if (mobile.accessibility !== null) {
      out.push(
        mobile.accessibility >= 90
          ? f('speed.a11y', 'speed', 'pass', 'medium', 'Accessibility score', `Google Lighthouse scores your homepage ${mobile.accessibility} out of 100 for accessibility.`)
          : f('speed.a11y', 'speed', 'warn', 'medium', 'Accessibility score', `Google Lighthouse scores your homepage ${mobile.accessibility} out of 100 for accessibility.`,
              'Fix colour contrast, label every form field and button, and add alt text. An accessible site works for every customer and reduces legal risk.'),
      );
    }
  }
  return out;
}

const ORG_TYPE = /(Organization|Organisation|LocalBusiness|Business|Corporation|Store|Service|Contractor|Plumber|Electrician|Dentist|Restaurant|Agency|Clinic|Physician|Attorney|Hotel|Locksmith|Roofing|HVAC|MovingCompany|AutoRepair|BeautySalon|HairSalon)/;

function geo(c: Collected): Finding[] {
  const out: Finding[] = [];
  const types = new Set(c.pages.flatMap((p) => p.schemaTypes));
  const homeTypes = c.pages[0]?.schemaTypes ?? [];

  out.push(
    c.robots.blockedAiBots.length
      ? f('geo.ai-crawlers', 'geo', 'fail', 'high', 'AI search crawler access',
          `Your robots.txt blocks these AI crawlers: ${c.robots.blockedAiBots.join(', ')}.`,
          'Allow the AI search crawlers in robots.txt unless you have a reason to block them. Tools like ChatGPT and Perplexity can only recommend businesses they are allowed to read.')
      : f('geo.ai-crawlers', 'geo', 'pass', 'high', 'AI search crawler access', 'Your robots.txt does not block the main AI search crawlers.'),
  );

  out.push(
    c.llmsTxt
      ? f('geo.llms-txt', 'geo', 'pass', 'low', 'llms.txt file', 'Your site has an llms.txt file that summarises it for AI tools.')
      : f('geo.llms-txt', 'geo', 'warn', 'low', 'llms.txt file', 'Your site has no llms.txt file.',
          'Add an llms.txt at the root of your site with a short summary of who you are, what you do and where. It is a cheap, early signal that helps AI tools describe your business accurately.'),
  );

  out.push(
    homeTypes.some((t) => ORG_TYPE.test(t))
      ? f('geo.entity', 'geo', 'pass', 'high', 'Business identity markup', 'Your homepage identifies your business with Organization or LocalBusiness schema.')
      : f('geo.entity', 'geo', 'warn', 'high', 'Business identity markup', 'Your homepage does not identify your business with Organization or LocalBusiness schema.',
          'Add LocalBusiness schema with your name, address, phone, service area, opening hours and social profiles. AI tools and Google use it to connect your website to your business listing.'),
  );

  out.push(
    types.has('FAQPage')
      ? f('geo.faq', 'geo', 'pass', 'medium', 'FAQ content with schema', 'At least one page we checked has FAQPage schema.')
      : f('geo.faq', 'geo', 'warn', 'medium', 'FAQ content with schema', 'None of the pages we checked has FAQPage schema.',
          'Answer the questions customers ask in a short FAQ on each service page, and mark it up with FAQPage schema. Direct question-and-answer content is what AI tools quote when they recommend a business.'),
  );

  out.push(
    c.hasPhone
      ? f('geo.contact', 'geo', 'pass', 'medium', 'Contact details on the homepage', 'Your homepage shows a phone number.')
      : f('geo.contact', 'geo', 'warn', 'medium', 'Contact details on the homepage', 'We could not find a phone number on your homepage.',
          'Show your phone number as a tap-to-call link in the header and footer, matching your Google Business Profile exactly. Consistent details build trust with customers, Google and AI tools.'),
  );

  out.push(
    c.hasAboutLink
      ? f('geo.about', 'geo', 'pass', 'low', 'About page', 'Your homepage links to an About page.')
      : f('geo.about', 'geo', 'warn', 'low', 'About page', 'We could not find a link to an About page from your homepage.',
          'Add an About page with the real people behind the business, your experience and where you work. Evidence of real expertise is part of how Google and AI tools judge who to trust.'),
  );

  return out;
}

const WEIGHT: Record<Priority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const CREDIT: Record<Status, number | null> = { pass: 1, warn: 0.5, fail: 0, info: null };
const LABELS: Record<Category, string> = {
  technical: 'Technical SEO',
  onpage: 'On-page SEO',
  speed: 'Speed and experience',
  geo: 'AI search readiness',
};

export function score(findings: Finding[]): { scores: CategoryScore[]; overall: number | null } {
  const scores = (Object.keys(LABELS) as Category[]).map((category) => {
    const scored = findings.filter((x) => x.category === category && CREDIT[x.status] !== null);
    const w = scored.reduce((n, x) => n + WEIGHT[x.priority], 0);
    const got = scored.reduce((n, x) => n + WEIGHT[x.priority] * (CREDIT[x.status] as number), 0);
    return {
      category,
      label: LABELS[category],
      score: w ? Math.round((got / w) * 100) : null,
      passed: scored.filter((x) => x.status === 'pass').length,
      total: scored.length,
    };
  });
  const present = scores.filter((s) => s.score !== null).map((s) => s.score as number);
  return { scores, overall: present.length ? Math.round(present.reduce((a, b) => a + b, 0) / present.length) : null };
}

const RANK: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const SRANK: Record<Status, number> = { fail: 0, warn: 1, info: 2, pass: 3 };

export function sortFindings(list: Finding[]): Finding[] {
  return [...list].sort((a, b) => SRANK[a.status] - SRANK[b.status] || RANK[a.priority] - RANK[b.priority]);
}

export function buildFindings(c: Collected): Finding[] {
  return sortFindings([...technical(c), ...onpage(c), ...speedFindings(c), ...geo(c)]);
}
