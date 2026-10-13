import type { Config } from 'tailwindcss';

// Design tokens mirror the I Love Digital Design System (Claude Design, restyled after
// apple.com/au in October 2026): light by default, with a dark theme for dark sections.
// Colours are CSS variables (set in globals.css) so the same class flips with the theme:
// `bg-base` is white in a light section and black inside `data-theme="dark"`.
const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    // The eight-step type scale from the design system, and nothing else. Defined at
    // theme level (not extend) so Tailwind's default sizes and one-off text-[...] values
    // have no place to live. Fluid headings step between two of these sizes at a
    // breakpoint (e.g. `text-28 md:text-40`) instead of using clamp().
    fontSize: {
      '12': ['0.75rem', { lineHeight: '1.33337', letterSpacing: '-0.01em' }],
      '14': ['0.875rem', { lineHeight: '1.42859', letterSpacing: '-0.016em' }],
      '17': ['1.0625rem', { lineHeight: '1.47059', letterSpacing: '-0.0037em' }],
      '21': ['1.3125rem', { lineHeight: '1.33', letterSpacing: '0.011em' }],
      '28': ['1.75rem', { lineHeight: '1.14286', letterSpacing: '0.007em' }],
      '40': ['2.5rem', { lineHeight: '1.1', letterSpacing: '0em' }],
      '48': ['3rem', { lineHeight: '1.08349', letterSpacing: '-0.003em' }],
      '64': ['4rem', { lineHeight: '1.0625', letterSpacing: '-0.009em' }],
    },
    extend: {
      // Motion from the design system: quick and calm, no bounce. `transition` with no
      // modifiers picks up the DEFAULT curve and duration.
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        fast: '120ms',
        slow: '360ms',
      },
      colors: {
        base: v('bg-base'),             // page background: white (dark: black)
        deep: v('bg-deep'),             // alternating sections, footer: #F5F5F7 (dark: #161617)
        surface: v('surface'),          // cards, panels, inputs
        'surface-hover': v('surface-hover'),
        line: v('line'),                // hairlines, input borders
        ink: v('ink'),                  // headlines and primary text
        muted: v('muted'),              // body and secondary text
        faint: v('faint'),              // captions only: under 4.5:1 on light grounds
        accent: v('accent-text'),       // cyan as TEXT, links, ticks, outline buttons
        purple: v('accent-2'),          // one highlighted word only, never a fill
        cyan: {
          DEFAULT: '#1CBFD4',           // cyan as a FILL: primary buttons, badges
          hover: '#33CBDE',
          press: '#17A6B8',
        },
        'on-accent': '#06222A',         // text and icons on a cyan fill (7.44:1)
        'accent-soft': 'var(--accent-soft)',
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
      maxWidth: {
        content: '1200px',              // card grids (container-wide)
        text: '980px',                  // text-led sections
      },
      borderRadius: {
        card: '18px',                   // cards and panels
        panel: '28px',                  // large panels, CTA band, modals
      },
      boxShadow: {
        'card-hover': 'var(--shadow-card-hover)',
        float: 'var(--shadow-float)',
      },
      height: {
        nav: '44px',
      },
    },
  },
  plugins: [],
};

export default config;
