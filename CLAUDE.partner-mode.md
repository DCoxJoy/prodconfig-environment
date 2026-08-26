# Addendum: Channel-Partner Mode

**Status:** Live in production on `main` — both the original partner-mode work (routing,
branding, SKU scoping) and the V2 rep/customer end-flow below have been merged and
deployed. This document specifies an extension to the architecture described in
`CLAUDE.md`. It does not replace or modify that document — see `CLAUDE.md`'s own
"Channel-Partner Mode (V2)" section for a concise, current-state summary; this file
remains the detailed build history/reference.

### Implementation notes — V2 rep/customer end-flow

Built against a partner-supplied implementation checklist. Per that checklist's own
deployment section, this was built and reviewed on a `v2-rep-customer-flow` branch and
its Vercel preview first (unlike the smaller tweaks below, which shipped straight to
production) — merged to `main` and live once that review was done.

- **`?mode=rep` / `?mode=customer`** — resolved server-side in `/p/[partnerSlug]/page.tsx`
  (`searchParams`), defaulting to `customer` when unset. Carried via `PartnerContext`
  (now `{ partner, mode }`, with a new `usePartnerMode()` hook alongside the existing
  `usePartner()`). `embed.js`/`embed-inline.js` both gained a `data-mode` attribute that
  forwards through to the iframe's `?mode=` — without this there'd be no way to actually
  configure rep vs. customer for a real embedded deployment.
- **`PartnerConfig.contactEmail?: string`** — the new gate for the entire feature.
  Partner One IT: `sales@partneroneit.com` (the checklist's own placeholder —
  **still needs confirming as the real address**). Cell Medics LTD: `service@cellmedics.ca`
  (a placeholder explicitly confirmed usable for now). **Every behavior below only
  activates once a partner's `contactEmail` is set** (`partnerMailtoEnabled` /
  `mailtoFlow` in the code) — a partner without one keeps exactly today's behavior
  (Contact sales + Share bundle, full HubSpot-backed form) rather than being switched
  onto an email-only flow with nowhere for that email to go. This was a deliberate
  safety default, not something the checklist specified directly — it's what made
  turning this on for Cell Medics LTD a one-line config edit with zero code changes,
  exactly as designed. Verified: Cell Medics LTD now shows the same rep/customer
  behavior as Partner One IT (mailto to `service@cellmedics.ca` in both modes,
  HubSpot form no longer reachable), with Partner One IT and the default app both
  unaffected by the change.
- **Rep view (Bundle step)** — single full-width "Send a Quote" button (grid drops to
  1 column), no Add to cart, no Share bundle. Blank `To:`, `cc=` the partner's
  `contactEmail`, subject `Bundle Quote from {partner.name}`, plain-text body with
  blank `Customer:`/`Rep:` lines for the rep to fill in by hand, then the bundle
  itemization and sub-total.
- **Customer view (Bundle step)** — unchanged 2-button layout (Contact sales +
  Share bundle) from the earlier Add-to-cart-removal work, but "Contact sales" now
  builds a `mailto:` addressed directly to the partner's `contactEmail` (subject
  `Contact request — {device} bundle`) instead of calling `onContactSales` to open the
  multi-field form. Share bundle is untouched (it was already a mailto:).
