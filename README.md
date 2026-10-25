# DoughTally

AI-powered cost and margin tracking for small makers: home bakeries, food
trucks, caterers, florists, jewelers and metal fabricators.

Snap a photo of a supplier invoice and DoughTally reads it, matches each line
to your ingredients, updates their costs, and shows you right away which
recipes and menu items lost margin and what to do about it.

Live at **[doughtally.app](https://doughtally.app)**.

## Features

- **Invoice scanning.** Phone photos or PDFs of invoices are turned into
  structured line items with a vision model (Claude, behind a swappable
  provider interface).
- **Smart ingredient matching.** Vector search (Voyage AI embeddings +
  pgvector) matches messy vendor names like `ORG CHKN BRST 40# CS` to your
  ingredients. Once you confirm a match it is remembered, and unsure matches
  go to a swipe-to-verify review queue.
- **Live costing.** Recipe cost and menu-item margin come from Postgres
  views, so every scanned invoice updates them instantly, with no cache to
  go stale.
- **Price alerts and suggestions.** Each price change works out which items
  it affected and by how much, and Claude writes a specific recommendation
  (raise price, change portion, switch vendor…).
- **Market Watch.** Daily ingestion of USDA, FAO and BLS commodity prices
  warns you before your costs go up.
- **Multi-industry.** One schema and cost formula, with per-industry wording,
  units, categories and defaults (labor, waste, machine time, markup).
- **Installable PWA** with offline support, plus bulk CSV/PDF import and a
  manual-entry grid.

## Tech stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Data & auth | Supabase Postgres with Row-Level Security for tenant isolation, Supabase Auth and Storage |
| AI | Anthropic Claude (vision extraction, suggestions), Voyage AI (embeddings) |
| Validation | Zod |
| Hosting | Vercel (app + daily cron) |

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full design: schema,
matching pipeline and the price-change cascade. See [`PROGRESS.md`](PROGRESS.md)
for what was built and how each step was tested.

## Running locally

Requirements: Node.js 20+, and a Supabase project (or the
[Supabase CLI](https://supabase.com/docs/guides/cli) for a local one).

```bash
git clone https://github.com/samrramos1316-art/doughtally.git
cd doughtally
npm install
cp .env.example .env.local   # then fill in your keys
```

Apply the database migrations in `supabase/migrations/` (in order) to your
Supabase project, for example with `supabase db push`. Then:

```bash
npm run dev     # http://localhost:3000
npm test        # unit tests
npm run lint
```

`node scripts/seed-demo-data.mjs` seeds a demo business. The `scripts/`
folder also holds the end-to-end tests that run against a real Supabase
project (RLS isolation, price cascade, matching and more).

## Project layout

```
app/          routes: (marketing) landing + auth, (app) the product, api/ route handlers
components/   UI components
lib/          domain logic: AI providers, matching, costing, market data, industries
supabase/     SQL migrations and rollbacks
scripts/      seeding, fixtures and end-to-end tests
```

## License

[MIT](LICENSE) © 2026 Sam Ramos
