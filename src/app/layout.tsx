import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CookieNotice from '@/components/CookieNotice';
import SiteChrome from '@/components/SiteChrome';
import { Analytics } from '@vercel/analytics/next';
import MetaPixel from '@/components/MetaPixel';
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
    default: 'Gold Coast Websites, SEO and Social Media | I Love Digital',
    template: '%s | I Love Digital',
  },
  description:
    'Websites that turn visitors into calls, SEO and AI search that gets you found, and organic socials, for Gold Coast and Queensland small businesses.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const site = getSite();
  return (
    <html lang="en-AU" className={inter.variable}>
      <body>
        <SiteChrome>
          <Nav site={site} />
        </SiteChrome>
        <main>{children}</main>
        <SiteChrome>
          <Footer site={site} />
        </SiteChrome>
        <CookieNotice text={site.cookieNotice} />
        <Analytics />
        <MetaPixel />
      </body>
    </html>
  );
}
