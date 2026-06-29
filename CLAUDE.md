# CLAUDE.md — Joy Factory aXtion Product Configurator
## Phase 1 Build Instructions for Claude Code

**Project:** Joy Factory aXtion guided selling configurator  
**Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS v4  
**AI:** Anthropic Claude API (claude-sonnet-4-6) — server-side only  
**Integrations:** BigCommerce Storefront API, HubSpot CRM API  
**Deployment target:** Vercel  

---

## CURRENT STATUS — PHASE 2 COMPLETE (except AI edit)

**Phase 1 complete + Phase 2 Steps 1–3 fully working.** All 5 steps navigable, live BC data drives the bundle, enrichment layer controls recommendations. Do not delete or rebuild from scratch.

### What's done
- All 5 steps + Contact Sales fully navigable
- Real Claude API call wired in (`/api/claude` → StepBundle "Why this bundle fits" section)
- HubSpot and BigCommerce cart API routes implemented
- embed.js widget in `/public/embed.js` for drop-in iframe embedding
- **Live BC bundle** — `/api/bundle` fetches all BC products, filters cases by `device_compatibility`, scores mounts/accessories via enrichment data, returns up to 2 `BundleOption[]` with real BC product IDs
- **Enrichment layer** — `src/lib/enrichment.ts` is the recommendation control file. Maps SKU → `{ mount_surface, features[], series, bundle_priority }`. Scoring uses this first; keyword matching is the fallback for any SKU not in the map.
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

### Phase 2 files
| File | Purpose |
|------|---------|
| `src/lib/bigcommerce.ts` | BC API client — `getAllProducts()`, `getFirstVariantIds()` |
| `src/lib/enrichment.ts` | **Primary recommendation control** — SKU→attribute map, runtime cache |
| `src/lib/claudeEnrichment.ts` | Batch Claude inference for unknown SKUs |
| `src/app/api/bundle/route.ts` | Live bundle builder — enrichment-scored, BC-sourced |
| `src/app/api/admin/enrich/route.ts` | One-shot seed endpoint — POST to regenerate enrichment map |
| `src/app/api/prices/route.ts` | SKU→price fallback (mostly superseded by bundle route) |
| `src/app/api/products/route.ts` | Raw BC product list endpoint |
| `src/types/index.ts` | `BundleItem` gains `bcProductId?`/`bcVariantId?`; `TabletScenarios` gains `mount_install?: 'drill'\|'adhesive'\|'rail'` |
| `src/lib/ConfiguratorContext.tsx` | `liveBundleOptions` state, `SET_BUNDLE_OPTIONS`, 3-priority `liveProducts` |
| `src/components/configurator/StepReview.tsx` | Fetches `/api/bundle` on mount, no-products message |
| `src/app/api/cart/route.ts` | Prefers live BC IDs over `SKU_TO_BC_IDS` map |
| `src/lib/aiEdit.ts` | Clears BC IDs on AI swap |
| `src/lib/questions.ts` | `ENV_QUESTIONS_TABLET` — `power_needed` removed, `mount_install` added (conditional), choice labels updated; `getActiveTabletQuestions(mountSurface?)` helper exported |

### Phase 2 still to do
- Phase 2 Step 4: Two-pass Claude AI logic at Review step (`/api/ai-edit` route) — currently still client-side keyword matching in `aiEdit.ts`

### Enrichment workflow (run when BC catalog changes)
```bash
# 1. Seed enrichment for all current BC products
curl -s -X POST http://localhost:3000/api/admin/enrich \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['typescript'])"

# 2. Paste the output into PRODUCT_ENRICHMENT in src/lib/enrichment.ts
# 3. Commit enrichment.ts
```

### Enrichment field reference
| Field | Applies to | Values | Effect |
|-------|-----------|--------|--------|
| `mount_surface` | Mounts | `wall\|vehicle\|desk\|pole\|na` | Selects mount when user picks this scenario answer; BC `solution_type` custom field is then used as a secondary score for adhesive vs drill-down preference |
| `features` | Accessories (+ Cases) | FeatureId array | Scores accessory when user selects matching feature checkboxes OR when scenario implies the feature |
| `series` | Cases | `Extreme\|Bold\|Slim\|Edge\|Standard\|Pro\|Go` | Used to rank cases by ruggedness fit |
| `bundle_priority` | Cases + Mounts | `1` = preferred, `2` = secondary | Tie-breaker when two products score equally. All 7 HD mount SKUs use `bundle_priority: 1` so they beat non-HD mounts of the same surface type. |

Valid `features` values: `shoulder_strap`, `hand_strap`, `screen_protector`, `kensington_lock`, `magsafe`

**`hand_strap` note:** For iPhone accessories (e.g. CPX302 Belt Clip Holster), set `features: ['hand_strap']` in enrichment.ts. The `hand_strap` FeatureId is intentionally NOT selectable by iPhone users in the Features step — it is implied automatically when `carry_style` is `holster` or `hand` in the Environment step. For tablet devices, `hand_strap` remains a selectable feature.

Empty `{}` entries are intentional — they mark known BC SKUs so the bundle route skips runtime Claude inference for them.

### Dev server
Requires Node v20 via nvm:
```bash
source ~/.nvm/nvm.sh && nvm use 20.20.2 && npm run dev
```
Runs on **localhost:3000**.

### Key files — actual current state (supersedes Step 11 below)

**`src/app/page.tsx`** — current:
```tsx
import { ConfiguratorProvider } from '../lib/ConfiguratorContext';
import ConfiguratorShell from '../components/configurator/ConfiguratorShell';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 flex justify-center items-start">
      <div className="w-full max-w-[720px] page-outer">
        <ConfiguratorProvider>
          <ConfiguratorShell />
        </ConfiguratorProvider>
      </div>
    </main>
  );
}
```

**`src/app/globals.css`** — current structure:
```css
@import "tailwindcss";

/* Design tokens */
:root { ... }
@theme { --color-brand: #c8291c; --color-brand-hover: #a8221a; --color-share: #534AB7; }

/* Base resets — MUST stay in @layer base (see Tailwind v4 gotcha below) */
@layer base {
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ...; background: var(--color-bg); ... }
}

/* Page layout — plain unlayered class for guaranteed top/bottom gap */
.page-outer { padding: 3.5rem 1.25rem; }

/* Shared utilities */
@utility item-list { border: 1px solid #d6d3d1; border-radius: 14px; overflow: hidden; }
@utility hint-strip { ... }

@keyframes fadeIn { ... }
```

### CRITICAL: Tailwind v4 CSS cascade layer gotcha

Tailwind v4 places all utility classes inside `@layer utilities`. Any CSS written outside a named layer (unlayered) sits **above** all named layers in the cascade and will override Tailwind utilities regardless of specificity. This means:

