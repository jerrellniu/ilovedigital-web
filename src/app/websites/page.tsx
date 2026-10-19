import type { Metadata } from 'next';
import ServicePageView from '@/components/ServicePageView';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { getServicePage } from '@/lib/content';
import { serviceSchema } from '@/lib/schema';

const content = getServicePage('websites');

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  alternates: { canonical: '/websites' },
};

export default function WebsitesPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Websites', path: '/websites' }]} />
      <JsonLd
        data={serviceSchema({
          name: content.meta.title,
          serviceType: 'Website design',
          description: content.meta.description,
          path: '/websites',
        })}
      />
      <ServicePageView content={content} />
    </>
  );
}
