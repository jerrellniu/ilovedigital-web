import type { Metadata } from 'next';
import ServicePageView from '@/components/ServicePageView';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { getServicePage } from '@/lib/content';
import { serviceSchema } from '@/lib/schema';

const content = getServicePage('websites-redesign');

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  alternates: { canonical: '/websites/redesign' },
};

export default function WebsitesRedesignPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Websites', path: '/websites' },
          { name: 'Website redesign', path: '/websites/redesign' },
        ]}
      />
      <JsonLd
        data={serviceSchema({
          name: content.meta.title,
          serviceType: 'Website redesign',
          description: content.meta.description,
          path: '/websites/redesign',
        })}
      />
      <ServicePageView content={content} />
    </>
  );
}
