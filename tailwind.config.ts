import type { Config } from 'tailwindcss';

// Design tokens are the single source of truth for the brand, mirrored from the
// canonical Design System doc (dark theme, from the live site). Change them here.
const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    // The eight-step type scale from the I Love Digital Design System, and nothing
    // else. Defined at theme level (not extend) so Tailwind's default sizes
    // (text-sm, text-lg, text-2xl ...) and one-off text-[...] values have no place
    // to live. Fluid headings step between two of these sizes at a breakpoint
    // (e.g. `text-28 md:text-36 lg:text-48`) instead of using clamp().
    fontSize: {
      '12': ['0.75rem', { lineHeight: '1.5' }],
      '14': ['0.875rem', { lineHeight: '1.5' }],
      '16': ['1rem', { lineHeight: '1.6' }],
      '20': ['1.25rem', { lineHeight: '1.5' }],
      '28': ['1.75rem', { lineHeight: '1.2' }],
      '36': ['2.25rem', { lineHeight: '1.15' }],
      '48': ['3rem', { lineHeight: '1.1' }],
      '64': ['4rem', { lineHeight: '1.05' }],
    },
    extend: {
      // Motion from the design system: quick and calm, no bounce. `transition`
      // with no modifiers picks up the DEFAULT curve and duration.
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        fast: '120ms',
        slow: '360ms',
      },
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
        content: '1320px',
      },
    },
  },
  plugins: [],
};

export default config;
