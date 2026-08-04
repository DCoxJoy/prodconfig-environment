# CLAUDE.md — Joy Factory aXtion Product Configurator

**Project:** Joy Factory aXtion guided selling configurator  
**Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS v4  
**AI:** Anthropic Claude API (claude-sonnet-4-6) — server-side only  
**Integrations:** BigCommerce Storefront API, HubSpot Forms API  
**Deployment target:** Vercel  

> Historical build instructions (Phase 1 & 2 step-by-step) are archived in `docs/BUILD_REFERENCE.md`.

---

## WORKING PRINCIPLES

General engineering discipline for this repo — applies on top of the project-specific rules below. Use judgment on trivial tasks; bias toward caution on anything nontrivial.

1. **Think before coding.** State assumptions explicitly. If multiple interpretations exist, present them — don't pick silently. If a simpler approach exists, say so. If something is unclear, stop and ask rather than guessing.

2. **Simplicity first.** Minimum code that solves the problem — no speculative features, no unrequested abstractions or configurability, no error handling for impossible scenarios. If it could be a quarter of the size, rewrite it.

3. **Surgical changes.** Touch only what the task requires. Don't refactor or "improve" adjacent code, comments, or formatting, and don't touch unrelated dead code — mention it instead of removing it. Match existing style even where you'd do it differently. Do remove imports/variables/functions that your own change made unused.

4. **Goal-driven execution.** Turn tasks into verifiable success criteria before starting (e.g. "fix the bug" → "write a test that reproduces it, then make it pass"). For multi-step work, state a brief plan with a verification check per step, then loop against it rather than stopping to ask at each step.

Every changed line should trace back to the actual request. If a diff drifts into unrelated refactoring or unrequested flexibility, that's the signal to stop and reconsider.

---

## CURRENT STATUS — PHASE 2 COMPLETE + CONTACT FORM + SHARE BUNDLE WORKING

**All phases complete and working.** Do not delete or rebuild from scratch. Read this section before making any changes.

