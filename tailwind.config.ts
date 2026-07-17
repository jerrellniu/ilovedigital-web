import type { Config } from 'tailwindcss';

// Design tokens are the single source of truth for the brand, mirrored from the
// canonical Design System doc (dark theme, from the live site). Change them here.
const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#161923',      // main page background
        deep: '#0C0E13',      // alternating dark sections / CTA bands
        surface: '#2C2F3A',   // cards and panels
        cyan: '#1CBFD4',      // primary accent: CTAs, links, badges
        purple: '#C084FC',    // secondary accent: one highlighted word only
        ink: '#FFFFFF',       // primary text
        muted: '#BBBBBB',     // secondary text
        faint: '#8E9099',     // tertiary text, captions
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
};

export default config;
