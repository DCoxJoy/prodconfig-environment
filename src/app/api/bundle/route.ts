// POST /api/bundle
// Builds live bundle options from BC catalog based on selected device, features, and scenarios.
// Returns up to 2 BundleOption[] — one per compatible case found in BC.

import { NextResponse } from 'next/server';
import { getAllProducts, getFirstVariantIds, BcProductFull } from '../../../lib/bigcommerce';
import { BundleItem, BundleOption, FeatureId, TabletScenarios } from '../../../types';

// ─── Custom field helpers ─────────────────────────────────────────────────────

type CfMap = Record<string, string | string[]>;

function parseCustomFields(fields: BcProductFull['custom_fields']): CfMap {
  const out: CfMap = {};
  for (const f of fields ?? []) {
    const existing = out[f.name];
    if (existing !== undefined) {
      out[f.name] = Array.isArray(existing) ? [...existing, f.value] : [existing, f.value];
    } else {
      out[f.name] = f.value;
    }
  }
  return out;
}

function getDeviceCompatList(cf: CfMap): string[] {
  const raw = cf.device_compatibility as string | undefined;
  if (!raw || raw.toLowerCase() === 'universal') return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// ─── Mount scoring ────────────────────────────────────────────────────────────

const MOUNT_SURFACE_KEYWORDS: Record<string, string[]> = {
  vehicle:  ['c-clamp', 'seat bolt', 'wheelchair'],
  wall:     ['on-wall', 'wall |', '| wall', 'counter'],
  desk:     ['desk stand'],
  pole:     ['tripod', 'mic stand'],
};

function scoreMount(name: string, mountSurface: string): number {
  const lower = name.toLowerCase();
  const keywords = MOUNT_SURFACE_KEYWORDS[mountSurface] ?? [];
  return keywords.reduce((n, k) => n + (lower.includes(k) ? 1 : 0), 0);
}

// ─── Accessory scoring ────────────────────────────────────────────────────────

const FEATURE_TO_ACCESSORY_KEYWORDS: Partial<Record<FeatureId, string[]>> = {
  shoulder_strap:   ['shoulder strap'],
  hand_strap:       ['grip hand strap', 'hand strap'],
  screen_protector: ['screen protector'],
  kensington_lock:  ['lockdown', 'cable lock'],
};

function scoreAccessory(name: string, features: FeatureId[]): number {
  const lower = name.toLowerCase();
  let score = 0;
  for (const feat of features) {
    const keywords = FEATURE_TO_ACCESSORY_KEYWORDS[feat] ?? [];
    if (keywords.some(k => lower.includes(k))) score++;
  }
  return score;
}

function iconForAccessory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('shoulder')) return 'briefcase';
  if (lower.includes('hand strap') || lower.includes('grip')) return 'hand-stop';
  if (lower.includes('screen')) return 'device-tablet';
  if (lower.includes('lock')) return 'lock';
  return 'tool';
}

// ─── Request / response types ─────────────────────────────────────────────────

interface BundleRequest {
  deviceName: string;
  isIphone: boolean;
  features: FeatureId[];
  scenarios: Partial<TabletScenarios & { carry_style: string; hands_free: string }>;
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body: BundleRequest = await request.json();
    const { deviceName, isIphone, features, scenarios } = body;

    // Fetch all BC products (cached 5 min)
    const allProducts = await getAllProducts();

    // Parse custom fields and build a flat list with cf attached
    const products = allProducts.map(p => ({ ...p, cf: parseCustomFields(p.custom_fields) }));

    // Exclude any product with product_status = "Request for Quote"
    const active = products.filter(p => p.cf.product_status !== 'Request for Quote');

    // ── Cases: device-specific ─────────────────────────────────────────────
    const cases = active
      .filter(p => p.cf.product_type === 'Cases')
      .filter(p => getDeviceCompatList(p.cf).includes(deviceName))
      .slice(0, 2); // top 2 → up to 2 bundle options

    if (cases.length === 0) {
      console.warn(`[/api/bundle] No BC cases found for device: "${deviceName}"`);
      return NextResponse.json({ options: [] });
    }

    // ── Mounts: Universal, scored by scenario ──────────────────────────────
    const mountSurface = (scenarios as TabletScenarios).mount_surface;
    let selectedMount: (typeof products)[0] | null = null;

    if (!isIphone && mountSurface && mountSurface !== 'na') {
      const scored = active
        .filter(p => p.cf.product_type === 'Mounts')
        .map(p => ({ p, score: scoreMount(p.name, mountSurface) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);
      selectedMount = scored[0]?.p ?? null;
    }

    // ── Accessories: Universal, scored by selected features ────────────────
    const accessoryPool = active.filter(p => p.cf.product_type === 'Accessories');

    // For iPhone, also consider carry_style for accessory selection
    const effectiveFeatures: FeatureId[] = [...features];
    if (isIphone && (scenarios as { carry_style?: string }).carry_style === 'holster') {
      // prefer holster/belt clip — doesn't map to a FeatureId, handled by name keyword below
    }

    const scoredAcc = accessoryPool
      .map(p => ({ p, score: scoreAccessory(p.name, effectiveFeatures) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);
    const selectedAccessory = scoredAcc[0]?.p ?? null;

    // ── Collect product IDs we need variant IDs for ────────────────────────
    const selectedIds = [
      ...cases.map(c => c.id),
      ...(selectedMount ? [selectedMount.id] : []),
      ...(selectedAccessory ? [selectedAccessory.id] : []),
    ];
    const uniqueIds = [...new Set(selectedIds)];
    const variantIds = await getFirstVariantIds(uniqueIds);

    console.log(`[/api/bundle] Built for "${deviceName}": ${cases.length} case(s), mount=${selectedMount?.sku ?? 'none'}, accessory=${selectedAccessory?.sku ?? 'none'}`);

    // ── Build BundleOption[] — one per case ────────────────────────────────
    const options: BundleOption[] = cases.map(caseProduct => {
      const items: BundleItem[] = [
        {
          type:       'Case',
          icon:       'shield',
          name:       caseProduct.name,
          sku:        caseProduct.sku,
          unitPrice:  caseProduct.price,
          bcProductId: caseProduct.id,
          bcVariantId: variantIds[caseProduct.id],
        },
      ];

      if (selectedMount) {
        items.push({
          type:       'Mount',
          icon:       'layout-sidebar',
          name:       selectedMount.name,
          sku:        selectedMount.sku,
          unitPrice:  selectedMount.price,
          bcProductId: selectedMount.id,
          bcVariantId: variantIds[selectedMount.id],
        });
      }

      if (selectedAccessory) {
        items.push({
          type:       'Accessory',
          icon:       iconForAccessory(selectedAccessory.name),
          name:       selectedAccessory.name,
          sku:        selectedAccessory.sku,
          unitPrice:  selectedAccessory.price,
          bcProductId: selectedAccessory.id,
          bcVariantId: variantIds[selectedAccessory.id],
        });
      }

      return { items };
    });

    return NextResponse.json({ options });
  } catch (error) {
    console.error('[/api/bundle error]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