### What's done
- All 5 steps + Contact Sales fully navigable
- Real Claude API call wired in (`/api/claude` → StepBundle "Why this bundle fits" section)
- BigCommerce cart API route implemented (`/api/cart`)
- embed.js widget in `/public/embed.js` for drop-in iframe embedding
- **Inline embed option** — `/public/embed-inline.js` is a second embed script for pages that want the full app embedded directly in their layout, not a floating widget button. It builds an `<iframe src="{baseUrl}/?embed=true">` sized via `data-width`/`data-height`/`data-max-width` attributes (defaults: `100%` / `800px` / `480px`) — no FAB, no open/close toggle, no `position` fixed styling. By default it drops the iframe in-place where its own `<script>` tag sits (same self-discovery pattern as `embed.js`, so both can coexist on a page). Optional `data-target="{CSS selector}"` renders into a specific container element instead — needed for CMS/page-builder embeds (Webflow, WordPress, Squarespace, etc.) that relocate injected `<script>` tags to the page head/footer rather than preserving their authored position, so relying on script position alone isn't reliable there. Verified with Playwright: renders inline between surrounding host-page content with no target set, and correctly lands inside a named container div even when the script tag itself sits far away (e.g. at the bottom of `<body>`) with `data-target` set.
- **Live BC bundle** — `/api/bundle` fetches all BC products, filters cases by `device_compatibility`, scores mounts/accessories via enrichment data, returns up to 2 `BundleOption[]` with real BC product IDs
- **Enrichment layer** — `src/lib/enrichment.ts` is the recommendation control file. Maps SKU → `{ mount_surface[], features[], series, bundle_priority }`. Scoring uses this first; keyword matching is the fallback for any SKU not in the map.
- **Claude enrichment** — `src/lib/claudeEnrichment.ts` + `POST /api/admin/enrich` auto-generates enrichment for all BC products. Re-run when new SKUs are added.
- **No-products handling** — if BC has no cases for a selected device, Review step shows a clear message and routes to Contact Sales instead of silently showing placeholder data
- **BC IDs end-to-end** — `BundleItem.bcProductId`/`bcVariantId` from BC flow through to the cart route
- **Scenario-implied features** — `/api/bundle` derives implied features from environment answers before scoring accessories: iPhone `carry_style: holster/hand` → implies `hand_strap`; `hands_free: yes` (both iPhone and tablet) → implies `shoulder_strap`. These implied features are merged with explicitly selected features for accessory scoring only.
- **Device-specific accessory priority** — accessory pool is split into Tier 1 (BC `device_compatibility` explicitly lists the device) and Tier 2 (universal, no `device_compatibility`). Tier 1 is used when available, preventing tablet-only accessories (e.g. shoulder strap) from winning iPhone bundles where device-specific accessories exist (e.g. CPX302 Belt Clip Holster).
- **iPhone `hand_strap` removed from Features step** — `hand_strap` is not a selectable feature for iPhone users; it is implied automatically via the `carry_style` environment question instead.
- **HD mount priority** — all 7 HD mount SKUs (MMU232, MMU332, MVU232, MVU332, MMU230, MMU231, MMU331) have `bundle_priority: 1` in enrichment.ts. `scoreMount` uses `bundle_priority` as a fractional tiebreaker (same pattern as cases), so HD mounts beat non-HD mounts with the same `mount_surface` every time.
- **`solution_type` scoring** — `scoreMount` in `/api/bundle` reads the BC `solution_type` custom field (Drill Down, Adhesive, Rail/Pole) and applies a bonus score when the user's `mount_install` answer matches: adhesive preference → +2 to adhesive mounts; drill preference → +2 to drill-only mounts (VESA), +1 to drill+adhesive combo mounts; rail → +2 to Rail/Pole mounts. For vehicle and pole surfaces, `mount_install` is inferred automatically (vehicle → drill, pole → rail) so no question is shown.
- **`mount_install` environment question** — conditional tablet question "How will the mount attach to the surface?" with choices Permanent/drill-down and Adhesive/no-drill. Only shown when `mount_surface` is `wall` or `desk`. `getActiveTabletQuestions(mountSurface?)` in `questions.ts` computes the active question set; used by both `StepEnvironment` and `ConfiguratorShell` for display and the Next button gate.
- **Environment question updates** — `power_needed` question removed; `mount_surface` choices renamed: "Vehicle / forklift" → "Vehicle / Drill Down", "Pole / arm" → "Forklift / Pole"
- **StepReview HMR fix** — `useEffect` now depends on `[liveBundleOptions]` so it re-fetches whenever context resets to null (device change, HMR hot-reload). Proper `r.ok` check and `catch` block set `noProductsFound` instead of silently falling back to placeholder data.
- **Two-pass Claude AI edit** (`/api/ai-edit`) — replaces client-side keyword matching in `aiEdit.ts`. Pass 1: Claude parses free-text request into structured intent (action, component, constraints). Pass 2: filters live BC catalog by device compatibility and product type, Claude selects best candidate and returns a one-sentence reason. The **case is locked** — AI edits only swap Mount or Accessory. If the user asks to change the case, an inline guidance message appears ("go back to Step 2"). Low-confidence or no-candidate results escalate to Contact Sales. `src/lib/aiEdit.ts` is retained as a reference but is no longer imported.
- **`mount_surface` is now an array** in `ProductEnrichment` — a single mount SKU can list multiple compatible surfaces (e.g. `['wall', 'desk']`). `scoreMount` uses `.includes()` for surface matching. 10 SKUs gained `'desk'` as an additional surface: MMU104, MMU115, MNU504, MMU117, MMU332, MMU232, MMU331, MMU231, MVU332, MVU232.
- **Case-mount compatibility enforcement** — mount selection is now per-case (not shared across both bundle options). After selecting each case, the bundle route checks if it has `vesa_compatible` in enrichment features before allowing drill-only mounts. Compatibility matrix: **Bold + Extreme (HTA6024, CWM347MP)** → VESA/Drill Down + MagConnect; **Slim, Pro, Go, Edge (tablet)** → MagConnect only, no drill-only mounts. HD mounts (drill+adhesive solution_type) qualify for all series since adhesive option is always present. This prevents Slim+VESA incompatible bundles.
- **Features step label updates** — "MIL-STD-810H rated" → "Drop-proof certified" (MIL-STD-810H moved to description); "Kensington lock compatible" → "Lockable Protection"; "VESA mount compatible" → "Secure mount compatible" (VESA in description); "MagConnect compatible" → "Magnetic mount compatible" (MagConnect in description); "Screen protector included" removed from selectable list (still drives accessory scoring internally, same pattern as `hand_strap` for iPhone).
- **`vesa_compatible` and `magconnect` removed from selectable features** — both removed from `DEVICE_FEATURE_MAP` in `catalog.ts`. Mount pairing is now driven entirely by environment answers (`mount_surface` + `mount_install`) and the case-series compatibility filter. Case enrichment entries carry `vesa_compatible`/`magconnect` internally for bundle logic — they are not user-facing.
- **Contact Sales form** — `StepContact.tsx` uses a custom React form that POSTs to `/api/contact`. Sends device name + full bundle context (type/name/SKU/quantity/sub-total) in the HubSpot `message` field. HubSpot Forms Submission API — no auth token required. `src/components/ui/HubSpotForm.tsx` is retained but superseded (embed injection was unreliable).
- **HubSpot form configuration** — Portal ID `20662622`, Form ID `ba721aec-670d-456f-b004-c8434e9e3170`. reCAPTCHA must remain **disabled** on this form (it blocks the Forms Submission API). `region_name` field removed from code and HubSpot form editor. Submissions from localhost are briefly quarantined as spam — resolves automatically in production.
- **Share bundle — clipboard-copy only, no `mailto:`** — `StepBundle.tsx`'s "Share bundle" is a plain `<button>` (not a link) whose `onClick` copies the full subject+body text (device + bundle items/SKUs/qty/sub-total) to the clipboard via `navigator.clipboard.writeText()` and shows a persistent (10s) confirmation banner. This is the end state after three earlier `mailto:` approaches (`window.location.href` assignment → real anchor → hidden-iframe hand-off) all produced the same symptom for one specific tester: a blank placeholder window on click. Root-caused to that user's Chrome profile being enterprise-managed by the org (protocol handler registration entirely removed from Site Settings, not just disabled) with no OS-level default mail app either — a config no in-app code can work around, since Chrome's external-protocol handling happens above the DOM regardless of how the navigation is triggered. Rather than depend on any mail-client/OS/browser-policy configuration at all, Share bundle now only ever writes to the clipboard — works identically for every user regardless of their setup. Verified with Playwright: 0 new tabs/pages open on click, the banner renders, and the clipboard contains the correct bundle text. The stray fake demo copy-link (`.../bundle/demo-12345`) that had crept back into the email body was also removed — still no server route, no email provider, no recipient/message editing UI.
- **Product page links** — in both `StepReview.tsx` and `StepBundle.tsx`, each bundle item's name is an `<a target="_blank">` and its thumbnail image has an `onClick` that both open the item's live BigCommerce product page. `src/lib/bigcommerce.ts` reads BC's `custom_url.url` (returned by default on every product, no extra `include=` needed) and resolves it against the store's default domain (`https://store-{BC_STORE_HASH}.mybigcommerce.com`) into `BcProduct.product_url`; `/api/bundle/route.ts` passes it through as `BundleItem.productUrl`. Falls back to plain non-clickable text/image when BC has no URL for that SKU.
- **Kensington lock matching — computed from SKU, not hand-curated** — `getEnrichment()` in `enrichment.ts` appends `kensington_lock` to a product's `features` whenever its SKU ends in `KL` (verified against real BC product descriptions — e.g. CWA653KL: "Built-In Security Locking Plate... compatibility for Kensington locks"). This replaced relying solely on manually-curated `PRODUCT_ENRICHMENT` entries, which live data showed were incomplete (only 2 of 5 known KL SKUs had entries).
- **IP68 certification matching tightened** — `FEATURE_TO_CERT_KEYWORD.ip_rating` in `/api/bundle/route.ts` was tightened from a loose `'IP'` substring to `'IP68'` specifically. The looser match let lower-tier ratings (IP54, IP64, IP4) falsely satisfy the "IP68 waterproof rating" feature for 7 SKUs (CWA625, CWA605, CWS301, CPA307H, CPA304H, CWM344MP, CWM404MP). Verified no regression against genuine IP68 cases (e.g. CWA4152MH).
- **Unmet-feature disclosure banner** — when the best-matching case for a user's selected features doesn't actually have certification for one of them (checked via `getUnmetFeatureLabels()` against BC `certifications` and enrichment `features`), `BundleItem.unmetFeatureLabels` is set and both `StepReview.tsx`/`StepBundle.tsx` render an amber banner ("No case with X is available for {device} — showing the closest match instead.") with an inline "Contact sales" escalation link, instead of silently showing a non-matching case as if it fit.

