import type { Metadata } from 'next';
import ServicePageView from '@/components/ServicePageView';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { getServicePage } from '@/lib/content';
import { serviceSchema } from '@/lib/schema';

const content = getServicePage('websites-ecommerce');

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  alternates: { canonical: '/websites/ecommerce' },
};

export default function WebsitesEcommercePage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Websites', path: '/websites' },
          { name: 'Ecommerce websites', path: '/websites/ecommerce' },
        ]}
      />
      <JsonLd
        data={serviceSchema({
          name: content.meta.title,
          serviceType: 'Ecommerce website design',
          description: content.meta.description,
          path: '/websites/ecommerce',
        })}
      />
      <ServicePageView content={content} />
    </>
  );
}