- **Base resets (`* { margin: 0; padding: 0 }`) MUST go inside `@layer base`**, not bare in the stylesheet. Otherwise they silently zero out all Tailwind margin/padding utilities.
- **For critical layout spacing** (page-level padding), use a plain CSS class in globals.css (like `.page-outer`) rather than Tailwind utilities. Unlayered class selectors (specificity 0,1,0) beat the `@layer base` reset (specificity 0,0,0) and are immune to layer conflicts.
- Do NOT write bare `*, body, html` rules outside a layer — they will break spacing utilities globally.

---

## STRATEGY BEFORE TOUCHING ANY CODE

~~This is a full rebuild.~~ Phase 1 is complete. Read the current state above before making any changes. The steps below are historical build instructions — use them as reference for how the code is structured, not as instructions to re-run.

---

## PHASE 1 SCOPE

Phase 1 delivers a working configurator with:
- All 5 steps functional with correct branching logic
- Hardcoded bundle catalog (no live BigCommerce API calls yet)
- Real Claude API call for the "Why this bundle fits" reasoning paragraph
- Keyword-based AI agent SKU swap in the Review step (no Claude API call needed here)
- HubSpot contact + deal creation on Contact Sales and Purchase Now actions
- BigCommerce cart creation on Add to Cart (with hardcoded SKU→product_id mapping)
- Full responsive UI matching the v16 prototype

---

## REFERENCE PROTOTYPE

The canonical UI reference is `configurator_v16_final.html`. Every layout decision, color, spacing, interaction, and flow in that file is the source of truth. When in doubt, match the prototype exactly. The prototype uses:
- CSS custom properties for theming (already defined in the HTML — map these to Tailwind or globals.css)
- Tabler Icons via CDN (`ti-*` classes) — install `@tabler/icons-react` for the React version
- Joy Factory red: `#c8291c`
- Share panel purple: `#534AB7`
- Font: system sans-serif stack

---

## STEP 1 — PROJECT CLEANUP

Before writing any new code, delete all existing source files:

```bash
rm -rf src/
mkdir -p src/app/api/hubspot
mkdir -p src/app/api/cart  
mkdir -p src/app/api/claude
mkdir -p src/components/configurator
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/types
```

Install required packages:
```bash
npm install @anthropic-ai/sdk @tabler/icons-react
npm install --save-dev @types/node
```

---

## STEP 2 — ENVIRONMENT VARIABLES

Ensure `.env.local` contains all of the following. Do not overwrite values that already exist — only add missing ones:

```bash
# Anthropic
ANTHROPIC_API_KEY=                    # already set

# BigCommerce
BIGCOMMERCE_STORE_HASH=               # already set
BIGCOMMERCE_ACCESS_TOKEN=             # already set
BIGCOMMERCE_STOREFRONT_TOKEN=         # already set

# HubSpot
HUBSPOT_ACCESS_TOKEN=                 # add if missing
```

Create `src/app/api/env.d.ts` (or extend `next-env.d.ts`) to type these:
```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    ANTHROPIC_API_KEY: string;
    BIGCOMMERCE_STORE_HASH: string;
    BIGCOMMERCE_ACCESS_TOKEN: string;
    BIGCOMMERCE_STOREFRONT_TOKEN: string;
    HUBSPOT_ACCESS_TOKEN: string;
  }
}
```

---

## STEP 3 — TYPE DEFINITIONS

Create `src/types/index.ts` with all shared types. These must match the data structures used throughout the prototype:

```typescript
// ─── Device ───────────────────────────────────────────────────────────────────

export type DeviceFamily =
  | 'ipad_pro' | 'ipad_air' | 'ipad_std' | 'ipad_mini'
  | 'iphone' | 'surface' | 'other';

export interface Device {
  id: string;          // e.g. 'ipad_pro_11_m5'
  name: string;        // e.g. 'iPad Pro 11" (M5)'
  family: DeviceFamily;
}

export interface DeviceGroup {
  label: string;       // e.g. 'Apple iPad'
  icon: string;        // Tabler icon name e.g. 'device-ipad'
  devices: Device[];
}

// ─── Features ─────────────────────────────────────────────────────────────────

export type FeatureId =
  | 'ip_rating' | 'mil_rating' | 'screen_protector' | 'reinforced_corners'
  | 'chemical_resistant' | 'thermo_defend' | 'vesa_compatible' | 'magconnect'
  | 'magsafe' | 'shoulder_strap' | 'hand_strap' | 'kick_stand'
  | 'pencil_holder' | 'asset_tag' | 'kensington_lock';

export interface Feature {
  id: FeatureId;
  title: string;
  desc: string;
}

// ─── Environment / Scenarios ──────────────────────────────────────────────────

// iPhone environment answers
export interface IphoneScenarios {
  carry_style?: 'pocket' | 'holster' | 'hand' | 'bag';
  hands_free?: 'yes' | 'no';
  active?: 'yes' | 'no';
  gloves?: 'yes' | 'no';
  sharing?: 'shared' | 'personal';
}

// Tablet/Surface environment answers
export interface TabletScenarios {
  motion?: 'carried' | 'stationed' | 'both';
  mount_surface?: 'wall' | 'vehicle' | 'desk' | 'pole' | 'na';
  mount_rotation?: 'yes' | 'no';
  power_needed?: 'yes' | 'no';
  location?: 'indoor' | 'outdoor' | 'both';
  hands_free?: 'yes' | 'no';
  sharing?: 'shared' | 'personal';
}

export type Scenarios = IphoneScenarios | TabletScenarios;

// ─── Bundle / Products ────────────────────────────────────────────────────────

export type ProductType = 'Case' | 'Mount' | 'Accessory';

export interface BundleItem {
  type: ProductType;
  icon: string;        // Tabler icon name
  name: string;
  sku: string;
  unitPrice: number;
}

export interface BundleOption {
  items: BundleItem[];
}

// ─── AI Edits ─────────────────────────────────────────────────────────────────

export interface AppliedEdit {
  text: string;
  matched: boolean;
  detail?: string;
}

// ─── Configurator State ───────────────────────────────────────────────────────

export type ContactSource = 'certified' | 'escalation' | 'manual' | '';

export interface ConfiguratorState {
  device: Device | null;
  certified: 'yes' | 'no' | null;
  features: FeatureId[];
  scenarios: Partial<IphoneScenarios & TabletScenarios>;
  editNote: string;
  appliedEdits: AppliedEdit[];
}

// ─── HubSpot Payload ──────────────────────────────────────────────────────────

export type HubSpotPath =
  | 'contact_sales_from_bundle'
  | 'certified_case_inquiry'
  | 'purchase_now';

export interface HubSpotPayload {
  path: HubSpotPath;
  device: string;
  certified: boolean;
  features_selected: FeatureId[];
  environment: Partial<IphoneScenarios & TabletScenarios>;
  bundle: Array<{
    type: ProductType;
    name: string;
    sku: string;
    qty: number;
    unit_price: number;
  }>;
  bundle_total: number;
  ai_edits: string[];
  contact?: {
    first_name: string;
    last_name: string;
    email: string;
    company: string;
  };
}

// ─── BigCommerce Cart ─────────────────────────────────────────────────────────

export interface CartLineItem {
  quantity: number;
  product_id: number;
  variant_id: number;
}
```

