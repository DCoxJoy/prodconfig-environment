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
  ipad_pro:  ['ip_rating','mil_rating','reinforced_corners','vesa_compatible','magconnect','shoulder_strap','hand_strap','kick_stand','pencil_holder','asset_tag','kensington_lock'],
  ipad_air:  ['ip_rating','mil_rating','reinforced_corners','vesa_compatible','magconnect','shoulder_strap','hand_strap','kick_stand','pencil_holder','asset_tag','kensington_lock'],
  ipad_std:  ['ip_rating','mil_rating','reinforced_corners','vesa_compatible','magconnect','shoulder_strap','hand_strap','kick_stand','pencil_holder','asset_tag','kensington_lock'],
  ipad_mini: ['ip_rating','mil_rating','reinforced_corners','vesa_compatible','magconnect','shoulder_strap','hand_strap','kick_stand','pencil_holder','asset_tag','kensington_lock'],
  iphone:    ['ip_rating','mil_rating','reinforced_corners','shoulder_strap','magsafe'],
  surface:   ['ip_rating','mil_rating','reinforced_corners','chemical_resistant','thermo_defend','vesa_compatible','magconnect','shoulder_strap','hand_strap','kick_stand','asset_tag','kensington_lock'],
  other:     ['ip_rating','mil_rating','reinforced_corners','shoulder_strap','hand_strap','kick_stand','asset_tag','kensington_lock'],
};

// ─── All Features ─────────────────────────────────────────────────────────────

export const ALL_FEATURES: Feature[] = [
  { id: 'ip_rating',          title: 'IP68 waterproof rating',        desc: 'Sealed against dust and water submersion' },
  { id: 'mil_rating',         title: 'Drop-proof certified',          desc: 'MIL-STD-810H rated — meets military drop and durability standard' },
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
  { id: 'kensington_lock',    title: 'Lockable Protection',           desc: 'Physical security lock point' },
];

// ─── Bundle Options ───────────────────────────────────────────────────────────

export const BP_IPHONE: BundleOption[] = [
  {
    items: [
      { type: 'Case',      icon: 'shield',        name: 'aXtion Edge',       sku: 'CPA330S',   unitPrice: 49 },
      { type: 'Accessory', icon: 'briefcase',     name: 'Belt Clip Holster', sku: 'CPX302',    unitPrice: 24 },
      { type: 'Accessory', icon: 'device-tablet', name: 'Screen Protector',  sku: 'CKX121',    unitPrice: 19 },
    ],
  },
];

export const BP_TABLET: BundleOption[] = [
  {
    items: [
      { type: 'Case',      icon: 'shield',          name: 'aXtion Bold',        sku: 'CWA4122MP', unitPrice: 89  },
      { type: 'Mount',     icon: 'layout-sidebar',  name: 'VESA 75 Mount Plate', sku: 'CWM408MPA', unitPrice: 149 },
      { type: 'Accessory', icon: 'device-tablet',   name: 'Screen Protector',   sku: 'CKX121',    unitPrice: 29  },
    ],
  },
  {
    items: [
      { type: 'Case',      icon: 'shield',          name: 'aXtion Slim',        sku: 'CWA4152MH', unitPrice: 79  },
      { type: 'Mount',     icon: 'layout-sidebar',  name: 'Counter Mount Pro',  sku: 'CWM409MPA', unitPrice: 139 },
      { type: 'Accessory', icon: 'device-tablet',   name: 'Shoulder Strap II',  sku: 'CWX202',    unitPrice: 20  },
    ],
  },
];

// ─── SKU → BigCommerce product_id / variant_id Map ───────────────────────────
// Verified against live BC catalog via /api/products on 2026-06-26.
// SKUs marked "not in BC catalog" need to be added to the store before cart works for them.

export const SKU_TO_BC_IDS: Record<string, { product_id: number; variant_id: number }> = {
  // ── Verified live BC IDs ──────────────────────────────────────────────────
  CPA330S:   { product_id: 2172, variant_id: 2137 }, // aXtion Edge (iPhone)
  CPX302:    { product_id: 2174, variant_id: 2139 }, // Belt Clip Holster
  CKX121:    { product_id: 1717, variant_id: 1682 }, // Screen Protector
  CWA4122MP: { product_id: 2149, variant_id: 2114 }, // aXtion Bold (tablet)
  CWM408MPA: { product_id: 1341, variant_id: 1306 }, // VESA 75 Mount Plate
  CWA4152MH: { product_id: 2153, variant_id: 2118 }, // aXtion Slim
  CWX202:    { product_id:  757, variant_id:  722 }, // Shoulder Strap II
  HPA3224:   { product_id: 2171, variant_id: 2136 }, // aXtion Extreme (iPhone)
  HTA6024:   { product_id: 2166, variant_id: 2131 }, // aXtion Extreme (tablet)

  // ── Not yet in BC catalog — add products to store to enable cart ──────────
  CWM409MPA: { product_id: 0, variant_id: 0 }, // Counter Mount Pro
  CWM412MPA: { product_id: 0, variant_id: 0 }, // Vehicle Mount Pro
  CWM415MPA: { product_id: 0, variant_id: 0 }, // Wall Arm Mount
  CKX130:    { product_id: 0, variant_id: 0 }, // Hand Strap
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
