import type { Metadata } from 'next';
import ServicePageView from '@/components/ServicePageView';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { getServicePage } from '@/lib/content';
import { serviceSchema } from '@/lib/schema';

const content = getServicePage('websites-wordpress');

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  alternates: { canonical: '/websites/wordpress' },
};

export default function WebsitesWordpressPage() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Websites', path: '/websites' },
          { name: 'WordPress websites', path: '/websites/wordpress' },
        ]}
      />
      <JsonLd
        data={serviceSchema({
          name: content.meta.title,
          serviceType: 'WordPress website design',
          description: content.meta.description,
          path: '/websites/wordpress',
        })}
      />
      <ServicePageView content={content} />
    </>
  );
}