---

## STEP 4 — CATALOG DATA

Create `src/lib/catalog.ts`. This is the single source of truth for all hardcoded product and device data. Copy these values exactly — they must match the prototype:

```typescript
import { DeviceGroup, Feature, FeatureId, BundleOption } from '../types';

// ─── Device Groups ────────────────────────────────────────────────────────────

export const DEVICE_GROUPS: DeviceGroup[] = [
  {
    label: 'Apple iPad',
    icon: 'device-ipad',
    devices: [
      { id: 'ipad_pro_11_m5', name: 'iPad Pro 11" (M5)', family: 'ipad_pro' },
      { id: 'ipad_pro_13_m5', name: 'iPad Pro 13" (M5)', family: 'ipad_pro' },
      { id: 'ipad_pro_11_m4', name: 'iPad Pro 11" (M4)', family: 'ipad_pro' },
      { id: 'ipad_air_11_m4', name: 'iPad Air 11" (M4)', family: 'ipad_air' },
      { id: 'ipad_air_13_m4', name: 'iPad Air 13" (M4)', family: 'ipad_air' },
      { id: 'ipad_air_11_m3', name: 'iPad Air 11" (M3)', family: 'ipad_air' },
      { id: 'ipad_11_a16',    name: 'iPad 11" (A16)',    family: 'ipad_std' },
      { id: 'ipad_10_9_10th', name: 'iPad 10.9" (10th Gen)', family: 'ipad_std' },
      { id: 'ipad_9th_gen',   name: 'iPad 9th Gen',      family: 'ipad_std' },
      { id: 'ipad_mini_a17',  name: 'iPad mini (A17 Pro)', family: 'ipad_mini' },
      { id: 'ipad_mini_6',    name: 'iPad mini 6',       family: 'ipad_mini' },
    ],
  },
  {
    label: 'Apple iPhone',
    icon: 'device-mobile',
    devices: [
      { id: 'iphone_17', name: 'iPhone 17', family: 'iphone' },
      { id: 'iphone_16', name: 'iPhone 16', family: 'iphone' },
      { id: 'iphone_15', name: 'iPhone 15', family: 'iphone' },
    ],
  },
  {
    label: 'Microsoft Surface',
    icon: 'device-laptop',
    devices: [
      { id: 'surface_pro_13_12th', name: 'Surface Pro 13" (12th Ed)', family: 'surface' },
      { id: 'surface_pro_13_11th', name: 'Surface Pro 13" (11th Ed)', family: 'surface' },
      { id: 'surface_pro_10',      name: 'Surface Pro 10',            family: 'surface' },
      { id: 'surface_pro_10_5g',   name: 'Surface Pro 10 (5G)',       family: 'surface' },
      { id: 'surface_pro_9',       name: 'Surface Pro 9',             family: 'surface' },
      { id: 'surface_pro_12',      name: 'Surface Pro 12"',           family: 'surface' },
      { id: 'surface_go_4',        name: 'Surface Go 4',              family: 'surface' },
    ],
  },
  {
    label: 'Other device',
    icon: 'dots',
    devices: [
      { id: 'samsung_tab_s9', name: 'Samsung Galaxy Tab S9', family: 'other' },
      { id: 'chromebook',     name: 'Chromebook',            family: 'other' },
      { id: 'other_device',   name: 'Other / not listed',    family: 'other' },
    ],
  },
];

// ─── Device → Allowed Features Map ───────────────────────────────────────────

export const DEVICE_FEATURE_MAP: Record<string, FeatureId[]> = {
  ipad_pro:  ['ip_rating','mil_rating','screen_protector','reinforced_corners','vesa_compatible','magconnect','shoulder_strap','hand_strap','kick_stand','pencil_holder','asset_tag','kensington_lock'],
  ipad_air:  ['ip_rating','mil_rating','screen_protector','reinforced_corners','vesa_compatible','magconnect','shoulder_strap','hand_strap','kick_stand','pencil_holder','asset_tag','kensington_lock'],
  ipad_std:  ['ip_rating','mil_rating','screen_protector','reinforced_corners','vesa_compatible','magconnect','shoulder_strap','hand_strap','kick_stand','pencil_holder','asset_tag','kensington_lock'],
  ipad_mini: ['ip_rating','mil_rating','screen_protector','reinforced_corners','vesa_compatible','magconnect','shoulder_strap','hand_strap','kick_stand','pencil_holder','asset_tag','kensington_lock'],
  iphone:    ['ip_rating','mil_rating','screen_protector','reinforced_corners','shoulder_strap','magsafe'],  // hand_strap omitted — implied via carry_style scenario answer
  surface:   ['ip_rating','mil_rating','screen_protector','reinforced_corners','chemical_resistant','thermo_defend','vesa_compatible','magconnect','shoulder_strap','hand_strap','kick_stand','asset_tag','kensington_lock'],
  other:     ['ip_rating','mil_rating','screen_protector','reinforced_corners','shoulder_strap','hand_strap','kick_stand','asset_tag','kensington_lock'],
};

// ─── All Features ─────────────────────────────────────────────────────────────

export const ALL_FEATURES: Feature[] = [
  { id: 'ip_rating',          title: 'IP68 waterproof rating',        desc: 'Sealed against dust and water submersion' },
  { id: 'mil_rating',         title: 'MIL-STD-810H rated',            desc: 'Meets military drop and durability standard' },
  { id: 'screen_protector',   title: 'Screen protector included',     desc: 'Built-in scratch and impact protection' },
  { id: 'reinforced_corners', title: 'Reinforced corners',            desc: 'Extra shock absorption at impact points' },
  { id: 'chemical_resistant', title: 'Chemical resistant',            desc: 'Withstands solvents, oils, and cleaning agents' },
  { id: 'thermo_defend',      title: 'ThermoDefend (temp protection)', desc: 'Insulates device in extreme temperatures' },
  { id: 'vesa_compatible',    title: 'VESA mount compatible',         desc: 'Attaches to standard wall, arm, or kiosk mounts' },
  { id: 'magconnect',         title: 'MagConnect compatible',         desc: 'Quick-attach magnetic mounting system' },
  { id: 'magsafe',            title: 'MagSafe compatible',            desc: 'Works with MagSafe chargers and mounts' },
  { id: 'shoulder_strap',     title: 'Shoulder strap / tether',       desc: 'Hands-free carrying while moving' },
  { id: 'hand_strap',         title: 'Adjustable hand strap',         desc: 'Secure one-handed grip while in use' },
  { id: 'kick_stand',         title: 'Kick stand included',           desc: 'Built-in stand for hands-free viewing' },
  { id: 'pencil_holder',      title: 'Pencil / pen holder',           desc: 'Built-in slot for Apple Pencil or Surface Pen' },
  { id: 'asset_tag',          title: 'Asset tag window',              desc: 'Visible slot for inventory tracking labels' },
  { id: 'kensington_lock',    title: 'Kensington lock compatible',    desc: 'Physical security lock point' },
];

// ─── Bundle Options ───────────────────────────────────────────────────────────

export const BP_IPHONE: BundleOption[] = [
  {
    items: [
      { type: 'Case',      icon: 'shield',         name: 'aXtion Edge',       sku: 'CPA330S',   unitPrice: 49 },
      { type: 'Accessory', icon: 'briefcase',      name: 'Belt Clip Holster', sku: 'CPX302',    unitPrice: 24 },
      { type: 'Accessory', icon: 'device-tablet',  name: 'Screen Protector',  sku: 'CKX121',    unitPrice: 19 },
    ],
  },
];

export const BP_TABLET: BundleOption[] = [
  {
    items: [
      { type: 'Case',      icon: 'shield',         name: 'aXtion Bold',        sku: 'CWA4122MP', unitPrice: 89  },
      { type: 'Mount',     icon: 'layout-sidebar', name: 'VESA 75 Mount Plate', sku: 'CWM408MPA', unitPrice: 149 },
      { type: 'Accessory', icon: 'device-tablet',  name: 'Screen Protector',   sku: 'CKX121',    unitPrice: 29  },
    ],
  },
  {
    items: [
      { type: 'Case',      icon: 'shield',         name: 'aXtion Slim',        sku: 'CWA4152MH', unitPrice: 79  },
      { type: 'Mount',     icon: 'layout-sidebar', name: 'Counter Mount Pro',  sku: 'CWM409MPA', unitPrice: 139 },
      { type: 'Accessory', icon: 'device-tablet',  name: 'Shoulder Strap II',  sku: 'CWX202',    unitPrice: 20  },
    ],
  },
];

// ─── SKU → BigCommerce product_id / variant_id Map (Phase 1 hardcoded) ───────
// TODO Phase 2: replace with live BC catalog API lookup

export const SKU_TO_BC_IDS: Record<string, { product_id: number; variant_id: number }> = {
  CPA330S:   { product_id: 1001, variant_id: 2001 },
  CPX302:    { product_id: 1002, variant_id: 2002 },
  CKX121:    { product_id: 1003, variant_id: 2003 },
  CWA4122MP: { product_id: 1004, variant_id: 2004 },
  CWM408MPA: { product_id: 1005, variant_id: 2005 },
  CWA4152MH: { product_id: 1006, variant_id: 2006 },
  CWM409MPA: { product_id: 1007, variant_id: 2007 },
  CWX202:    { product_id: 1008, variant_id: 2008 },
  HPA3224:   { product_id: 1009, variant_id: 2009 },
  HTA6024:   { product_id: 1010, variant_id: 2010 },
  CWM412MPA: { product_id: 1011, variant_id: 2011 },
  CWM415MPA: { product_id: 1012, variant_id: 2012 },
  CKX130:    { product_id: 1013, variant_id: 2013 },
};

// ─── AI Swap Catalogs ─────────────────────────────────────────────────────────

export interface SwapCandidate {
  name: string;
  sku: string;
  unitPrice: number;
  keywords: string[];
}

export const SWAP_CATALOG_IPHONE: Record<string, SwapCandidate[]> = {
  Case: [
    { name: 'aXtion Edge',    sku: 'CPA330S', unitPrice: 49, keywords: ['edge','standard','regular'] },
    { name: 'aXtion Extreme', sku: 'HPA3224', unitPrice: 89, keywords: ['extreme','rugged','heavy duty','hazardous'] },
  ],
  Accessory: [
    { name: 'Belt Clip Holster', sku: 'CPX302', unitPrice: 24, keywords: ['holster','belt','clip','belt clip'] },
    { name: 'Screen Protector',  sku: 'CKX121', unitPrice: 19, keywords: ['screen','protector','glass'] },
    { name: 'Shoulder Strap II', sku: 'CWX202', unitPrice: 20, keywords: ['shoulder','strap','carry','sling'] },
  ],
};

export const SWAP_CATALOG_TABLET: Record<string, SwapCandidate[]> = {
  Mount: [
    { name: 'VESA 75 Mount Plate', sku: 'CWM408MPA', unitPrice: 149, keywords: ['vesa','wall','plate'] },
    { name: 'Counter Mount Pro',   sku: 'CWM409MPA', unitPrice: 139, keywords: ['counter','desk','kiosk'] },
    { name: 'Vehicle Mount Pro',   sku: 'CWM412MPA', unitPrice: 179, keywords: ['vehicle','car','truck','forklift'] },
    { name: 'Wall Arm Mount',      sku: 'CWM415MPA', unitPrice: 159, keywords: ['wall arm','articulating','arm'] },
  ],
  Case: [
    { name: 'aXtion Bold',    sku: 'CWA4122MP', unitPrice: 89,  keywords: ['bold','rugged'] },
    { name: 'aXtion Slim',    sku: 'CWA4152MH', unitPrice: 79,  keywords: ['slim','thin','light'] },
    { name: 'aXtion Extreme', sku: 'HTA6024',   unitPrice: 129, keywords: ['extreme','hazardous','certified'] },
  ],
  Accessory: [
    { name: 'Screen Protector',  sku: 'CKX121', unitPrice: 29, keywords: ['screen','protector','glass'] },
    { name: 'Shoulder Strap II', sku: 'CWX202', unitPrice: 20, keywords: ['shoulder','strap','sling','carry'] },
    { name: 'Hand Strap',        sku: 'CKX130', unitPrice: 15, keywords: ['hand strap','grip','hand'] },
  ],
};
```

