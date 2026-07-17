# ilovedigital-web

The Next.js rebuild of **ilovedigital.com.au** — and the reusable starter for the
agency's website builds. Dark-theme design system, content-driven pages (copy as
JSON/MDX synced from Notion), GEO/AI-citation baked in.

See **CLAUDE.md** for build conventions, the Definition of Done, and the TODO list.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run build      # run before every PR (Gate C check)
npm run start      # serve the production build locally
```

## Deploy to Vercel

1. Push this repo to GitHub (e.g. `jerrellniu/ilovedigital-web`).
2. In Vercel: **Add New → Project → Import** the GitHub repo.
3. Framework preset auto-detects **Next.js** — no config needed (`vercel.json` is included).
4. Deploy. Every PR then gets an automatic **preview deployment** — that preview URL is
   what you review at Gate C before merging.
5. Set the production domain (`ilovedigital.com.au`) in Vercel **only at cutover**, once
   the site is approved. Keep Squarespace live until then.

## Structure

- `content/` — copy (JSON + MDX), synced from Notion (the human source of truth)
- `src/app/` — App Router pages
- `src/components/` — shared components
- `src/lib/` — content loaders + JSON-LD schema builders
- `mockups/` — approved HTML mockups (visual spec)
- `redirects.json` — 301 map, populated at cutover

## Pages

Home, Websites, Search, Social, AI, Work, About, Insights, Contact, Audit, Terms,
Privacy, and a custom 404. Case study and blog detail pages (`/work/[slug]`,
`/insights/[slug]`) are the next build step — see CLAUDE.md.
