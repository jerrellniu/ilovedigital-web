import Image from 'next/image';
import { AppleCard, GoogleCard } from '@/components/products/WalletCardsSection';
import { BrowserFrame, ModulesPanel } from '@/components/products/PluginSection';
import type { MetricsShowcase, PluginShowcase, SlideShowcase, WalletSampleCard } from '@/types/content';

/** Hero slide visual: the Vipers cards on Apple Wallet and Google Wallet over a club photo. */
export function WalletStage({ card }: { card: WalletSampleCard }) {
  return (
    <div className="relative min-h-[580px] overflow-hidden rounded-[22px] bg-surface sm:min-h-[540px]">
      <Image
        src={card.photo}
        alt={card.photoAlt}
        fill
        priority
        sizes="(min-width: 1024px) 600px, 100vw"
        className="object-cover opacity-60"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/40" />
      <div className="absolute left-7 top-20 hidden -rotate-6 sm:block">
        <GoogleCard card={card} />
      </div>
      <div className="absolute left-1/2 top-6 -translate-x-1/2 sm:left-auto sm:right-9 sm:top-10 sm:translate-x-0 sm:rotate-3">
        <AppleCard card={card} />
      </div>
    </div>
  );
}

/** Hero slide visual: the plugin's course catalogue with its Modules screen on top. */
export function PluginStage({ showcase }: { showcase: PluginShowcase }) {
  return (
    <div className="relative min-h-[480px] sm:min-h-[540px]">
      <div className="absolute left-0 top-0 w-full sm:w-[84%]">
        <BrowserFrame label={showcase.mainLabel}>
          <Image
            src={showcase.mainImage}
            alt={showcase.mainImageAlt}
            width={1600}
            height={1437}
            priority
            sizes="(min-width: 1024px) 520px, 100vw"
            className="h-[300px] w-full object-cover object-top sm:h-[420px]"
          />
        </BrowserFrame>
      </div>
      <div className="absolute bottom-0 right-0 w-full max-w-[380px]">
        <ModulesPanel panel={showcase.panel} />
      </div>
    </div>
  );
}

/**
 * A Search Console style results panel, drawn as markup from a client's real
 * figures. It names no site, URL or query, so the client stays anonymous.
 */
function MetricsPanel({ showcase }: { showcase: MetricsShowcase }) {
  const { chart } = showcase;
  const max = Math.max(...chart.points.map((p) => p.value));
  const last = chart.points.length - 1;
  return (
    <div className="overflow-hidden rounded-xl border border-[#D2D2D7] bg-white text-[#1D1D1F] shadow-float">
      <div className="flex items-center gap-2.5 bg-[#1D1D1F] px-4 py-3 text-[#F5F5F7]">
        <span className="text-14 font-semibold">{showcase.title}</span>
        <span className="ml-auto rounded-full bg-cyan px-2.5 py-0.5 text-12 font-semibold text-on-accent">
          {showcase.period}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-px bg-[#E8E8ED] sm:grid-cols-4">
        {showcase.metrics.map((m) => (
          <div key={m.label} className="bg-white px-4 py-3">
            <dt className="text-12 text-[#6E6E73]">{m.label}</dt>
            <dd className="mt-1 text-21 font-semibold leading-none">{m.value}</dd>
            <dd className="mt-1.5 text-12 font-semibold text-[#127A88]">{m.change}</dd>
          </div>
        ))}
      </dl>
      <figure className="border-t border-[#E8E8ED] px-4 pb-4 pt-3">
        <figcaption className="text-12 text-[#6E6E73]">{chart.title}</figcaption>
        <div aria-hidden="true" className="mt-3 flex h-24 items-end gap-6 border-b border-[#D2D2D7] px-2 sm:h-28">
          {chart.points.map((p, i) => (
            <div
              key={p.label}
              title={`${p.label}: ${p.value.toLocaleString('en-AU')} clicks`}
              className="flex h-full flex-1 flex-col items-center justify-end"
            >
              {i === last && (
                <span className="mb-1 text-12 font-semibold">{p.value.toLocaleString('en-AU')}</span>
              )}
              <span
                className="w-full max-w-[56px] rounded-t bg-[#127A88]"
                style={{ height: `${(p.value / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div aria-hidden="true" className="flex gap-6 px-2 pt-1.5">
          {chart.points.map((p) => (
            <span key={p.label} className="flex-1 text-center text-12 text-[#6E6E73]">
              {p.label}
            </span>
          ))}
        </div>
        <table className="sr-only">
          <caption>{chart.title}</caption>
          <tbody>
            {chart.points.map((p) => (
              <tr key={p.label}>
                <th scope="row">{p.label}</th>
                <td>{p.value.toLocaleString('en-AU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </div>
  );
}

/**
 * Hero slide visual for a service: real client evidence (a screenshot in a browser
 * frame, or a results panel) with the proof line on a card over its corner. Laid
 * out like PluginStage so every slide in the slider shares one shape. On phones the
 * card sits under the evidence instead of over it, so nothing is covered.
 */
export function ProofStage({ showcase }: { showcase: SlideShowcase }) {
  return (
    <div
      className={`flex flex-col gap-4 sm:relative sm:block ${
        showcase.kind === 'metrics' ? 'sm:min-h-[540px]' : 'sm:min-h-[440px]'
      }`}
    >
      <div className="w-full sm:absolute sm:left-0 sm:top-0 sm:w-[88%]">
        {showcase.kind === 'metrics' ? (
          <MetricsPanel showcase={showcase} />
        ) : (
          <BrowserFrame label={showcase.frameLabel}>
            <Image
              src={showcase.image}
              alt={showcase.imageAlt}
              width={1200}
              height={750}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="h-auto w-full"
            />
          </BrowserFrame>
        )}
      </div>
      <div className="w-full rounded-xl sm:absolute sm:bottom-0 sm:right-0 sm:max-w-[320px] border border-[#D2D2D7] bg-white px-5 py-5 text-[#1D1D1F] shadow-float">
        <p className="text-12 font-semibold uppercase tracking-wide text-[#127A88]">Result</p>
        <p className="mt-2 text-21 font-semibold leading-snug">{showcase.result}</p>
        <p className="mt-2 text-14 text-[#6E6E73]">{showcase.source}</p>
      </div>
    </div>
  );
}
