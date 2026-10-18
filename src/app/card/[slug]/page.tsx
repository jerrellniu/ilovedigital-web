import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Logo from '@/components/Logo';
import { CardIcon, SocialIcon } from '@/components/Icons';
import { getCard, getCards } from '@/lib/cards';

// Tap business card profile page, built from the "Profile page — /card/jerrell" artboard
// on the Tap Business Card canvas in Claude Design. Opened from a Wallet pass QR code or
// an NFC tap via /t/[slug]. It is a contact screen, not a search page: noindex, kept out
// of the sitemap, and shown without the site nav and footer (see SiteChrome).

export const dynamicParams = false;

export function generateStaticParams() {
  return getCards().map((card) => ({ slug: card.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) return {};
  return {
    title: { absolute: `${card.name}, ${card.organisation}` },
    description: `${card.title}. ${card.tagline}`,
    robots: { index: false, follow: false },
  };
}

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) notFound();

  return (
    <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col gap-6 px-5 pb-6 pt-7 text-ink">
      <div className="flex justify-center">
        <Logo height={24} />
      </div>

      <div className="flex flex-col items-center gap-2.5 text-center">
        <Image
          src={card.photo.src}
          alt={card.photo.alt}
          width={112}
          height={112}
          priority
          className="h-28 w-28 rounded-full bg-surface object-cover"
        />
        <div className="flex flex-col items-center gap-0.5">
          <h1 className="font-heading text-28 font-semibold">{card.name}</h1>
          <p className="text-17 text-muted">{card.title}</p>
        </div>
        <p className="max-w-[300px] text-14 text-muted">{card.tagline}</p>
      </div>

      <a
        href={`/card/${card.slug}/vcard`}
        download
        className="flex h-[50px] items-center justify-center gap-2 rounded-full bg-cyan text-17 text-on-accent transition hover:bg-cyan-hover active:scale-[0.97] active:bg-cyan-press"
      >
        <CardIcon name="download" size={20} />
        {card.saveLabel}
      </a>

      <ul className="flex flex-col overflow-hidden rounded-card bg-surface">
        {card.contacts.map((contact) => (
          <li key={contact.kind} className="border-b border-line last:border-b-0">
            <a
              href={contact.href}
              className="flex min-h-[44px] items-center gap-3.5 px-4 py-3.5 transition hover:bg-surface-hover"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent">
                <CardIcon name={contact.kind} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-17">{contact.label}</span>
                <span className="truncate text-14 text-muted">{contact.value}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <ul className="flex justify-center gap-3">
        {card.socials.map((social) => (
          <li key={social.kind}>
            <a
              href={social.href}
              aria-label={social.label}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent-soft text-accent transition active:scale-[0.97]"
            >
              <SocialIcon label={social.label} size={22} />
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-auto text-center text-12 text-muted">{card.footer}</p>
    </div>
  );
}
