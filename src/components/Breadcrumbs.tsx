import JsonLd from './JsonLd';
import { breadcrumbSchema } from '@/lib/schema';

// Emits BreadcrumbList JSON-LD only (no visual trail) so page layouts are unchanged.
export default function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  return <JsonLd data={breadcrumbSchema(trail)} />;
}
