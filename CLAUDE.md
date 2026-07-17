# CLAUDE.md — ilovedigital.com.au build conventions

Build brief and conventions for Claude Code working in this repo. This is the Next.js
rebuild of ilovedigital.com.au and the reference implementation of the agency's
**Website Design-to-Build SOP** (Notion). Read this before building.

## What this is

- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS. SSG by default.
- **Deploy target:** Vercel.
- **Source of truth:** Notion is the human source of truth for copy and structure;
  this repo is the code source of truth. Approved copy is synced from Notion into
  `content/` as JSON/MDX — never hardcode copy in components.

## Design system (do not drift)

Tokens live in `tailwind.config.ts` and mirror the canonical Design System doc
(dark theme, from the live site):

- Backgrounds: `base` #161923, `deep` #0C0E13 (alternating sections / CTA bands)
- Card surface: `surface` #2C2F3A (flat — no heavy shadows)
- Accents: `cyan` #1CBFD4 (primary), `purple` #C084FC (one highlighted word only)
- Text: `ink` #FFFFFF, `muted` #BBBBBB, `faint` #8E9099
- Fonts: `font-heading` (Plus Jakarta Sans), `font-body` (Inter) — no serif anywhere
- Buttons: primary filled cyan, 10px radius; secondary cyan outline; flat

The approved visual spec for Home is `mockups/home.html`. Build to match it.

## Content model

- Structured page copy → `content/pages/*.json`, typed by `src/types/content.ts`.
- Global site data (nav, footer, contact, socials) → `content/site.json`.
- Listings → `content/work/index.json`, `content/insights/index.json`.
- Long-form (case studies, blog posts) → MDX in `content/work/*.mdx`,
  `content/insights/*.mdx` (frontmatter + body).
- Loaders in `src/lib/content.ts` read from disk (no build-time Notion API call).

**Rule:** copy changes flow Notion → repo. If copy is wrong, fix it in Notion first,
then re-sync the content file. Don't edit copy only in the repo.

## Structure

```
content/            copy (JSON + MDX) — synced from Notion
src/app/            App Router routes (one folder per page)
src/components/     shared components (Nav, Footer, PillarCard, FaqAccordion, ...)
src/lib/            content loaders + JSON-LD schema builders
src/types/          typed content shapes
public/             robots.txt, llms.txt
mockups/            approved HTML mockups (visual spec)
redirects.json      301 map (old Squarespace → new), loaded by next.config.mjs
```

## Routes (sitemap)

Built: `/`, `/websites`, `/search`, `/social`, `/ai`, `/work`, `/about`,
`/insights`, `/contact`, `/audit`, `/terms`, `/privacy`, custom 404.

Four **standalone pillar pages** (`/websites`, `/search`, `/social`, `/ai`) replace the
old single `/services` page — confirmed architecture change. Update the Notion Sitemap
doc to match if not already done.

## GEO / AI-citation (non-negotiable, per the GEO strategy)

- FAQPage JSON-LD on every page with an FAQ (helper: `src/lib/schema.ts`). Already wired
  on Home and the four pillar pages via `<JsonLd data={faqPageSchema(...)} />`.
- LocalBusiness schema on Home. Add page-type schema (Article, BreadcrumbList) as pages
  are built out.
- `public/robots.txt` allows AI crawlers; `public/llms.txt` present.
- SSR/SSG only for primary content. Answer-first paragraphs + TL;DR blocks on articles.
- Freshness dates on articles.

## Definition of Done (per page)

- Visual parity with the approved mockup / Claude Design output, desktop + mobile.
- All copy sourced from `content/` — none hardcoded.
- FAQPage + correct page-type schema present and valid.
- SSR/SSG confirmed; Lighthouse/Core Web Vitals within target.
- Accessibility: logical headings, alt text, colour contrast.
- No pricing or dollar figures anywhere — pricing CTAs route to `/contact` (Get a free quote).

## What's done vs TODO