---

## STEP 5 — UTILITY FUNCTIONS

Create `src/lib/utils.ts`:

```typescript
import { DeviceFamily, FeatureId } from '../types';
import { DEVICE_FEATURE_MAP } from './catalog';

export function getDeviceFamily(id: string): DeviceFamily {
  if (!id) return 'other';
  if (id.startsWith('ipad_pro'))  return 'ipad_pro';
  if (id.startsWith('ipad_air'))  return 'ipad_air';
  if (id.startsWith('ipad_mini')) return 'ipad_mini';
  if (id.startsWith('ipad'))      return 'ipad_std';
  if (id.startsWith('iphone'))    return 'iphone';
  if (id.startsWith('surface'))   return 'surface';
  return 'other';
}

export function isIphoneFamily(family: DeviceFamily): boolean {
  return family === 'iphone';
}

export function getAllowedFeatures(family: DeviceFamily): FeatureId[] {
  return DEVICE_FEATURE_MAP[family] ?? DEVICE_FEATURE_MAP['other'];
}

export function getDeviceFamilyLabel(family: DeviceFamily): string {
  const labels: Record<DeviceFamily, string> = {
    ipad_pro:  'iPad Pro',
    ipad_air:  'iPad Air',
    ipad_std:  'iPad',
    ipad_mini: 'iPad mini',
    iphone:    'iPhone',
    surface:   'Microsoft Surface',
    other:     'your device',
  };
  return labels[family] ?? 'your device';
}

export function formatPrice(cents: number): string {
  return `$${cents.toFixed(2)}`;
}
```

