import { NextResponse, type NextRequest } from 'next/server';
import { getCard } from '@/lib/cards';

// The link every Wallet pass QR code and NFC chip carries: /t/[slug]?src=wallet|nfc|qr.
// It redirects to the card's current destination, so a destination can change without
// reissuing a pass or reprinting a card.
//
// Always a 307, never a 308: browsers cache permanent redirects, and a cached 308 would
// keep sending anyone who tapped before to the old destination. Responses are marked
// no-store so neither a browser nor the CDN holds on to one.

export const dynamic = 'force-dynamic';

const SOURCES = new Set(['wallet', 'wallet-back', 'nfc', 'qr']);

export function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const card = getCard(params.slug);
  const target = new URL(card ? card.destination : '/', request.nextUrl.origin);

  if (card) {
    const src = request.nextUrl.searchParams.get('src') ?? '';
    target.searchParams.set('utm_source', SOURCES.has(src) ? src : 'card');
    target.searchParams.set('utm_medium', 'business-card');
    target.searchParams.set('utm_campaign', card.slug);
  }

  const response = NextResponse.redirect(target, 307);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
