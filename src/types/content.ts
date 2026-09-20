// Typed shapes for the JSON content files. Every page's copy is validated against
// one of these shapes so the build fails loudly if a content file drifts.

export interface CtaLink {
  label: string;
  href: string;
}

export interface Faq {
  question: string;
  answer: string;
}

/**
 * A Google Calendar appointment schedule. `href` is the public booking page,
 * `embedUrl` is the same URL with `?gv=true` so it renders inside an iframe.
 * Both are stored rather than derived, so a schedule that needs a different
 * query string later does not require a code change.
 */
export interface BookingSchedule {
  label: string;
  href: string;
  embedUrl: string;
}

/**
 * A platform partnership or developer-program membership, shown in the marquee under
 * the stats bar. `icon` names an entry in TOOL_LOGOS; it is omitted where the owner's
 * trademark guidelines do not permit a third party to display the mark, so those
 * render as a wordmark.
 */
export interface Partner {
  name: string;
  icon?: string;
}

export interface SiteContent {
  name: string;
  tagline: string;
  phone: string;
  abn: string;
  email: string;
  location: string;
  booking: CtaLink;
  schedules: {
    discovery15: BookingSchedule;
    meeting30: BookingSchedule;
  };
  socials: { label: string; href: string }[];
  nav: CtaLink[];
  services: CtaLink[];
  footer: {
    /** Footer link columns, rendered in order. */
    groups: { heading: string; links: CtaLink[] }[];
  };
  legal: CtaLink[];
  cookieNotice: string;
  /** Partnerships and memberships, in display order. */
  partners?: Partner[];
}

/** One run of a hero heading. `accent` paints it with a brand colour. */
export interface HeadingRun {
  text: string;
  /**
   * Cyan is the primary accent; purple is reserved for a single highlighted word,
   * per the design system.
   */
  accent?: 'cyan' | 'purple';
}

export interface HeroBlock {
  eyebrow?: string;
  heading: string;
  /**
   * The heading split into runs so its accent colours live in content, not in JSX.
   * Joining the runs must reproduce `heading` exactly; the loader enforces that, so
   * the flat string used by metadata and schema can never drift from what renders.
   * Omit it and the heading renders flat.
   */
  headingParts?: HeadingRun[];
  sub: string;
  image?: string;
  imageAlt?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
}

export interface Stat {
  value: string;
  /** The outcome the number describes, e.g. "more visits from Google". */
  label: string;
  /**
   * Who the number belongs to. An attributed figure is evidence; an unattributed one
   * is a boast, so every client result carries its source.
   */
  source?: string;
}

export interface Pillar {
  key: 'websites' | 'search' | 'social' | 'consulting';
  name: string;
  heading: string;
  oneLiner: string;
  bullets: string[];
  href: string;
}

export interface CaseStudyCardData {
  client: string;
  /**
   * What the card leads with. The service, not the client — "Custom Shopify design"
   * rather than "Trigahex". Falls back to `client` when absent. The client name still
   * lives in `client` and is what the case study page, breadcrumb and metadata use.
   */
  service?: string;
  tag: string;
  headline: string;
  /** Supporting line under the headline. Omitted when the headline says it all. */
  outcome?: string;
  /**
   * Always set in the content files. Cleared at load time by the loaders in
   * `src/lib/content.ts` when the linked case study isn't published, so the card
   * renders unlinked instead of pointing at a 404.
   */
  href?: string;
  /** 16:10 thumbnail under public/. Falls back to the gradient placeholder when absent. */
  image?: string;
  /**
   * Alt text for `image`. Defaults to "<client> website" — set this whenever the
   * thumbnail is not a website screenshot (a social feed, brand collateral, print).
   */
  imageAlt?: string;
  /** Build platform (Shopify, WordPress, NextJS, Wix, Squarespace). Pill is omitted when absent. */
  platform?: string;
}

