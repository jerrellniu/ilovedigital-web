import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CookieNotice from '@/components/CookieNotice';
import { Analytics } from '@vercel/analytics/next';
import { getSite } from '@/lib/content';

// Inter is the self-hosted fallback for SF Pro. Apple devices render SF Pro from the
// system font stack in globals.css; everyone else gets Inter.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ilovedigital.com.au'),
  title: {
    default: 'I Love Digital — Websites and AI Search for Queensland Businesses',
    template: '%s | I Love Digital',
  },
  description:
    'People-first Queensland digital studio. Modern websites, AI search and SEO, social, and AI consulting for trades and service businesses.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const site = getSite();
  return (
    <html lang="en-AU" className={inter.variable}>
      <body>
        <Nav site={site} />
        <main>{children}</main>
        <Footer site={site} />
        <CookieNotice text={site.cookieNotice} />
        <Analytics />
      </body>
    </html>
  );
}