---

## STEP 6 — CONFIGURATOR STATE (REACT CONTEXT)

Create `src/lib/ConfiguratorContext.tsx`.

This is the central state manager for the entire 5-step flow. Use React Context + useReducer. The state shape must match `ConfiguratorState` from types. Expose:

- `state` — current ConfiguratorState
- `liveProducts` — the mutable bundle items array (derived from selected bundle option, modified by AI swaps)
- `qtys` — quantity array parallel to liveProducts
- `selectedBundleOption` — index of active bundle option tab
- Actions: `SET_DEVICE`, `SET_CERTIFIED`, `TOGGLE_FEATURE`, `SET_SCENARIO`, `SET_EDIT_NOTE`, `ADD_APPLIED_EDIT`, `SET_LIVE_PRODUCTS`, `SET_QTYS`, `SET_BUNDLE_OPTION`, `RESET`

Key business rules to encode in the reducer:
- When `SET_DEVICE` fires, reset: certified→null, features→[], scenarios→{}, liveProducts→null, qtys→[1,1,1], selectedBundleOption→0
- When `SET_BUNDLE_OPTION` fires, reset: liveProducts→null, qtys→[1,1,1]
- Feature toggling: if feature already in array remove it, else add it
- `TOGGLE_FEATURE` must filter against allowed features for the current device family

---

## STEP 7 — SERVER-SIDE API ROUTES

### 7a. Claude reasoning — `src/app/api/claude/route.ts`

This is the ONLY place the Anthropic SDK is called. Never import or call it from client components.

**Input (POST body):**
```typescript
{
  deviceName: string;
  deviceFamily: DeviceFamily;
  features: FeatureId[];
  scenarios: Partial<IphoneScenarios & TabletScenarios>;
  bundle: Array<{ type: string; name: string; sku: string; qty: number }>;
  appliedEdits: AppliedEdit[];
}
```

**What it does:**
Call `claude-sonnet-4-6` with a prompt that constructs a single flowing paragraph explaining why the bundle fits the user. This replaces the hardcoded `buildReasoningParagraph()` function from the prototype with a real Claude API call.

The prompt should include all of: device name and family, selected features, all environment answers, bundle items, and any applied AI edits. Ask Claude to write 3-5 sentences in second person ("Your bundle..."), plain prose, no bullet points, no markdown.

**Output:** `{ paragraph: string }`

Handle errors gracefully — if Claude fails, return a fallback paragraph built from the same data deterministically (port the `buildReasoningParagraph` logic from the prototype as the fallback).

### 7b. HubSpot — `src/app/api/hubspot/route.ts`

**Input:** `HubSpotPayload` (defined in types)

**What it does:** Creates or updates a HubSpot contact, then creates a deal with the appropriate pipeline tag based on `path`:
- `certified_case_inquiry` → tag deal, enroll in certified inquiry workflow
- `contact_sales_from_bundle` → tag deal with full bundle context
- `purchase_now` → tag deal, then redirect to BC checkout

Use HubSpot REST API v3. Endpoints:
- `POST https://api.hubapi.com/crm/v3/objects/contacts` — create/upsert contact
- `POST https://api.hubapi.com/crm/v3/objects/deals` — create deal
- Associate contact to deal via `POST https://api.hubapi.com/crm/v4/objects/deals/{dealId}/associations/contacts/{contactId}/labels`

Store deal properties: `dealname`, `device_model`, `bundle_skus`, `bundle_total`, `certified_inquiry`, `ai_edits_requested`.

**Output:** `{ success: boolean; dealId?: string; error?: string }`

### 7c. BigCommerce cart — `src/app/api/cart/route.ts`

**Input:**
```typescript
{
  items: Array<{ sku: string; qty: number }>;  // only items with qty > 0
}
```

**What it does:**
1. Map each SKU to `product_id` + `variant_id` using `SKU_TO_BC_IDS` from catalog.ts
2. POST to `https://api.bigcommerce.com/stores/{STORE_HASH}/v3/carts`
3. Return the `redirect_urls.checkout_url`

**Output:** `{ checkoutUrl: string }` or `{ error: string }`

Log a warning for any SKU not found in `SKU_TO_BC_IDS` but don't fail the whole cart.

---

## STEP 8 — ENVIRONMENT QUESTION DATA

Create `src/lib/questions.ts` with typed question definitions. Both question sets (iPhone 5 questions, Tablet 7 questions) as typed arrays matching this interface:

```typescript
export interface EnvQuestion {
  key: string;
  q: string;
  hint: string;
  choices: Array<{ id: string; label: string }>;
}
```

Copy question text exactly from the prototype's `ENV_QUESTIONS_IPHONE` and `ENV_QUESTIONS_TABLET` arrays.

---

## STEP 9 — COMPONENT ARCHITECTURE

Build components in this order. Each component should be in `src/components/configurator/`.

### Component list and responsibilities:

**`ConfiguratorShell.tsx`** (client component, page root)
- Manages `currentStep` (0–4, plus optional 'contact' step)
- Renders step nav, progress bar, card header, step content, nav buttons
- Imports and renders the correct step component based on `currentStep`
- Handles Back/Next/Reset logic
- Connects to ConfiguratorContext

**`StepDevices.tsx`** — Step 1
- Accordion device list, all groups start closed
- On device select → dispatch SET_DEVICE → advance to step 2
- Match prototype accordion behavior exactly (chevron rotation, red left border on open)

**`StepFeatures.tsx`** — Step 2
- Certified gate shown first when certified === null
- "Yes, I need certified" → route to contact sales (certified path)
- "No" → gate hides, show flat feature list filtered by device family
- Certified/change status line with Change link
- Device filter note banner
- Single unified flat feature list (no category headers — this was updated in v10)

**`StepEnvironment.tsx`** — Step 3
- Branches on device family: iPhone gets 5 questions, tablet/Surface gets 7
- Device badge showing which question set is active
- Progress counter "X of N answered"
- All questions render as pill choices

**`StepReview.tsx`** — Step 4
- Bundle option tabs (full width, flex:1 each) — only shown when >1 option
- Item list with quantity +/− controls (min 0)
- Zeroed items shown faded with "Excluded from cart" label
- Bundle sub-total
- AI Agent box (red header, textarea, Send button)
  - On send: POST to internal `/api/ai-edit` (see below) or handle client-side with the keyword matching logic
  - On no-match result: auto-route to Contact Sales escalation path
- Confirm and see bundle button

**`StepBundle.tsx`** — Step 5
- Edits applied banner (if any matched edits)
- Product rows with UPDATED tag on swapped items, NOT IN CART tag on excluded items
- Bundle sub-total
- CTA grid: Add to cart (disabled if all qty=0) / Contact sales / Share bundle
- "Add at least one item" note when disabled
- Inline Share panel (toggles open below CTA grid, above Why section)
- "Why this bundle fits your needs" section with Joy AI badge
  - On mount: fetch `/api/claude` with current bundle context → display paragraph
  - Show loading spinner while fetching
  - Fall back to deterministic paragraph if API fails

