import type { Metadata } from 'next';
import ServicePageView from '@/components/ServicePageView';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getServicePage } from '@/lib/content';

const content = getServicePage('social');

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
};

export default function SocialPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Social', path: '/social' }]} />
      <ServicePageView content={content} />
    </>
  );
}
