// ─── Device ───────────────────────────────────────────────────────────────────

export type DeviceFamily =
  | 'ipad_pro' | 'ipad_air' | 'ipad_std' | 'ipad_mini'
  | 'iphone' | 'surface' | 'other';

export interface Device {
  id: string;
  name: string;
  family: DeviceFamily;
}

export interface DeviceGroup {
  label: string;
  icon: string;
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

export interface IphoneScenarios {
  carry_style?: 'pocket' | 'holster' | 'hand' | 'bag';
  hands_free?: 'yes' | 'no';
  active?: 'yes' | 'no';
  gloves?: 'yes' | 'no';
  sharing?: 'shared' | 'personal';
}

export interface TabletScenarios {
  motion?: 'carried' | 'stationed' | 'both';
  mount_surface?: 'wall' | 'vehicle' | 'desk' | 'pole' | 'na';
  mount_install?: 'drill' | 'adhesive' | 'rail';
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
  icon: string;
  name: string;
  sku: string;
  unitPrice: number;
  // Live BC IDs — set when item was fetched from BC catalog; used for cart creation
  bcProductId?: number;
  bcVariantId?: number;
  // BC product main image — set when item was fetched from BC catalog; falls back to icon when absent
  imageUrl?: string;
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
