import { getCard, getCards } from '@/lib/cards';
import { buildVCard, vCardFilename } from '@/lib/vcard';

// The Save contact file. Built once per card at build time; iPhone and Android open it
// as a new contact.

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return getCards().map((card) => ({ slug: card.slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) return new Response('Not found', { status: 404 });

  return new Response(buildVCard(card), {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${vCardFilename(card)}"`,
      'X-Robots-Tag': 'noindex',
    },
  });
}