**`StepContact.tsx`** — Contact Sales (certified / escalation / manual)
- Three variants controlled by `contactSource` prop
- Certified: banner + device chip + form (no bundle summary)
- Escalation: orange banner with quoted request + full recommended bundle summary (ALL items, zeroed ones marked) + notes textarea pre-filled
- Manual: info banner + full bundle summary + form
- Bundle summary always shows complete recommended bundle for sales context

### Shared UI components in `src/components/ui/`:

**`ProgressBar.tsx`** — animated fill bar  
**`StepNav.tsx`** — step dots with done/active states and connecting lines  
**`LoadingSpinner.tsx`** — reuse/replace existing one  
**`QtyControl.tsx`** — +/− quantity control with min 0  
**`BundleItemRow.tsx`** — single product row used in both Review and Bundle steps  

---

## STEP 10 — AI EDIT LOGIC

The keyword-matching SKU swap logic should live in `src/lib/aiEdit.ts` as a pure function (not a server route — it runs client-side):

```typescript
export function interpretEditRequest(
  text: string,
  products: BundleItem[],
  qtys: number[],
  isIphone: boolean
): { matched: boolean; detail?: string; updatedProducts?: BundleItem[]; updatedQtys?: number[] }
```

Port the logic exactly from the prototype's `interpretEditRequest` function. This function:
- Detects target type (Mount / Case / Accessory) from keywords in the text
- Finds the best matching SKU from the appropriate swap catalog
- Returns updated products and qtys arrays (immutably)
- Returns `matched: false` if no type detected or no matching SKU found

When `matched: false`, the calling component should call `goContactSales('escalation', text)`.

---

## STEP 11 — PAGE AND LAYOUT

**`src/app/layout.tsx`**
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'aXtion Configurator — Joy Factory',
  description: 'Find the right aXtion case, mount, and accessories for your device.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**`src/app/page.tsx`** — see CURRENT STATUS section above for the actual file.

**`src/app/globals.css`** — see CURRENT STATUS section above for the actual file. Note: there is no `tailwind.config.ts`; brand colors are registered via `@theme` in globals.css (Tailwind v4 pattern).

---

## STEP 12 — REASONING PARAGRAPH FALLBACK

In `src/lib/reasoning.ts`, port the `buildReasoningParagraph` function from the prototype as a pure TypeScript function. This is used:
1. As the fallback when the `/api/claude` route fails
2. As the loading state until the API responds

The function signature:
```typescript
export function buildReasoningParagraph(
  deviceName: string,
  deviceFamily: DeviceFamily,
  features: FeatureId[],
  scenarios: Partial<IphoneScenarios & TabletScenarios>,
  products: BundleItem[],
  appliedEdits: AppliedEdit[]
): string
```

---

## STEP 13 — BUILD ORDER

Build in this exact sequence to avoid import errors:

1. `src/types/index.ts`
2. `src/lib/catalog.ts`
3. `src/lib/utils.ts`
4. `src/lib/questions.ts`
5. `src/lib/aiEdit.ts`
6. `src/lib/reasoning.ts`
7. `src/lib/ConfiguratorContext.tsx`
8. `src/app/api/claude/route.ts`
9. `src/app/api/hubspot/route.ts`
10. `src/app/api/cart/route.ts`
11. `src/components/ui/` (all UI primitives)
12. `src/components/configurator/StepDevices.tsx`
13. `src/components/configurator/StepFeatures.tsx`
14. `src/components/configurator/StepEnvironment.tsx`
15. `src/components/configurator/StepReview.tsx`
16. `src/components/configurator/StepBundle.tsx`
17. `src/components/configurator/StepContact.tsx`
18. `src/components/configurator/ConfiguratorShell.tsx`
19. `src/app/globals.css`
20. `src/app/layout.tsx`
21. `src/app/page.tsx`

---

## STEP 14 — CRITICAL RULES

**Never violate these:**

1. **Claude API is server-only.** The Anthropic SDK must never be imported in any client component. Only `src/app/api/claude/route.ts` calls it.

2. **No `use client` on API routes.** All files in `src/app/api/` are server-side by default.

3. **Prototype is the UI source of truth.** If there is any ambiguity about layout, spacing, color, or interaction behavior, open `configurator_v16_final.html` and match it exactly.

4. **Hardcoded data for Phase 1.** Do not add live BigCommerce catalog fetching. The `SKU_TO_BC_IDS` map and bundle option arrays in `catalog.ts` are the data layer for Phase 1. Phase 2 will replace these with live API calls.

5. **All 5 steps plus contact must work end to end.** Do not leave any step as a placeholder. The configurator must be fully navigable from device selection through to the bundle view with all three CTA actions (Add to cart, Contact sales, Share bundle) wired up.

6. **AI Agent on Review step runs client-side keyword matching.** The `interpretEditRequest` function in `aiEdit.ts` runs in the browser. Only the `/api/claude` reasoning paragraph call runs server-side.

7. **TypeScript strict mode.** No `any` types. All component props must be typed.

8. **Tabler Icons via `@tabler/icons-react`.** Use the React component API: `import { IconShield } from '@tabler/icons-react'`. Icon names map from the prototype's `ti-*` classes by converting to PascalCase with `Icon` prefix (e.g. `ti-shield` → `IconShield`).

---

## STEP 15 — VALIDATION CHECKLIST

Before considering Phase 1 complete, verify each item:

**Devices step**
- [ ] All 4 accordion groups start closed
- [ ] Tapping a group header opens it (chevron rotates, left border turns red)
- [ ] Selecting any device advances to Features step
- [ ] Selecting a new device resets all downstream state

**Features step**
- [ ] Certified gate appears first
- [ ] "Yes, I need certified" routes directly to Contact Sales (certified source)
- [ ] "No" hides gate, shows flat feature list
- [ ] Feature list is filtered by device family
- [ ] "Change" link resets certified gate
- [ ] Next button disabled until at least one feature selected

**Environment step**
- [ ] iPhone shows 5 questions, tablet/Surface shows 7 questions
- [ ] Device badge shows correct label
- [ ] Progress counter updates as answers are selected
- [ ] Next button disabled until all questions answered

**Review step**
- [ ] Bundle option tabs shown only when >1 option (iPad path)
- [ ] Tabs are full-width, equally sized
- [ ] Quantity +/− controls work, min 0
- [ ] Zeroed items show faded with "Excluded from cart" text
- [ ] Bundle sub-total updates reactively
- [ ] AI agent textarea enables Send button when non-empty
- [ ] Matched AI edit: item swaps, green chip appears, UPDATED tag on item
- [ ] Unmatched AI edit: routes to Contact Sales (escalation source) with request text
- [ ] Confirm button advances to Bundle step

