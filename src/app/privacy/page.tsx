import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import Markdown from '@/components/Markdown';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getLegal } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How I Love Digital collects, uses, stores and protects the personal information you share through this website and our services.',
  alternates: { canonical: '/privacy' },
};

const body = getLegal('privacy');

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }]} />
      <LegalPage title="Privacy Policy" lastUpdated="21 October 2026">
        <Markdown>{body}</Markdown>
      </LegalPage>
    </>
  );
}