export interface Testimonial {
  quote: string;
  author: string;
}

export interface ProcessStep {
  title: string;
  body: string;
}

export interface HomeContent {
  meta: { title: string; description: string };
  hero: HeroBlock;
  stats: Stat[];
  pillarsIntro: { eyebrow: string; heading: string; sub: string };
  pillars: Pillar[];
  featuredWork: { eyebrow: string; heading: string; sub: string; cards: CaseStudyCardData[]; footerCta: CtaLink };
  testimonials: { heading: string; sub: string; items: Testimonial[] };
  founder: {
    eyebrow: string;
    heading: string;
    image?: string;
    imageAlt?: string;
    paragraphs: string[];
    cta: CtaLink;
  };
  process: { eyebrow: string; heading: string; sub?: string; steps: ProcessStep[]; cta: CtaLink };
  audit: { heading: string; sub: string; button: string; belowLink: CtaLink };
  faq: { heading: string; items: Faq[] };
  finalCta: { heading: string; sub: string; button: CtaLink };
}

export interface ServicePageContent {
  meta: { title: string; description: string };
  hero: HeroBlock;
  included: { heading: string; items: string[] };
  platforms?: { label: string; items: string[] };
  note?: string;
  howItWorks?: string;
  /**
   * Pillar tag to pull case studies for, e.g. "Web". Matched against each card's
   * tag, which may be combined ("Web + Search"), so a combined project shows on
   * both pillar pages. Resolved from content/work/index.json at load time.
   */
  relatedWorkTag?: string;
  /** Resolved at load time from `relatedWorkTag`. Never set this in the JSON. */
  relatedWork?: CaseStudyCardData[];
  /** Shown when the tag matches nothing, so the section is never silently empty. */
  relatedWorkNote?: string;
  faq: Faq[];
  ctaBand: { heading: string; button: CtaLink };
}

/** One node on the author page career mindmap. Geometry comes from the approved design canvas. */
export interface ExperienceMapNode {
  id: string;
  /** What the circle shows and the card leads with. The industry, except on the one node that covers two. */
  primary: string;
  /** The role title, set below the industry in a lighter weight. Omitted where the primary is already the role. */
  secondary?: string;
  /** Position of the node wrapper on the 1440x900 canvas, in px. */
  x: number;
  y: number;
  /** Circle diameter in px. Area is proportional to years: diameter = 60 * sqrt(years). */
  size: number;
  /** Which side of the node its detail card opens on. */
  side: 'left' | 'right';
  /** One row per industry covered. `label` is omitted when the primary already names it. */
  rows: { label?: string; years: string }[];
  /** SVG path for the branch line from the centre node. */
  path: string;
  /** Length of that path, used for the draw and pulse dash animations. */
  len: number;
  /** Draw delay in ms. The node itself enters 500ms later. */
  delay: number;
  fromX: number;
  fromY: number;
}

export interface ExperienceMapData {
  nodes: ExperienceMapNode[];
}

/** Author page copy (/about/jerrell-niu). The Person schema is built from these same fields. */
export interface AuthorPageContent {
  meta: { title: string; description: string };
  slug: string;
  name: string;
  jobTitle: string;
  image?: string;
  imageAlt?: string;
  hero: { eyebrow: string; heading: string; sub: string };
  bio: { heading: string; paragraphs: string[] };
  /** The career mindmap. Omit it and the page renders the bio without a map. */
  experienceMap?: ExperienceMapData;
  expertise: { heading: string; items: { title: string; body: string }[] };
  experience: { heading: string; items: { role: string; detail: string }[] };
  articles: { heading: string; sub: string };
  /** Profiles that belong to the person, not the business. Emitted as Person sameAs. */
  sameAs: string[];
  /**
   * The button carries only its label. Its href is the booking link from
   * site.json, so the URL is written down once for the whole site.
   */
  finalCta: { heading: string; button: { label: string } };
}
