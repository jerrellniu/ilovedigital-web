import Image from 'next/image';
import Button from '@/components/Button';
import ProductFeatures from '@/components/products/ProductFeatures';
import type { ProductFeature, WalletSampleCard } from '@/types/content';

// The card faces use the club's own pass colours, not site tokens: the flat
// Vipers purple, white values and lavender labels (4.55:1 on the purple), as
// set in the Membership Card Wallet Pass Design Spec v2.
const CARD = 'bg-[#6E2C91] text-white';
const LABEL = 'text-12 font-semibold tracking-[0.06em] text-[#CEB2E0]';

export function AppleCard({ card }: { card: WalletSampleCard }) {
  return (
    <div className={`${CARD} flex w-[300px] flex-col gap-4 rounded-[20px] p-5 shadow-float sm:w-[330px]`}>
      <div className="flex items-start justify-between gap-3">
        <Image src={card.logo} alt={card.logoAlt} width={150} height={47} className="h-[47px] w-[150px] object-contain object-left" />
        <div className="flex flex-col items-end gap-0.5">
          <span className={LABEL}>VALID FOR</span>
          <span className="text-28 font-semibold leading-none">{card.validFor}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className={LABEL}>MEMBER</span>
          <span className="text-28 font-medium leading-tight">
            {card.firstName}
            <br />
            {card.lastName}
          </span>
        </div>
        <span
          aria-hidden="true"
          className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[10px] bg-[#8B4FB3] text-28 font-semibold"
        >
          {card.initials}
        </span>
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col gap-0.5">
          <span className={LABEL}>YEAR OF BIRTH</span>
          <span className="text-21 font-semibold">{card.yearOfBirth}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className={LABEL}>JERSEY</span>
          <span className="text-21 font-semibold">{card.jersey}</span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className={LABEL}>AGE DIVISION</span>
        <span className="text-21 font-semibold">{card.division}</span>
      </div>
      <div className="mt-1 flex self-center rounded-[14px] bg-white p-3.5">
        <Image src={card.qr} alt="Sample QR code" width={112} height={112} unoptimized />
      </div>
    </div>
  );
}

export function GoogleCard({ card }: { card: WalletSampleCard }) {
  return (
    <div className={`${CARD} flex w-[280px] flex-col gap-3.5 rounded-[22px] p-[18px] shadow-float`} aria-hidden="true">
      <div className="flex items-center gap-2.5">
        <Image src={card.mark} alt="" width={34} height={34} className="rounded-full bg-white" />
        <span className="text-14 font-medium">{card.club}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-12 text-[#CEB2E0]">Valid for {card.validFor}</span>
        <span className="text-21 font-medium">
          {card.firstName} {card.lastName}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ['Year of birth', card.yearOfBirth],
          ['Jersey', card.jersey],
          ['Age division', card.division],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-12 text-[#CEB2E0]">{label}</span>
            <span className="text-14 font-semibold">{value}</span>
          </div>
        ))}
      </div>
      <div className="flex self-center rounded-xl bg-white p-2.5">
        <Image src={card.qr} alt="" width={76} height={76} unoptimized />
      </div>
    </div>
  );
}

/** Home product section: Apple Wallet and Google Wallet member cards. A dark feature band. */
export default function WalletCardsSection({
  product,
  bookingHref,
}: {
  product: ProductFeature & { card: WalletSampleCard };
  bookingHref: string;
}) {
  const { card } = product;
  return (
    <section id="member-cards" data-theme="dark" className="section-dark">
      <div className="container-wide section-y">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <span className="eyebrow">{product.eyebrow}</span>
            <h2 className="text-28 md:text-40 lg:text-48">{product.heading}</h2>
            <p className="mt-5 text-21 text-muted">{product.sub}</p>
            {product.chips && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {product.chips.map((c) => (
                  <li key={c} className="rounded-full bg-surface px-3.5 py-1.5 text-14 text-ink">
                    {c}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={bookingHref} size="lg">
                {product.bookingLabel}
              </Button>
              {product.secondaryCta && (
                <Button href={product.secondaryCta.href} size="lg" variant="outline">
                  {product.secondaryCta.label}
                </Button>
              )}
            </div>
          </div>

          <figure>
            <div className="relative min-h-[620px] overflow-hidden rounded-panel bg-surface">
              <Image
                src={card.photo}
                alt={card.photoAlt}
                fill
                sizes="(min-width: 1024px) 620px, 100vw"
                className="object-cover opacity-60"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-black/40" />
              <div className="absolute left-8 top-24 hidden -rotate-6 opacity-95 sm:block">
                <GoogleCard card={card} />
                <span className="mt-3 block text-12 text-white/80">Google Wallet</span>
              </div>
              <div className="absolute left-1/2 top-10 -translate-x-1/2 sm:left-auto sm:right-10 sm:top-14 sm:translate-x-0 sm:rotate-3">
                <AppleCard card={card} />
                <span className="mt-3 block text-right text-12 text-white/80">Apple Wallet</span>
              </div>
            </div>
            <figcaption className="mt-3 text-14 text-muted">{product.caption}</figcaption>
          </figure>
        </div>

        <ProductFeatures product={product} />
      </div>
    </section>
  );
}
