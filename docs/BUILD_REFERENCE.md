# Build Reference — Joy Factory aXtion Configurator
## Historical Phase 1 & Phase 2 Build Instructions

> **This file is an archive.** Phase 1 and Phase 2 are complete. The code described here already exists in the repository. Use this document only when you need to understand *how* the project was originally built or as a reference for the original design decisions. For current operating status, see `CLAUDE.md`.

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
  - On send: POST to `/api/ai-edit` (server-side two-pass Claude flow)
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

## STEP 10 — AI EDIT LOGIC (PHASE 1 — SUPERSEDED)

> **Note:** In Phase 2, client-side keyword matching was replaced by the server-side two-pass Claude flow in `/api/ai-edit/route.ts`. The file `src/lib/aiEdit.ts` is retained for reference but is no longer imported.

The original keyword-matching SKU swap logic lived in `src/lib/aiEdit.ts` as a pure function:

```typescript
export function interpretEditRequest(
  text: string,
  products: BundleItem[],
  qtys: number[],
  isIphone: boolean
): { matched: boolean; detail?: string; updatedProducts?: BundleItem[]; updatedQtys?: number[] }
```

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

## STEP 15 — VALIDATION CHECKLIST (PHASE 1 — COMPLETED)

All items below were verified during Phase 1 build. Retained as a reference for regression testing.

**Devices step**
- [x] All 4 accordion groups start closed
- [x] Tapping a group header opens it (chevron rotates, left border turns red)
- [x] Selecting any device advances to Features step
- [x] Selecting a new device resets all downstream state

**Features step**
- [x] Certified gate appears first
- [x] "Yes, I need certified" routes directly to Contact Sales (certified source)
- [x] "No" hides gate, shows flat feature list
- [x] Feature list is filtered by device family
- [x] "Change" link resets certified gate
- [x] Next button disabled until at least one feature selected

**Environment step**
- [x] iPhone shows 5 questions, tablet/Surface shows 7 questions
- [x] Device badge shows correct label
- [x] Progress counter updates as answers are selected
- [x] Next button disabled until all questions answered

**Review step**
- [x] Bundle option tabs shown only when >1 option (iPad path)
- [x] Tabs are full-width, equally sized
- [x] Quantity +/− controls work, min 0
- [x] Zeroed items show faded with "Excluded from cart" text
- [x] Bundle sub-total updates reactively
- [x] AI agent textarea enables Send button when non-empty
- [x] Matched AI edit: item swaps, green chip appears, UPDATED tag on item
- [x] Unmatched AI edit: routes to Contact Sales (escalation source) with request text
- [x] Confirm button advances to Bundle step

**Bundle step**
- [x] All products render with correct SKU and price
- [x] UPDATED tag on swapped items
- [x] NOT IN CART tag on zeroed items
- [x] Bundle sub-total reflects only active items
- [x] Add to cart disabled when all quantities are 0
- [x] "Add at least one item" note appears when disabled
- [x] Add to cart calls `/api/cart` then redirects to BC checkout URL
- [x] Contact sales button routes to Contact Sales (manual source)
- [x] Share bundle toggles inline panel below CTA grid
- [x] "Why this bundle fits" fetches from `/api/claude` on mount
- [x] Loading state shown while Claude responds
- [x] Fallback paragraph shown if Claude API fails
- [x] Joy AI badge shown in section header

**Contact Sales step**
- [x] Certified path: no bundle summary, certification field shown
- [x] Escalation path: orange banner with quoted request, full bundle summary
- [x] Manual path: info banner, full bundle summary
- [x] Submit sends to HubSpot via `/api/contact`
- [x] Back button returns to correct previous step

---

## PHASE 2 — BIGCOMMERCE LIVE DATA + AI BUNDLE LOGIC (COMPLETED)

### Phase 2 Step 1 — BigCommerce REST API connection

Created `src/lib/bigcommerce.ts` as the single BigCommerce API client:

```typescript
const BC_BASE = `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3`;

const BC_HEADERS = {
  'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
```

### Phase 2 Step 2 — Product fetching and custom field parsing

`src/app/api/products/route.ts` — internal Next.js API route for product data.

BigCommerce REST endpoints used:
- `GET /catalog/products?keyword=&custom_fields=&include=custom_fields,images`
- `GET /catalog/products/{id}/custom-fields`

Custom fields that matter for bundle logic:
- `device_compatibility` — e.g. "iPad Pro 11" (M5)"
- `device_type` — e.g. "iPad Pro"
- `product_type` — e.g. "Cases", "Mounts", "Accessories"
- `product_line` — e.g. "aXtion"
- `product_status` — if value is "Request for Quote" → trigger contact sales fallback
- `certifications` — e.g. "CID2,CIID2,IP68,MIL-STD-810H"
- `features` — multi-value
- `series` — e.g. "Extreme", "Bold", "Slim"
- `solution_type` — e.g. "Drill Down", "Adhesive", "Rail/Pole"

### Phase 2 Step 3 — Live bundle builder

`src/app/api/bundle/route.ts` — POSTs device + questionnaire answers, returns up to 2 `BundleOption[]` with real BC product/variant IDs. Scoring is controlled by `src/lib/enrichment.ts`.

### Phase 2 Step 4 — Two-pass Claude AI edit

`src/app/api/ai-edit/route.ts` — two Claude calls per AI edit request:
- Pass 1: parses user intent into structured JSON (action, component, constraints)
- Pass 2: filters BC catalog by constraints, Claude selects best candidate
- Case is always locked — only Mount or Accessory can be swapped via AI edit

---

## BIGCOMMERCE CATALOG DATA QUALITY RECOMMENDATIONS (DETAILED)

### Priority 1 — Mount surface type

**Problem:** Mount selection keyword-scores against product names. If a product is renamed, matching breaks silently.

**Fix:** Add a `mount_surface` custom field to every Mount product: `wall | vehicle | desk | pole | na`

These values map directly to the `mount_surface` question in the Environment step.

### Priority 2 — Features on Accessories

**Problem:** Accessory selection keyword-scores against product names.

**Fix:** Add a `features` multi-value custom field to every Accessory product using the same vocabulary as configurator `FeatureId` values:
`shoulder_strap | hand_strap | screen_protector | kensington_lock | magsafe`

### Priority 3 — Series / ranking on Cases

**Fix:** Add two custom fields to Case products:
- `series` — `Extreme | Bold | Slim | Edge`
- `bundle_priority` — integer (1 = show first)

### Priority 4 — Features on Cases

**Fix:** Add a `features` multi-value custom field to Case products:
`ip_rating | mil_rating | screen_protector | reinforced_corners | chemical_resistant | thermo_defend | vesa_compatible | magconnect | pencil_holder | asset_tag | kensington_lock`

### Priority 5 — Verified `device_compatibility` exact match

The bundle route filters cases with `.includes(deviceName)`. Verify BC stores names matching exactly what `catalog.ts` sends. Test: POST to `/api/bundle` with `{"deviceName":"iPad Pro 11\" (M5)","isIphone":false,"features":[],"scenarios":{}}` and check server log for `0 case(s)`.

### Priority 6 — `product_status` consistency

Audit BC products: all RFQ items must have `product_status = Request for Quote` set exactly.
