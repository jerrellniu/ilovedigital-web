import { FeatureIcon } from '@/components/Icons';
import type { ProductFeature } from '@/types/content';

/**
 * The two lower blocks of a product section: four feature cards, then the
 * "other uses" list. Colours come from theme variables, so the same markup
 * works inside the dark band and on a light section.
 */
export default function ProductFeatures({ product }: { product: ProductFeature }) {
  return (
    <>
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {product.features.map((f) => (
          <div key={f.title} className="flex flex-col gap-4 rounded-card bg-surface p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan text-on-accent">
              <FeatureIcon name={f.icon} />
            </span>
            <h3 className="text-21">{f.title}</h3>
            <p className="text-17 text-muted">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <div className="max-w-[720px]">
          <h3 className="text-28 md:text-40">{product.uses.heading}</h3>
          <p className="mt-3 text-21 text-muted">{product.uses.sub}</p>
        </div>
        <ul className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {product.uses.items.map((u) => (
            <li key={u.title} className="border-t border-line pt-5">
              <h4 className="text-21">{u.title}</h4>
              <p className="mt-2 text-17 text-muted">{u.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
