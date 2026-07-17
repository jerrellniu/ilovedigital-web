import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CookieNotice from '@/components/CookieNotice';
import { getSite } from '@/lib/content';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
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
    <html lang="en-AU" className={`${jakarta.variable} ${inter.variable}`}>
      <body>
        <Nav site={site} />
        <main>{children}</main>
        <Footer site={site} />
        <CookieNotice text={site.cookieNotice} />
      </body>
    </html>
  );
}
