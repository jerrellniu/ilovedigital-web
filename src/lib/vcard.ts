import type { BusinessCard } from '@/types/content';

// vCard 3.0 (RFC 2426): the version iPhone Contacts and Android both import cleanly.
// Lines end in CRLF, and commas, semicolons and backslashes in text values are escaped,
// so a title like "Coder, Website Designer & CTO" stays one field.

const SITE = 'https://ilovedigital.com.au';

function esc(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;');
}

function telNumber(href: string): string {
  return href.replace(/^tel:/, '');
}

export function buildVCard(card: BusinessCard): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(card.familyName)};${esc(card.givenName)};;;`,
    `FN:${esc(card.name)}`,
    `ORG:${esc(card.organisation)}`,
    `TITLE:${esc(card.title)}`,
  ];

  for (const contact of card.contacts) {
    switch (contact.kind) {
      case 'phone':
        lines.push(`TEL;TYPE=WORK,VOICE:${telNumber(contact.href)}`);
        break;
      case 'mobile':
        lines.push(`TEL;TYPE=CELL,VOICE:${telNumber(contact.href)}`);
        break;
      case 'email':
        lines.push(`EMAIL;TYPE=INTERNET,WORK:${contact.href.replace(/^mailto:/, '')}`);
        break;
      case 'website':
        lines.push(`URL;TYPE=WORK:${contact.href}`);
        break;
      case 'booking':
        // Not a standard vCard field; the profile page link is the way back to it.
        break;
    }
  }

  for (const social of card.socials) {
    lines.push(`X-SOCIALPROFILE;TYPE=${social.kind}:${social.href}`);
  }

  lines.push(`NOTE:${esc(`${card.tagline} Card: ${SITE}/card/${card.slug}`)}`);
  lines.push('END:VCARD');
  return lines.join('\r\n') + '\r\n';
}

export function vCardFilename(card: BusinessCard): string {
  return `${card.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.vcf`;
}
