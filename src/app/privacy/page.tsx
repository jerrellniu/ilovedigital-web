import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import Markdown from '@/components/Markdown';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getLegal } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for the I Love Digital website and services.',
};

const body = getLegal('privacy');

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }]} />
      <LegalPage title="Privacy Policy" lastUpdated="TBC — confirm before publishing">
        <Markdown>{body}</Markdown>
      </LegalPage>
    </>
  );
}