**Bundle step**
- [ ] All products render with correct SKU and price
- [ ] UPDATED tag on swapped items
- [ ] NOT IN CART tag on zeroed items
- [ ] Bundle sub-total reflects only active items
- [ ] Add to cart disabled when all quantities are 0
- [ ] "Add at least one item" note appears when disabled
- [ ] Add to cart calls `/api/cart` then redirects to BC checkout URL
- [ ] Contact sales button routes to Contact Sales (manual source)
- [ ] Share bundle toggles inline panel below CTA grid
- [ ] Share panel: message pre-populated, copy link works, send closes panel
- [ ] "Why this bundle fits" fetches from `/api/claude` on mount
- [ ] Loading state shown while Claude responds
- [ ] Fallback paragraph shown if Claude API fails
- [ ] Joy AI badge shown in section header

**Contact Sales step**
- [ ] Certified path: no bundle summary, certification field shown
- [ ] Escalation path: orange banner with quoted request, full bundle summary (all items including excluded)
- [ ] Manual path: info banner, full bundle summary
- [ ] Bundle summary in escalation/manual shows ALL items — zeroed ones marked "(excluded)"
- [ ] Submit button calls `/api/hubspot` with correct path tag
- [ ] Back button returns to correct previous step

**Reset**
- [ ] Reset button returns to step 1 with all state cleared

---

## NOTES FOR PHASE 2

Items explicitly out of scope for Phase 1 — do not implement:
- Live BigCommerce catalog API (replace `SKU_TO_BC_IDS` and bundle arrays with BC custom fields lookup)
- Clerk authentication and multi-tenant support
- Per-customer catalog slices
- Real BigCommerce `product_id`/`variant_id` mapping (update `SKU_TO_BC_IDS` when BC catalog is configured)
- HubSpot email workflow enrollment (deals are created; workflow enrollment is configured in HubSpot UI)
- The `/api/cart` redirect currently uses a hardcoded checkout URL pattern — Phase 2 uses the live `redirect_urls.checkout_url` from the BC cart API response

Leave `TODO Phase 2:` comments wherever Phase 1 uses a hardcoded stub that Phase 2 will replace.

---

## PHASE 2 — BIGCOMMERCE LIVE DATA + AI BUNDLE LOGIC

### Current working state (do not break)
- All 5 steps + Contact Sales fully navigable across mobile, tablet, desktop
- All data is placeholder — catalog.ts hardcoded bundle arrays and SKU_TO_BC_IDS map
- Review step (step 4) shows 2 bundle options, each with Case + Mount + Accessory
- Quantity controls, 0-exclusion mechanic, AI Agent input UI all working
- AI Agent currently uses client-side keyword matching in aiEdit.ts (no Claude API call)
- Contact sales fallback path working for unmatched AI requests
- Anthropic and BigCommerce credentials already set in Vercel environment variables

---

### Phase 2 Step 1 — BigCommerce REST API connection

Create `src/lib/bigcommerce.ts` as the single BigCommerce API client:

```typescript
const BC_BASE = `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3`;

const BC_HEADERS = {
  'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
```

All BigCommerce fetches go through this file. Never call BigCommerce directly from components.

---

### Phase 2 Step 2 — Product fetching and custom field parsing

Create `src/app/api/products/route.ts` as the internal Next.js API route for product data.

BigCommerce REST endpoints to use:
- `GET /catalog/products?keyword=&custom_fields=&include=custom_fields,images`
- `GET /catalog/products/{id}/custom-fields`

Custom fields that matter for bundle logic (from BigCommerce product admin):
- `device_compatibility` — e.g. "iPad Pro 11" (M5)"
- `device_type` — e.g. "iPad Pro"
- `product_type` — e.g. "Cases", "Mounts", "Accessories"
- `product_line` — e.g. "aXtion"
- `product_status` — if value is "Request for Quote" → trigger contact sales fallback
- `certifications` — e.g. "CID2,CIID2,IP68,MIL-STD-810H"
- `features` — multi-value, e.g. "Waterproof", "Screen Protector", "Shoulder Strap Compatible"
- `series` — e.g. "Extreme", "Bold", "Slim"
- `industry` — multi-value, e.g. "Construction", "Energy & Utilities"
- `material` — e.g. "PC,TPU"
- `color` — e.g. "Black"

Parse custom fields into a structured object on each product for easy AI reasoning.

---

### Phase 2 Step 3 — Replace hardcoded bundle recommendations

Update `src/lib/catalog.ts`:
- Replace `BP_TABLET` and `BP_IPHONE` hardcoded arrays with live BC API calls
- Replace `SKU_TO_BC_IDS` map with real product_id and variant_id from BC catalog
- Keep the TODO Phase 2 comments removed as each is replaced

Bundle recommendation logic — use questionnaire selections to filter:
- device_compatibility custom field → matches selected device name
- product_type custom field → "Cases" for case slot, "Mounts" for mount slot, "Accessories" for accessory slot
- features custom field → match against selected FeatureIds
- product_status → exclude any product where value is "Request for Quote"

Return top 2 case SKUs as the 2 bundle options. Each case SKU anchors its own bundle option. Mount and accessory are matched to each case by device_compatibility.

---

### Phase 2 Step 4 — Two-pass Claude AI logic at Review step

Replace the client-side keyword matching in `aiEdit.ts` with a real two-pass server-side Claude API flow.

**New API route: `src/app/api/ai-edit/route.ts`**

This is the ONLY new Claude API call added in Phase 2. Keep the existing `/api/claude` reasoning paragraph call untouched.

**Pass 1 — Intent parsing**

POST body:
```typescript
{
  userMessage: string;
  activeBundleOption: {
    items: BundleItem[];         // current Case + Mount + Accessory with SKUs
    customFields: Record[];  // custom fields for each item
  };
  questionnaire: {
    device: Device;
    features: FeatureId[];
    scenarios: Partial;
  };
}
```

Send to Claude (claude-sonnet-4-6). Ask Claude to respond with structured JSON only:
```json
{
  "action": "swap" | "exclude" | "unknown",
  "component": "Case" | "Mount" | "Accessory" | null,
  "anchor_sku": "",
  "constraints": {
    "device_compatibility": "",
    "product_type": "",
    "keywords": [""],
    "price_max": ,
    "certifications": [""],
    "features": [""]
  },
  "fallback": "contact_sales" | null
}
```

The case SKU is always the anchor. Certifications and device_compatibility constraints are always inherited from the anchor case custom fields, not invented.

If action is "unknown" or component is null → set fallback to "contact_sales" and return early without Pass 2.

**Pass 2 — Candidate selection**

Use the constraints from Pass 1 to query BigCommerce REST API for candidate products:
- Filter by product_type matching the component
- Filter by device_compatibility matching the anchor case
- Filter by certifications if present
- Apply price_max if specified
- Exclude any product where product_status is "Request for Quote"

Send candidates back to Claude (second call, claude-sonnet-4-6):
```typescript
{
  candidates: Array;
  }>;
  originalBundle: BundleItem[];
  userMessage: string;
}
```

