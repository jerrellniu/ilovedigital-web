import cardsData from '@content/cards.json';
import type { BusinessCard } from '@/types/content';

// Imported rather than read from disk: /t/[slug] is a runtime route, and a JSON import
// is bundled with it, so the lookup works on Vercel without relying on file tracing.
const cards = (cardsData as { cards: BusinessCard[] }).cards;

export function getCards(): BusinessCard[] {
  return cards;
}

export function getCard(slug: string): BusinessCard | undefined {
  return cards.find((card) => card.slug === slug);
}
