import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { getSite } from '@/lib/content';

// Share image for the home page (og:image and twitter:image), generated at build.
// It uses only design system assets: the light-ground logo lockup from public/logo.svg,
// the tagline from content/site.json, `base` white and `ink` text.

const site = getSite();

export const alt = `${site.name}. ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  const logo = readFileSync(join(process.cwd(), 'public', 'logo.svg'));
  const logoSrc = `data:image/svg+xml;base64,${logo.toString('base64')}`;
  // The lockup's viewBox is 3787.8 x 978.5.
  const logoWidth = 760;
  const logoHeight = Math.round((logoWidth * 978.5) / 3787.8);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          gap: 56,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={logoWidth} height={logoHeight} alt="" />
        <div style={{ fontSize: 48, fontWeight: 600, color: '#1D1D1F', letterSpacing: -0.5 }}>
          {site.tagline}
        </div>
      </div>
    ),
    size,
  );
}
