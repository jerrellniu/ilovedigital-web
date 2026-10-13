import Image from 'next/image';
import Button from '@/components/Button';
import ProductFeatures from '@/components/products/ProductFeatures';
import type { PluginShowcase, ProductFeature } from '@/types/content';

/** A light browser frame around a screenshot. */
function BrowserFrame({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-float">
      <div aria-hidden="true" className="flex h-9 items-center gap-1.5 border-b border-[#D2D2D7] bg-[#F5F5F7] px-3.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#D2D2D7]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#D2D2D7]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#D2D2D7]" />
        {label && (
          <span className="ml-4 flex h-5 flex-1 items-center rounded-md bg-white px-2.5 text-12 text-[#6E6E73]">{label}</span>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * A recreation of the plugin's Modules screen in wp-admin: the dark branded
 * header, the plugin menu and one switch per feature. Drawn as markup so it
 * shows sample settings, never a client's real dashboard.
 */
function ModulesPanel({ panel }: { panel: PluginShowcase['panel'] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#D2D2D7] bg-white text-[#1D1D1F] shadow-float">
      <div className="flex items-center gap-2.5 bg-[#1D1D1F] px-4 py-3 text-[#F5F5F7]">
        <Image src="/icon.svg" alt="" width={20} height={20} unoptimized />
        <span className="text-14 font-semibold">{panel.title}</span>
        <span className="ml-auto rounded-full bg-cyan px-2.5 py-0.5 text-12 font-semibold text-on-accent">{panel.badge}</span>
      </div>
      <div className="flex">
        <ul className="hidden w-32 shrink-0 flex-col bg-[#F5F5F7] py-3 text-12 sm:flex">
          {panel.menu.map((m) => (
            <li
              key={m}
              className={m === panel.active ? 'bg-white px-3.5 py-1.5 font-semibold text-[#127A88]' : 'px-3.5 py-1.5'}
            >
              {m}
            </li>
          ))}
        </ul>
        <div className="min-w-0 flex-1 px-4 py-4">
          <p className="mb-2 text-14 font-semibold">{panel.heading}</p>
          <ul>
            {panel.modules.map((m) => (
              <li key={m.label} className="flex items-center justify-between gap-3 border-t border-[#E8E8ED] py-2 text-14">
                <span>{m.label}</span>
                <span className="sr-only">{m.on ? 'On' : 'Off'}</span>
                <span
                  aria-hidden="true"
                  className={`relative h-5 w-[34px] shrink-0 rounded-full ${m.on ? 'bg-cyan' : 'bg-[#86868B]'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white ${m.on ? 'left-4' : 'left-0.5'}`} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Home product section: custom WordPress plugins, shown on the HQ build with sample text. */
export default function PluginSection({
  product,
  bookingHref,
}: {
  product: ProductFeature & { showcase: PluginShowcase };
  bookingHref: string;
}) {
  const { showcase } = product;
  return (
    <section id="custom-plugins" className="container-wide section-y">
      <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <span className="eyebrow">{product.eyebrow}</span>
          <h2 className="text-28 md:text-40 lg:text-48">{product.heading}</h2>
        </div>
        <div>
          <p className="text-21 text-muted">{product.sub}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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
      </div>

      <figure className="mt-14">
        <div className="rounded-panel bg-deep p-5 sm:p-10">
          <div className="grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
            <BrowserFrame label={showcase.mainLabel}>
              <Image
                src={showcase.mainImage}
                alt={showcase.mainImageAlt}
                width={1600}
                height={1437}
                sizes="(min-width: 1024px) 680px, 100vw"
                className="h-[360px] w-full object-cover object-top sm:h-[560px]"
              />
            </BrowserFrame>
            <div className="flex flex-col gap-6">
              <ModulesPanel panel={showcase.panel} />
              <div className="hidden lg:block">
                <BrowserFrame>
                  <Image
                    src={showcase.sideImage}
                    alt={showcase.sideImageAlt}
                    width={1600}
                    height={1562}
                    sizes="420px"
                    className="h-[300px] w-full object-cover object-top"
                  />
                </BrowserFrame>
              </div>
            </div>
          </div>
        </div>
        <figcaption className="mt-3 text-14 text-muted">{product.caption}</figcaption>
      </figure>

      <ProductFeatures product={product} />
    </section>
  );
}
