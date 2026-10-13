import Image from 'next/image';
import { AppleCard, GoogleCard } from '@/components/products/WalletCardsSection';
import { BrowserFrame, ModulesPanel } from '@/components/products/PluginSection';
import type { PluginShowcase, WalletSampleCard } from '@/types/content';

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
