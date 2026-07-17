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

export interface SiteContent {
  name: string;
  tagline: string;
  phone: string;
  abn: string;
  email: string;
  location: string;
  socials: { label: string; href: string }[];
  nav: CtaLink[];
  services: CtaLink[];
  footer: {
    usefulLinks: CtaLink[];
    resources: CtaLink[];
    resourcesNote?: string;
  };
  legal: CtaLink[];
  cookieNotice: string;
}

export interface HeroBlock {
  eyebrow?: string;
  heading: string;
  sub: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Pillar {
  key: 'websites' | 'search' | 'social' | 'ai';
  name: string;
  heading: string;
  oneLiner: string;
  bullets: string[];
  href: string;
}

export interface CaseStudyCardData {
  client: string;
  tag: string;
  headline: string;
  outcome: string;
  href: string;
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
  founder: { eyebrow: string; heading: string; paragraphs: string[]; cta: CtaLink };
  process: { eyebrow: string; heading: string; sub: string; steps: ProcessStep[]; cta: CtaLink };
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
  relatedWork?: CaseStudyCardData | null;
  relatedWorkNote?: string;
  faq: Faq[];
  ctaBand: { heading: string; button: CtaLink };
}