**Done (reference implementation):**
- Full scaffold, design tokens, shared components, layout with real footer.
- Home page — fully built to the mockup, content-driven.
- Four pillar pages — built via `ServicePageView`, content-driven, with FAQ schema.
- About, Work (filterable), Insights (filterable), Contact, Audit, Terms, Privacy, 404 —
  functional and content-driven; polish to match Claude Design outputs.

**TODO (Claude Code):**
1. ~~Wire the MDX pipeline and build `/work/[slug]` + `/insights/[slug]` templates.~~ **Done** —
   `src/lib/mdx.ts` (gray-matter) loads `content/work/*.mdx` and `content/insights/*.mdx`;
   `/work/[slug]` (Case Study Template) and `/insights/[slug]` (Blog Post Template, with
   Article schema) render via `generateStaticParams`. Add more `.mdx` files to publish more
   pages, and flesh out the example bodies. Note: bodies render as Markdown (via
   react-markdown); switch to full MDX/JSX components only if a post needs embedded React.
2. ~~Wire forms to MailerLite.~~ **Done** — all four forms (Home audit, `/audit` full form,
   `/contact` message, `/insights` newsletter) post to `POST /api/subscribe`, which adds the
   subscriber to a MailerLite group via `src/lib/mailerlite.ts`. The group triggers the
   automation (internal notification + auto-reply) in MailerLite. **Set env vars first** (see
   `.env.example`): `MAILERLITE_API_KEY` and `ML_GROUP_NEWSLETTER` / `ML_GROUP_AUDIT` /
   `ML_GROUP_CONTACT`. Without them the endpoint returns 501 (forms still render). Add these
   in Vercel → Project → Settings → Environment Variables. Build the matching MailerLite groups
   + automations. Contact "message" is stored on a `message` field — confirm that field exists.
3. Embed the Google Calendar 15-min appointment on `/contact` and `/audit`.
4. ~~Logo.~~ **Done** — `src/components/Logo.tsx` inlines the real supplied "i♡digital" vector;
   text paths use `currentColor` (white on the dark theme), the heart keeps its brand gradient.
   Original black vector at `public/logo.svg`. **Still TODO:** real imagery for case-study
   thumbnails and the founder/portrait placeholder blocks.
5. ~~Migrate Terms and Privacy copy.~~ **Done** — migrated verbatim from the live site into
   `content/legal/terms.md` and `privacy.md`, rendered at `/terms` and `/privacy`. **Review
   before publishing:** set the "Last updated" date, and confirm Australian Privacy Principles
   coverage (the migrated privacy policy is brief). Note `hello@ilovedigital.com.au` is the
   contact address in both.
6. ~~Add `sitemap.xml` and per-page BreadcrumbList schema.~~ **Done** — `src/app/sitemap.ts`
   generates `/sitemap.xml` from all routes + MDX slugs; `src/components/Breadcrumbs.tsx` emits
   BreadcrumbList JSON-LD on the pillar, Work, About, Insights, Contact, and both detail pages.
7. ~~Populate `redirects.json`.~~ **Done (core set)** — old Squarespace URLs mapped to new
   (`/portfolio`→`/work`, `/blog`→`/insights`, `/services`+`/web-design-services`+
   `/website-support`→`/websites`, `/discover-our-seo-services`+GBP→`/search`, legal slugs).
   **Still TODO:** per-blog-post redirects (`/blog/[old]`→`/insights/[new]`, needs the old
   slugs) and a migrate/refresh/sunset decision on the lead-magnet/resource pages before
   adding their redirects.
8. Resolve the AI pillar's missing case study before launch.

## Commands

```bash
npm install
npm run dev      # local dev at http://localhost:3000
npm run build    # production build (run before every PR — this is a Gate C check)
npm run lint
```

## Workflow

Per the SOP: build on a feature branch per page (`build/[page]`), open a PR, review the
Vercel preview against the mockup, then merge. Keep copy in Notion as the human source of
truth and re-sync content files when it changes.