### Key files
| File | Purpose |
|------|---------|
| `src/lib/enrichment.ts` | **Primary recommendation control** — SKU→attribute map, runtime cache |
| `src/lib/bigcommerce.ts` | BC API client — `getAllProducts()`, `getFirstVariantIds()`; resolves `custom_url` → `product_url` for click-through links |
| `src/lib/claudeEnrichment.ts` | Batch Claude inference for unknown SKUs |
| `src/app/api/bundle/route.ts` | Live bundle builder — per-case mount selection with compatibility filter; `getUnmetFeatureLabels()` for disclosure banner; `FEATURE_TO_CERT_KEYWORD` for cert matching |
| `src/app/api/ai-edit/route.ts` | Two-pass Claude AI edit — intent parsing + BC candidate selection |
| `src/app/api/claude/route.ts` | "Why this bundle fits" reasoning paragraph — only place Anthropic SDK is called |
| `src/app/api/contact/route.ts` | HubSpot Forms Submission API — no auth token; `message` field carries bundle context |
| `src/app/api/cart/route.ts` | BC cart creation — prefers live BC IDs over `SKU_TO_BC_IDS` fallback |
| `src/app/api/admin/enrich/route.ts` | One-shot seed endpoint — POST to regenerate enrichment map |
| `src/components/configurator/StepContact.tsx` | Custom React contact form — builds `message` from bundle state |
| `src/components/configurator/StepBundle.tsx` | Bundle step — "Share bundle" is a real `<a href="mailto:...">`; item name/thumbnail link to BC product page |
| `src/lib/ConfiguratorContext.tsx` | `liveBundleOptions` state, `SET_BUNDLE_OPTIONS`, 3-priority `liveProducts`; feature/scenario/certified changes invalidate the cached bundle |
| `src/components/configurator/StepReview.tsx` | Fetches `/api/bundle` on mount; calls `/api/ai-edit` for AI edits; no-products message; unmet-feature banner; item name/thumbnail link to BC product page |
| `src/lib/questions.ts` | `ENV_QUESTIONS_TABLET` — `power_needed` removed, `mount_install` added (conditional); `getActiveTabletQuestions(mountSurface?)` exported |
| `src/lib/catalog.ts` | Feature labels updated; `vesa_compatible` + `magconnect` + `screen_protector` removed from `DEVICE_FEATURE_MAP` |
| `src/lib/aiEdit.ts` | **Superseded** — retained for reference; no longer imported |
| `src/components/ui/HubSpotForm.tsx` | **Superseded** — retained; embed approach abandoned |
| `src/types/index.ts` | `BundleItem` — `productUrl` (BC product page link), `unmetFeatureLabels` (disclosure banner) |