Claude responds with structured JSON:
```json
{
  "selected_sku": "",
  "selected_name": "",
  "selected_price": ,
  "confidence": "high" | "low",
  "reason": "",
  "fallback_triggered": false
}
```

If no candidates found, or confidence is "low", or product_status is "Request for Quote" → set fallback_triggered: true → route to contact sales escalation path.

**Route response to client:**
```typescript
{
  matched: boolean;
  updatedItem?: BundleItem;
  reason?: string;
  fallback?: boolean;
}
```

Client-side in StepReview.tsx:
- If matched: update the active bundle option's component with updatedItem, show reason as confirmation
- If fallback: call goContactSales('escalation', userMessage) — existing mechanism unchanged

---

### Phase 2 critical rules (add to existing rules)

8. **BigCommerce REST only — no GraphQL in Phase 2.** GraphQL can be evaluated in Phase 3 if REST hits limitations.

9. **Case SKU is always the anchor for AI swaps.** Never allow the AI to swap the case without explicit user intent. When swapping Mount or Accessory, always inherit device_compatibility and certifications from the current case custom fields.

10. **product_status "Request for Quote" is a hard fallback trigger.** If any candidate from BigCommerce has this value, exclude it from AI selection and trigger contact sales if it is the only option.

11. **Both bundle options are independent.** AI swaps only affect the currently active bundle option tab. The other option remains unchanged.

12. **Two-pass AI flow is server-side only.** The new `/api/ai-edit` route handles both Claude calls and the BigCommerce query. Nothing in this flow runs client-side.

---

## BIGCOMMERCE CATALOG DATA QUALITY RECOMMENDATIONS

The bundle logic in `/api/bundle/route.ts` is only as accurate as the custom field data in BC. The recommendations below are prioritized — implement them in order for the biggest improvement to matching quality.

### Priority 1 — Mount surface type (eliminates keyword fragility)

**Problem:** Mount selection currently keyword-scores against product names (e.g., looks for "on-wall" or "c-clamp" in the name). If a product is renamed or a new mount is added, matching breaks silently.

**Fix:** Add a `mount_surface` custom field to every Mount product with one of these values:
```
wall | vehicle | desk | pole | na
```
These values map directly to the `mount_surface` question in the Environment step. The bundle route can then do a direct field match instead of name keyword scoring.

Example: "MagConnect On-Wall Counter Mount" → `mount_surface = wall`

### Priority 2 — Features on Accessories (direct feature→accessory mapping)

**Problem:** Accessory selection keyword-scores against product names (e.g., looks for "shoulder strap" in the name). Works now but is fragile.

**Fix:** Add a `features` multi-value custom field to every Accessory product. Use the same vocabulary as the configurator's `FeatureId` values:
```
shoulder_strap | hand_strap | screen_protector | kensington_lock | magsafe
```
Multiple values = multiple custom field entries with the same `features` key (BC handles this correctly). The bundle route can then match `features` selected by the user directly to accessories that carry that feature value.

Example: "Universal Shoulder Strap II" → `features = shoulder_strap`

### Priority 3 — Series / ranking on Cases (feature-driven case ranking)

**Problem:** When multiple cases match a device, the bundle returns whichever two BC sends first — effectively random. Users who prioritize ruggedness might get a slim case as Option 1.

**Fix:** Add two custom fields to Case products:

`series` — the product line tier:
```
Extreme | Bold | Slim | Edge
```

`bundle_priority` — integer (1 = show first). This lets the catalog team control which case leads each bundle option without touching code.

With `series`, the bundle route can sort cases so that ruggedness-matching options (e.g., user selected `ip_rating` + `mil_rating` → prefer Extreme/Bold over Slim) appear first.

### Priority 4 — Features on Cases (ruggedness matching)

**Problem:** The configurator collects feature preferences (IP68, MIL-STD-810H, shoulder strap compatible, etc.) but the bundle logic ignores them when choosing which cases to show. All cases that match the device are treated equally.

**Fix:** Add a `features` multi-value custom field to Case products listing what capabilities the case provides or is compatible with:
```
ip_rating | mil_rating | screen_protector | reinforced_corners | chemical_resistant | thermo_defend | vesa_compatible | magconnect | pencil_holder | asset_tag | kensington_lock
```

The bundle route can then score cases against the user's selected features, ranking the best-matching case as Option 1.

### Priority 5 — Verified `device_compatibility` exact match

**Problem:** The bundle route filters cases with `.includes(deviceName)` against a comma-separated `device_compatibility` field. If BC stores "iPad Pro 11-inch (M5)" but the configurator sends "iPad Pro 11\" (M5)", zero cases match and the bundle falls back to hardcoded data silently.

**Fix:** Verify that every case in BC has a `device_compatibility` value where at least one comma-separated entry exactly matches the device names in `catalog.ts` `DEVICE_GROUPS`. The full list of device names the configurator can send:

```
iPad Pro 11" (M5)
iPad Pro 13" (M5)
iPad Pro 11" (M4)
iPad Air 11" (M4)
iPad Air 13" (M4)
iPad Air 11" (M3)
iPad 11" (A16)
iPad 10.9" (10th Gen)
iPad 9th Gen
iPad mini (A17 Pro)
iPad mini 6
iPhone 17
iPhone 16
iPhone 15
Surface Pro 13" (12th Ed)
Surface Pro 13" (11th Ed)
Surface Pro 10
Surface Pro 10 (5G)
Surface Pro 9
Surface Pro 12"
Surface Go 4
Samsung Galaxy Tab S9
```

Run a quick test: visit `/api/bundle` with POST body `{"deviceName":"iPad Pro 11\" (M5)","isIphone":false,"features":[],"scenarios":{}}` and check the server log line `[/api/bundle] Built for ...` — if it says `0 case(s)`, there's a name mismatch.

### Priority 6 — `product_status` consistency

**Problem:** Products tagged `product_status = "Request for Quote"` are excluded from bundle logic and should trigger the Contact Sales path. This only works if the field is set consistently.

**Fix:** Audit BC products and confirm all RFQ products (discontinued, made-to-order, certified SKUs that require a quote) have `product_status = Request for Quote` set exactly. Any product missing this tag may appear in bundles incorrectly.

---

### Summary table

| Custom Field | Applies To | Values | Impact |
|---|---|---|---|
| `mount_surface` | Mounts | `wall\|vehicle\|desk\|pole\|na` | Eliminates mount keyword fragility |
| `features` | Accessories | `shoulder_strap\|hand_strap\|screen_protector\|...` | Direct feature→accessory mapping |
| `series` | Cases | `Extreme\|Bold\|Slim\|Edge` | Enables feature-driven case ranking |
| `bundle_priority` | Cases | `1\|2\|3` | Controls Option 1 vs Option 2 ordering |
| `features` | Cases | same FeatureId vocabulary | Scores cases against user preferences |
| `device_compatibility` | Cases | exact device name strings | Must match configurator device list exactly |
| `product_status` | All | `Request for Quote` | Triggers contact sales path for RFQ items |