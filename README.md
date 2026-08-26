# aXtion Solution Bundle Builder

A guided-selling product configurator for Joy Factory's aXtion protective case/mount
line. Walks a user through device → features → environment → a live BigCommerce-backed
bundle recommendation, with an AI-assisted swap step and a Contact Sales hand-off.
Also ships a branded, catalog-scoped variant ("V2") for external channel partners.

For full build history, every feature decision, and current operating status, see
**`CLAUDE.md`** (and **`CLAUDE.partner-mode.md`** for the channel-partner variant) —
this file is just enough to get the project running locally.

## Stack
- **Framework:** Next.js 16 (App Router), TypeScript (strict), Tailwind CSS v4
- **AI:** Anthropic Claude API — server-side only (bundle reasoning paragraph, AI-edit swaps, catalog enrichment)
- **Commerce:** BigCommerce Storefront/REST API (live catalog, cart creation)
- **CRM:** HubSpot Forms Submission API (Contact Sales — default app only; partner
  routes with a `contactEmail` configured use a `mailto:` hand-off instead, capturing
  no lead data)
- **Deployment:** Vercel

---

## Getting Started

### 1. Prerequisites
- **Node.js v20** (via nvm — `source ~/.nvm/nvm.sh && nvm use 20.20.2`)
- A BigCommerce store with API credentials
- An Anthropic API key
- A HubSpot private app token (only needed for the default app's Contact Sales form)

### 2. Environment variables
Create `.env.local` in the project root:

```bash
# BigCommerce
BC_STORE_HASH=your_store_hash_here
BC_ACCESS_TOKEN=your_access_token_here

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# HubSpot (default app's Contact Sales form only)
HUBSPOT_ACCESS_TOKEN=your_hubspot_private_app_token_here

# Optional — channel-partner mode kill switch. Unset or anything other than "false"
# leaves partner routes (/p/[partnerSlug]) enabled.
PARTNER_MODE_ENABLED=true

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install & run
```bash
npm install
source ~/.nvm/nvm.sh && nvm use 20.20.2
npm run dev
```
The app runs at [http://localhost:3000](http://localhost:3000). Channel-partner routes
are at `/p/cell-medics` and `/p/partner-one-it` (append `?mode=rep` for the sales-rep view).

---

## Folder Layout

```
/src
  /app
    page.tsx                    ← Default app entry point
    /p/[partnerSlug]/page.tsx   ← Channel-partner route (branding/SKU-scope/end-flow)
    /api
      /bundle       ← Live BC bundle builder (device/feature/scenario scoring)
      /ai-edit      ← Two-pass Claude AI edit (intent parse + BC candidate select)
      /claude       ← "Why this bundle fits" reasoning paragraph
      /cart         ← BC cart creation
      /contact      ← HubSpot Forms Submission API (default app's Contact Sales)
      /admin/enrich ← One-shot seed endpoint for enrichment.ts
  /components
    ConfiguratorApp.tsx          ← Shared shell for / and /p/[partnerSlug]
    /configurator
      ConfiguratorShell.tsx      ← Step machine, intro overlay, nav
      StepDevices / StepFeatures / StepEnvironment / StepReview / StepBundle
      StepContact.tsx            ← Default app's HubSpot-backed contact form
      StepPartnerContact.tsx     ← Partner mode's mailto confirmation screen
    /ui
      AppHeader.tsx, ProgressBar.tsx, StepNav.tsx, QtyControl.tsx, ...
  /lib
    enrichment.ts        ← Primary recommendation control (SKU → attributes)
    bigcommerce.ts        ← BC API client
    claudeEnrichment.ts   ← Batch Claude inference for unknown SKUs
    catalog.ts            ← Device groups, selectable features
    questions.ts          ← Environment-step question sets
    reasoning.ts          ← Fallback "why this bundle fits" text
    partners.ts           ← PartnerConfig + PARTNERS map (channel-partner mode)
    PartnerContext.tsx    ← usePartner() / usePartnerMode()
    partnerMailto.ts      ← Shared mailto: builder for partner end-flows
    ConfiguratorContext.tsx ← App state (device, features, scenarios, live bundle)
  /types
    index.ts              ← Shared type interfaces
/public
  embed.js         ← Drop-in floating-widget embed script
  embed-inline.js  ← Drop-in always-visible inline embed script
/docs
  BUILD_REFERENCE.md ← Archived Phase 1/2 build history (see CLAUDE.md for current status)
```

---

## Validation

```bash
npx tsc --noEmit   # type-check
npm run build      # full production build
```

`playwright` is a devDependency used for headless-browser UI verification during
development (screenshot + behavior checks) — not part of the production build.