- **"Every entry point" bypasses the HubSpot form, not just the Bundle-step button** —
  per explicit confirmation. `ConfiguratorShell.goContactSales()` is the single call
  site all three entry points funnel through (certified-yes from Features, the
  escalation banner from Review, and the Bundle step's own button) — when
  `partnerMailtoEnabled`, it fires the mailto: immediately (at the moment of the click,
  same reliable pattern Share Bundle already used) and routes to a new confirmation
  step instead of ever mounting `StepContact`.
- **`src/components/configurator/StepPartnerContact.tsx`** (new) — replaces
  `StepContact` for the 'contact' step slot whenever `partnerMailtoEnabled`. Not a form
  — a confirmation screen ("Quote ready to send" / "Message ready to send") with a
  manual "Click here" retry link (same href, a real `<a>`) since there's no reliable
  way for JS to detect whether the OS actually had a mail client to hand the mailto:
  off to; the bundle summary (when applicable) and the required privacy disclaimer.
- **`src/lib/partnerMailto.ts`** (new) — the one shared `buildPartnerMailto()` used by
  both `goContactSales` and `StepPartnerContact`'s retry link, so the rep vs. customer
  address/subject/body logic exists in exactly one place. Built with
  `encodeURIComponent` per field (matching the existing Share Bundle mailto's
  convention) — **not** `URLSearchParams`, which was tried first and form-encodes
  spaces as `+` rather than `%20`; the mailto URI spec doesn't guarantee every mail
  client treats a literal `+` in the body as a space, so this was fixed before
  considering it done.
- **Plain-text only, deliberately** — mailto: bodies cannot render HTML/tables in any
  mail client (Outlook, Gmail, Apple Mail, mobile included); this is a hard limitation
  of the mailto: URI scheme, not an implementation gap. The checklist's HTML/table
  quote-formatting section is only achievable with a real email-sending backend
  (Resend/SendGrid), which the checklist itself flags as a future enhancement, not
  built here.
- **Asterisk guidance + privacy disclaimer** (`StepBundle.tsx`) — the exact wording
  from the checklist, shown only when `mailtoFlow` is true (so Cell Medics, still on
  the HubSpot form today, never shows "no data is saved" — that would be false for
  them right now).
- **Not done from the checklist, on purpose:**
  - §2 (accessory/upsell logic) — explicitly gated on "finalize in V1 first" in the
    checklist itself; not started.
  - §8 (Quick Start PDF) — a documentation deliverable, sequenced after this UI is
    reviewed/approved rather than built against a moving target.
  - §9's manual cross-client testing (real Outlook/Apple Mail/iOS Mail/Gmail app) —
    can't be performed here; what was verified instead is that the generated mailto:
    URLs are correctly percent-encoded (see the `+`-vs-`%20` fix above) and that no
    `localStorage`/`sessionStorage` is used anywhere in the partner flow.
  - The checklist's example config used `slug: "partner-one-it"`; the actual slug was
    left as `partner-one` to avoid breaking the already-deployed `/p/partner-one` URL
    and any embed snippet already pointed at it. One-line change if it should match.
- Verified end-to-end (Playwright): default app and Cell Medics (no `contactEmail`)
  byte-for-byte unaffected on every path (Bundle-step buttons, certified-yes,
  escalation); Partner One IT customer mode shows Contact sales (mailto to
  `sales@partneroneit.com`) + Share bundle with no Add to cart; Partner One IT rep mode
  shows only "Send a Quote" (blank To, cc'd to the partner); certified-yes and the
  Bundle-step button both correctly skip `StepContact` for Partner One IT and land on
  the new confirmation screen; generated mailto hrefs inspected directly and confirmed
  `%20`-encoded with correct subject/to/cc/body for both modes.

### Implementation notes (first pass — Cell Medics LTD + Partner One)

- `src/lib/partners.ts` — `PartnerConfig` + `PARTNERS` map, exactly as specified in
  §2.1. Two entries: `cell-medics` ("Cell Medics LTD") and `partner-one` ("Partner
  One" — a working codename pending the real company name/branding). Both start with
  an empty `skuAllowlist` (full catalog, no restriction) since neither partner has
  provided a real SKU list yet — populate later with a one-line edit here.
- `applyPartnerAllowlist()` (same file) is the single filtering function used by both
  `/api/bundle` and `/api/ai-edit`, applied right after each route's existing `active`
  candidate list is built (§2.3) — scoring logic in those routes, `enrichment.ts`, and
  `bigcommerce.ts` are all untouched. No-op whenever `partnerSlug` is unset or the
  partner's allowlist is empty. Verified against live BC data: with a real allowlist
  temporarily set, results correctly narrow to only allowlisted SKUs; restored to the
  empty default, output is byte-for-byte identical to the no-partner request.
- `src/app/p/[partnerSlug]/page.tsx` — the §2.2 route. Server Component; resolves the
  slug via `getPartner()` and calls `notFound()` for an unknown slug (404, not a silent
  fallback to the default app) or when `PARTNER_MODE_ENABLED=false` (§4's optional kill
  switch, implemented — unset/anything else defaults to enabled).
- `src/components/ConfiguratorApp.tsx` — new shared shell (`AppHeader` + `page-outer` +
  providers + `ConfiguratorShell`) rendered by both `/` (`partner={null}`) and
  `/p/[partnerSlug]` (`partner={resolved config}`). `page.tsx` is now a two-line wrapper
  around it; output/behavior on `/` is unchanged.
- `src/lib/PartnerContext.tsx` — new, separate from `ConfiguratorContext` on purpose
  (partner identity is static per page load, unrelated to configurator step/selection
  state). `usePartner()` returns `null` on the default flow — not an error, the common
  case.
- **Branding:** `AppHeader` shows `partner.name` in place of "BUNDLE BUILDER" when set
  (e.g. "Cell Medics LTD", "Partner One"); the "Powered by The Joy Factory" subtitle is
  unchanged for both partners in this phase. No logo assets yet for either partner —
  `logoUrl` stays unset; `AppHeader` doesn't render one currently, add when assets
  arrive. Browser tab `<title>` is unchanged for now (not part of this pass).
- **Contact form:** `StepContact`'s "Company" field is pre-filled with `partner.name`
  when present (still user-editable, matching §3's note about the existing Company
  field) — verified blank on `/`, "Cell Medics LTD" on `/p/cell-medics`.
- **Embed delivery (§2.4):** both `embed.js` and `embed-inline.js` read `data-partner`
  and point the iframe at `/p/{partner}?embed=true` instead of `/?embed=true` when set;
  unset behaves exactly as before. Verified for both scripts.
- **No "Add to cart" for partner variants** — `StepBundle.tsx` hides the Add to cart
  CTA whenever `usePartner()` is non-null (i.e. on any `/p/[partnerSlug]` route,
  currently both Cell Medics LTD and Partner One); the CTA grid drops from 3 columns to
  2 (Contact sales, Share bundle) rather than leaving a gap, and the "Add at least one
  item to continue to checkout" hint (which only makes sense with a checkout CTA
  present) is hidden alongside it. The default (no-partner) flow keeps all three CTAs
  unchanged. Verified end-to-end (Devices → Bundle) on all three routes: default shows
  Add to cart + Contact sales + Share bundle; both partner routes show only Contact
  sales + Share bundle.
- **Contact sales takes over the brand-red styling on partner variants** — since
  partner routes have no Add to cart CTA, `StepBundle.tsx`'s Contact sales button
  switches from its default white/outline look to the same solid `bg-brand` red (white
  text) Add to cart used to have, so the remaining CTA row still has a clear primary
  action instead of two equal-weight outline buttons. Default (no-partner) flow is
  unchanged. Verified: default Contact sales stays white; both partner routes compute
  to `rgb(200, 41, 28)` background with white text.
- **Per-partner brand color (Cell Medics LTD → `#ea526f`)** — new `PartnerConfig.brandColor?: string` field. Since every component already routes its accent color through Tailwind's `bg-brand`/`text-brand`/`border-brand` utilities (which compile to `var(--color-brand)`/`var(--color-brand-hover)` — confirmed via a repo-wide grep, no component hardcodes the red hex directly), `ConfiguratorApp.tsx` re-declares those two CSS custom properties as an inline `style` on its root wrapper whenever a partner has a `brandColor` set — no component-level changes needed, and it cascades to everything inside (header, buttons, progress bar, step nav, breadcrumb text, etc.) for free. The hover shade is derived automatically (`darkenHex()` in `partners.ts`, ~83% of each channel — matches the ratio between the app's own default `#c8291c` → `#a8221a`), so a partner only supplies one color. Unset `brandColor` (default app only, now) means no inline style at all — the default red keeps flowing from `globals.css`'s `:root`/`@theme` untouched. Verified with Playwright: header and CTA buttons both compute to `rgb(234, 82, 111)` (`#ea526f`) on `/p/cell-medics`; default stays `rgb(200, 41, 28)` (`#c8291c`); screenshots confirm the color also reaches the progress bar, step nav circles, and breadcrumb text on later steps.
- **Intro overlay switched back to a live `backdrop-blur`, not a static screenshot** — the static `/intro-bg.jpg` approach (captured once, from the default red theme) could never look right for a partner: dialing its white scrim up removed the mismatched color blotching but also erased the blur effect entirely (tried `/25` → `/60`, `/60` washed out visible-blur along with the mismatch), and dialing it down brought back visibly wrong-colored (red) blur under Partner One's blue or Cell Medics' pink theme. Root cause was the single shared screenshot itself, not the scrim number — no scrim value could fix a fundamentally wrong-colored source image. Replaced with a live `backdrop-blur-xl` + `bg-white/40` directly on the overlay, blurring whatever's actually rendered in the (already-mounted) Devices step underneath — this self-corrects for any current or future partner's brand color automatically, with no screenshot asset to generate or keep in sync. `/intro-bg.jpg` is no longer referenced (left in `public/`, unused, in case a static approach is wanted again later). Verified with Playwright: default shows a red-tinted blur, `/p/cell-medics` shows pink, `/p/partner-one` shows blue — each correctly matching its own live theme — and the Get Started reveal-on-click transition still works on all three.
- **Intro overlay kicker ("Start Here") replaced with the partner's name** — `ConfiguratorShell.tsx`'s intro card now renders `partner?.name ?? 'Start Here'` in that small uppercase kicker line above "Solution Bundle Builder." The existing `uppercase` CSS class handles the display casing automatically (`"Cell Medics LTD"` renders as `CELL MEDICS LTD`), so no per-partner casing logic was needed. Default flow unaffected. Verified with Playwright: default still reads "START HERE"; `/p/cell-medics` reads "CELL MEDICS LTD"; `/p/partner-one` reads "PARTNER ONE".
- **Partner One's brand color set to `#0071EB`** — same `brandColor` mechanism as Cell Medics LTD above, a one-line `PartnerConfig` edit (no code changes needed, confirming the mechanism generalizes). Verified: `/p/partner-one` header computes to `rgb(0, 113, 235)` (`#0071EB`); default and `/p/cell-medics` unaffected.
- Not yet done: real SKU allowlists and logo assets for either partner (pending from
  each partner, per §6); data residency question for Cell Medics LTD (§6, still open —
  routing/config/catalog-scoping work above doesn't depend on resolving this, but it
  should be settled before their real embed snippet points at production).
- Per §4's rollout plan: built on the `partner-mode` branch, validated, then merged to
  `main` and deployed — this first pass (routing, branding, SKU scoping, Add to cart
  removal) has been live in production since. The rep/customer end-flow above followed
  the same branch → preview → merge pattern separately.

**Non-negotiable constraint:** The existing bundle builder — the flow currently live in
production and embedded on our own marketing pages — must not change in behavior,
output, or code path as a result of this work. Everything below is additive. If any
proposed change would require editing `enrichment.ts`'s scoring logic, `bigcommerce.ts`,
or the default (no-partner) request flow, that change is out of scope for this phase and
needs separate discussion.

---

## 1. What this adds

The ability to serve a **branded, catalog-scoped variant** of the existing configurator
for a channel partner, without duplicating the codebase or standing up new
infrastructure. First partner: **Cell Medics LTD** (Canada — see open question in
Section 6).

A partner variant differs from the default flow in exactly three ways:
1. **Branding** — partner name/logo shown in place of (or alongside) default branding.
2. **Catalog scope** — a SKU allowlist restricts which products can appear in bundles
   and AI-edit swap suggestions.
3. **Delivery** — reachable via a partner-specific embed snippet / URL, no login.

Nothing else about the configurator's logic, steps, or behavior differs from the
existing app.

### Included in this phase (confirm before build sign-off)

- [x] Static `PartnerConfig` with a `skuAllowlist: string[]` field (Section 2.1)
- [x] Allowlist filtering applied at the enrichment candidate layer, not inside
      `enrichment.ts`'s scoring logic itself (Section 2.3)
- [x] Empty allowlist = full catalog, no restriction (current state for both Cell
      Medics LTD and Partner One, pending their real SKU lists)
- [x] Populating or changing the allowlist is a one-line edit to the `PartnerConfig`
      entry and a redeploy — no changes to enrichment/BigCommerce logic itself

---

## 2. Architecture

### 2.1 Partner config (no database)

A small, static config — a TypeScript object or JSON file checked into the repo, **not**
a database table. Example shape:

```ts
// src/lib/partners.ts
export type PartnerConfig = {
  slug: string;
  name: string;
  logoUrl?: string;
  skuAllowlist: string[]; // empty array = no restriction (full catalog)
};

export const PARTNERS: Record<string, PartnerConfig> = {
  "cell-medics": {
    slug: "cell-medics",
    name: "Cell Medics LTD",
    skuAllowlist: [], // populate once Cell Medics provides their SKU list
  },
};
```

Adding a future partner is a new entry in this file, not a new deployment, migration,
or admin UI. This intentionally defers the previously-scoped admin CRUD system
(partner self-management, database-backed partner records, NextAuth admin login) —
that design was paused as ahead of current phase and remains a valid future direction
if partner count or self-service needs grow.

### 2.2 Routing

Partner requests are distinguished by a route or param, e.g. `/p/[partnerSlug]`. This
resolves the `PartnerConfig` **server-side** (in middleware or the route handler) before
any catalog/enrichment logic runs. The default route (`/`) never touches this code path.

### 2.3 Catalog scoping

`skuAllowlist` filters candidates at the same point `enrichment.ts` already produces
scored candidates — it does not change how scoring works, only which of the results are
eligible to surface. When `skuAllowlist` is empty, this is a no-op and the full catalog
is available (this is the current state of the Cell Medics LTD prototype pending their
real SKU list).

`bigcommerce.ts` requires no changes — it continues returning the full catalog; scoping
happens downstream, same layer as enrichment.

### 2.4 Embed delivery

The existing `embed.js` / `embed-inline.js` scripts are extended to pass a `data-partner`
attribute through to the iframe URL:

```html
<script src="https://commerce-indol-eta-68.vercel.app/embed-inline.js" data-partner="cell-medics"></script>
```

No login, no token exchange — the partner slug in the URL determines which config (and
therefore which catalog scope and branding) is served. Default embeds (no `data-partner`)
are unaffected.

---

## 3. Explicit non-goals for this phase

- No database or persistence layer
- No admin login / auth system
- No partner self-signup or self-service portal
- No per-partner pricing tiers via BigCommerce Price Lists (deferred; flag if needed)
- No changes to HubSpot submission logic beyond passing the partner name into the
  existing `Company` field

---

## 4. Rollout plan (protecting the live site)

1. Build on a feature branch. Do not touch `main`.
2. Use the automatic Vercel preview deployment for that branch to test the full partner
   flow end-to-end, including the actual embed snippet pointed at the **preview URL**.
3. Only point Cell Medics LTD's real embed snippet at the production URL once the
   preview has been validated.
4. Standard PR review before merging to `main`.
5. Vercel retains prior production deployments — instant rollback is available if
   anything unexpected surfaces post-merge.
6. Optional: an env var (e.g. `PARTNER_MODE_ENABLED`) that short-circuits all
   partner-config resolution, as a kill switch independent of a redeploy.

---

## 5. Prototype reference

A front-end click-through prototype (`CellMedicsConfiguratorPreview.jsx`) exists
demonstrating the intended UI/branding/catalog-scoping behavior. It is a standalone
mock (no real BigCommerce/enrichment/HubSpot calls) built for stakeholder review and
UI iteration — it is a reference for the real implementation, not something to port
directly.

---

## 6. Open questions

- **Data residency:** Cell Medics LTD is Canadian. Confirm whether PIPEDA or similar
  requires their traffic/data to be served from a Canadian region. If so, this may
  warrant a separate Vercel project (same repo, different deployment target/region)
  rather than a reason to fork the codebase.
- **SKU allowlist:** pending from Cell Medics LTD.
- **Branding assets:** logo file pending from Cell Medics LTD.
