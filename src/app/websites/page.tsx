import type { Metadata } from 'next';
import ServicePageView from '@/components/ServicePageView';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getServicePage } from '@/lib/content';

const content = getServicePage('websites');

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
};

export default function WebsitesPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Websites', path: '/websites' }]} />
      <ServicePageView content={content} />
    </>
  );
}