---

## ENRICHMENT WORKFLOW

Run when BC catalog changes (new SKUs added):

```bash
# 1. Regenerate enrichment for all current BC products
curl -s -X POST http://localhost:3000/api/admin/enrich \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['typescript'])"

# 2. Paste the output into PRODUCT_ENRICHMENT in src/lib/enrichment.ts
# 3. Manually re-add mount_surface arrays, vesa_compatible/magconnect case features,
#    and bundle_priority values — the enrich endpoint does not generate these.
# 4. Commit enrichment.ts
```

### Enrichment field reference
| Field | Applies to | Values | Effect |
|-------|-----------|--------|--------|
| `mount_surface` | Mounts | Array of `wall\|vehicle\|desk\|pole\|na` | A mount can list multiple surfaces. `scoreMount` uses `.includes()` to match. BC `solution_type` is used as a secondary score for adhesive vs drill-down preference. |
| `features` | Accessories + Cases | FeatureId array | **Accessories:** scored when user selects matching features or scenario implies them. **Cases:** `vesa_compatible` gates whether drill-only mounts are allowed; `magconnect` is informational. Neither is user-selectable. |
| `series` | Cases | `Extreme\|Bold\|Slim\|Edge\|Standard\|Pro\|Go` | Used to rank cases by ruggedness fit |
| `bundle_priority` | Cases + Mounts | `1` = preferred, `2` = secondary | Tie-breaker when two products score equally. All 7 HD mount SKUs use `1`. |

Valid `features` values for **accessories**: `shoulder_strap`, `hand_strap`, `screen_protector`, `kensington_lock`, `magsafe`  
Valid `features` values for **cases**: `vesa_compatible`, `magconnect` (internal use only — not selectable)

**Case-mount compatibility (enforced in `/api/bundle`):**
| Case series | VESA / Drill-only mounts | MagConnect |
|---|---|---|
| Bold | ✅ | ✅ |
| Extreme (HTA6024, CWM347MP) | ✅ | ✅ |
| Slim, Pro, Go, Edge (tablet) | ❌ | ✅ |
| iPhone (any series) | — | — (no mounts) |

HD mounts (`solution_type: ['Drill Down', 'Adhesive']`) qualify for all case series since adhesive option is always present.

**`hand_strap` note:** For iPhone accessories, set `features: ['hand_strap']` in enrichment.ts. It is NOT selectable by iPhone users — implied automatically when `carry_style` is `holster` or `hand`. For tablet devices, `hand_strap` remains selectable.

