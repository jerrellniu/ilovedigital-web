import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import Markdown from '@/components/Markdown';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getLegal } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for the I Love Digital website and services.',
};

const body = getLegal('terms');

export default function TermsPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'Home', path: '/' }, { name: 'Terms of Use', path: '/terms' }]} />
      <LegalPage title="Terms of Use" lastUpdated="TBC — confirm before publishing">
        <Markdown>{body}</Markdown>
      </LegalPage>
    </>
  );
}
