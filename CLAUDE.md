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

The source of truth is the **I Love Digital Design System** in Claude Design
(https://claude.ai/artifact/HK36nenWRsDwwEMjc9rDqU), restyled after apple.com/au in
October 2026. Read it before building. Tokens live in `tailwind.config.ts` and
`src/app/globals.css` and mirror it:

- **Themes:** light by default. Any element with `data-theme="dark"` switches to the dark
  theme (use it with `section-dark` for a black feature band, as on the Home audit band).
  Colours are CSS variables, so the same class flips with the theme.
- Backgrounds: `base` #FFFFFF (dark #000000); `deep` #F5F5F7 (dark #161617) for alternating
  sections and the footer. Use the `section-deep` class for grey sections: it also puts cards
  on white so they stand out.
- Card surface: `surface` #F5F5F7, radius `rounded-card` (18px), flat, no border. Hover adds
  `shadow-card-hover`, never a darker fill (muted text drops under 4.5:1 on it).
- Cyan, two ways: `bg-cyan` #1CBFD4 is for FILLS (primary buttons, badges) with
  `text-on-accent` #06222A on it (7.44:1). `text-accent` #127A88 (dark #1CBFD4) is cyan as
  TEXT, links, ticks and outline buttons. Never set #1CBFD4 as text on white (2.22:1).
- `purple` #865CB0 (dark #C084FC): one highlighted word only, never a fill.
- Text: `ink` #1D1D1F, `muted` #6E6E73 for body and secondary copy, `faint` #86868B for
  captions and input borders only (under 4.5:1 for text on light grounds). `line` #D2D2D7
  for hairlines.
- Fonts: SF Pro through the system stack (`--font-heading` SF Pro Display, `--font-body`
  SF Pro Text), with Inter self-hosted by next/font as the fallback. SF Pro is never hosted
  or bundled: its licence covers Apple platforms only. No serif anywhere.
- Buttons: every button is a pill (`rounded-full`), 17px regular. Primary = cyan fill,
  outline = `border-accent text-accent`. Press shrinks to `scale(0.97)`.
- Type scale: eight sizes only — `text-12`, `14`, `17`, `21`, `28`, `40`, `48`, `64`.
  Tailwind's default sizes and `text-[...]` values are removed from the theme. Fluid headings
  step between two sizes at a breakpoint (`text-28 md:text-40`), never `clamp()`.
  Exception: `ExperienceMap` scales its own diagram units.
- Headings: weight 600. Section eyebrows are sentence case, 17px semibold, `text-accent`
  (`.eyebrow`); page heroes use the soft cyan pill (`.eyebrow-pill`).
- Layout: `container-wide` 1200px for card grids, `container-text` 980px for text-led
  sections; 24px gutters (20px on phones); `section-y` is 96px desktop, 64px mobile.
- Nav: sticky, 44px (48px on phones), translucent `--nav-bg` with a saturate-and-blur
  backdrop, no border or shadow, 12px links.
- Backgrounds are flat colour. No glows or gradient washes; the gradient appears only in
  the logo heart and the case study placeholder tint.
- Motion: `transition` defaults to `cubic-bezier(0.22, 0.61, 0.36, 1)` at 200ms; use
  `duration-fast` (120ms) or `duration-slow` (360ms). Continuous loops (marquee) stay linear.
- Icons: inline SVG only (`src/components/Icons.tsx` for stars, the FAQ marker and the link
  arrow). No unicode glyphs (★, +, →) standing in for icons in components.
- Voice: "we" for business copy. First person stays only where Jerrell speaks about himself
  (founder intro on Home, the About page, the author page). The tagline is "Digital
  products for your business." (footer, tap card, `llms.txt`). The old tagline "We make
  websites and Google, simple." was retired everywhere on 14 October 2026; don't reintroduce it.

`mockups/archived/home-dark-2026-07.html` is the retired dark-theme spec, kept for reference only. Never build from it; the design system and the site canvas in Claude Design are the source.

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

Built: `/`, `/websites`, `/search`, `/social`, `/consulting`, `/work`, `/about`,
`/about/jerrell-niu` (author page), `/insights`, `/contact`, `/audit`, `/terms`,
`/privacy`, custom 404.

Four **standalone pillar pages** (`/websites`, `/search`, `/social`, `/ai`) replace the
old single `/services` page — confirmed architecture change. Update the Notion Sitemap
doc to match if not already done.

## GEO / AI-citation (non-negotiable, per the GEO strategy)

- FAQPage JSON-LD on every page with an FAQ (helper: `src/lib/schema.ts`). Wired on Home,
  the four pillar pages and About via `<JsonLd data={faqPageSchema(...)} />`.
- **Articles carry their FAQs in the Markdown body, not in frontmatter.** Write them under a
  `## FAQs` heading as `**Question?**` on its own line followed by the answer paragraph.
  `src/lib/faq.ts` reads them back out and `/insights/[slug]` emits FAQPage from the same text
  the reader sees — one source of truth, no duplicated copy to drift. An article with no FAQ
  section emits no FAQPage. Adding FAQs to an article is a content edit only, never a code change.
- **Author entity.** `/about/jerrell-niu` emits the Person node (`@id` ends `#person`) plus
  ProfilePage; every Article references that `@id` instead of a bare name string. Constants and
  builders live in `src/lib/schema.ts` (`AUTHOR_ID`, `AUTHOR_URL`, `personSchema`,
  `profilePageSchema`); copy lives in `content/pages/author.json`, typed by `AuthorPageContent`.
  `sameAs` on that file is empty until Jerrell's own profile URLs are confirmed — only add
  profiles that belong to the person, not the business.
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
3. ~~Embed the Google Calendar 15-min appointment on `/contact` and `/audit`.~~ **Done** —
   `src/components/BookingEmbed.tsx` renders an appointment schedule in an iframe, with a
   visible "open in a new tab" fallback because the embed is third-party and fails silently
   as an empty box when blocked. Schedule URLs live in `content/site.json` under `schedules`
   (`discovery15`, `meeting30`), typed by `BookingSchedule`. The 15-minute schedule is
   embedded on `/contact` and at the foot of `/audit`; the 30-minute one is recorded but not
   yet placed. Note the embed URL must be the public
   `/calendar/appointments/schedules/...?gv=true` form — the `/u/0/` variant Google shows
   while signed in is account-scoped and will not load for a visitor.
4. ~~Logo.~~ **Done, redesigned October 2026** — `src/components/Logo.tsx` inlines the new
   "i [heart] digital" lockup: a solid geometric heart, letters in Inter Tight SemiBold
   outlined. Letters use `currentColor`, so they follow the theme's text colour; the heart's
   gradient comes from `--logo-grad-start` / `--logo-grad-end` (deeper on light grounds,
   brighter inside `data-theme="dark"`). Master files and usage rules live in the
   I Love Digital Design System (`assets/Logos/ild-*`); never redraw the logo here.
   `public/logo.svg` is the light-ground lockup. Icons follow Next's file conventions:
   `src/app/icon.svg`, `src/app/favicon.ico` (16/32/48) and `src/app/apple-icon.png` (180).
   **Still TODO:** real imagery for case-study thumbnails and the founder/portrait
   placeholder blocks.
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

## Instant website audit (`/audit`)

`POST /api/audit` runs the audit agent in `src/lib/audit/` and streams progress to the
form as NDJSON; the report renders on screen and is emailed to the visitor and to us.
Spec and go-live keys: "Instant Website Audit — Agent Spec and Operating Guide" in Notion.

- Every finding is measured. Claude only writes the summary and plan, and a figures
  guard (`interpret.ts`) swaps in the rules version if it writes any number we did not
  measure, or mentions prices or tooling. Keep it that way.
- All fetching of visitor-supplied URLs goes through `safe-fetch.ts` (SSRF guard). Never
  call `fetch()` on a submitted URL directly.
- Functions run in `syd1` (`vercel.json`) so response times reflect Australian visitors.
- Run one from the terminal: `npx tsx scripts/run-audit.ts example.com.au [--no-speed]`.
  Tests: `npx tsx --test scripts/audit.test.ts`.

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