**`screen_protector` note:** Removed from selectable features in `DEVICE_FEATURE_MAP` but retained as a valid FeatureId in enrichment. Scoring in `/api/bundle` still uses it to recommend screen protector accessories automatically.

Empty `{}` entries are intentional — they mark known BC SKUs so the bundle route skips runtime Claude inference for them.

---

## DEV SERVER

Requires Node v20 via nvm:
```bash
source ~/.nvm/nvm.sh && nvm use 20.20.2 && npm run dev
```
Runs on **localhost:3000**.

`playwright` is installed as a devDependency for driving headless-browser UI verification (screenshot + console-error checks) during development. Not part of the production build.

---

## CRITICAL: Tailwind v4 CSS cascade layer gotcha

Tailwind v4 places all utility classes inside `@layer utilities`. Any CSS written outside a named layer (unlayered) sits **above** all named layers in the cascade and will override Tailwind utilities regardless of specificity.

- **Base resets (`* { margin: 0; padding: 0 }`) MUST go inside `@layer base`**, not bare in the stylesheet. Otherwise they silently zero out all Tailwind margin/padding utilities.
- **For critical layout spacing**, use a plain CSS class in globals.css (like `.page-outer`) rather than Tailwind utilities. Unlayered class selectors beat `@layer base` resets and are immune to layer conflicts.
- Do NOT write bare `*, body, html` rules outside a layer — they will break spacing utilities globally.

There is no `tailwind.config.ts`; brand colors are registered via `@theme` in globals.css (Tailwind v4 pattern):
```css
@theme { --color-brand: #c8291c; --color-brand-hover: #a8221a; --color-share: #534AB7; }
```

---

## CRITICAL RULES

1. **Claude API is server-only.** The Anthropic SDK must never be imported in any client component. Only `src/app/api/claude/route.ts` and `src/app/api/ai-edit/route.ts` call it.

2. **No `use client` on API routes.** All files in `src/app/api/` are server-side by default.

3. **Prototype is the UI source of truth.** If there is any ambiguity about layout, spacing, color, or interaction behavior, open `configurator_v16_final.html` and match it exactly.

4. **All 5 steps plus contact must work end to end.** The configurator must be fully navigable from device selection through the bundle view with all three CTA actions (Add to cart, Contact sales, Share bundle) wired up.

5. **AI edits are server-side only.** `/api/ai-edit` handles both Claude passes and the BC query. The case is always locked — AI edits only swap Mount or Accessory. `src/lib/aiEdit.ts` is retained for reference but is no longer the active implementation.

6. **TypeScript strict mode.** No `any` types. All component props must be typed.

7. **Tabler Icons via `@tabler/icons-react`.** Use the React component API: `import { IconShield } from '@tabler/icons-react'`. Icon names map from `ti-*` classes by converting to PascalCase with `Icon` prefix (e.g. `ti-shield` → `IconShield`).

8. **BigCommerce REST only — no GraphQL.** All BC fetches go through `src/lib/bigcommerce.ts`. Never call BC directly from components.

9. **Case SKU is always the anchor for AI swaps.** When swapping Mount or Accessory, always inherit `device_compatibility` and certifications from the current case's custom fields.

10. **`product_status: "Request for Quote"` is a hard fallback trigger.** Exclude RFQ products from bundle and AI selection; trigger contact sales if no other candidates exist.

---

## BIGCOMMERCE CATALOG — CUSTOM FIELD REQUIREMENTS

The bundle logic in `/api/bundle/route.ts` is only as accurate as the custom field data in BC. See `docs/BUILD_REFERENCE.md` for detailed analysis of each priority. Summary:

| Custom Field | Applies To | Values | Impact |
|---|---|---|---|
| `mount_surface` | Mounts | `wall\|vehicle\|desk\|pole\|na` | Eliminates mount keyword fragility |
| `features` | Accessories | `shoulder_strap\|hand_strap\|screen_protector\|kensington_lock\|magsafe` | Direct feature→accessory mapping |
| `series` | Cases | `Extreme\|Bold\|Slim\|Edge` | Enables feature-driven case ranking |
| `bundle_priority` | Cases + Mounts | `1\|2\|3` | Controls Option 1 vs Option 2 ordering |
| `features` | Cases | same FeatureId vocabulary | Scores cases against user preferences |
| `device_compatibility` | Cases | exact device name strings | Must match configurator device list exactly |
| `product_status` | All | `Request for Quote` | Triggers contact sales path for RFQ items |
