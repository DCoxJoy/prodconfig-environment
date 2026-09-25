// Cell Medics-only certified-case flow config. Kept separate from partners.ts (which
// stays a simple slug -> static config map) since this drives actual branching
// behavior in StepFeatures/ConfiguratorShell/api/bundle, not just per-partner values.

// Device id -> the one certified case SKU for that device. Only these two devices
// qualify a user for the certified path at all — every other device skips the
// certified question entirely and goes straight to the standard feature list.
export const CELL_MEDICS_CERTIFIED_CASE_BY_DEVICE: Record<string, string> = {
  ipad_11_a16: 'HTA6024', // aXtion Extreme (tablet) — also gets a MagConnect mount
  iphone_17:   'HPA3224', // aXtion Extreme (iPhone) — no mount; iPhone bundles never get one
};

// Both HTA6024 and HPA3224 carry product_status "Request for Quote" in BC — the
// catalog's own signal that a human must be involved before selling it, which
// /api/bundle normally treats as a hard exclusion (see Critical Rule #10). Cell
// Medics wants these two shown/selectable in the certified flow specifically, so
// /api/bundle checks a request's certifiedCaseSku against this exact list — not
// just "whatever SKU the request claims" — before bypassing that exclusion, so the
// override can't be used (even via a raw call to the public API route) to surface
// some other, unrelated RFQ product.
export const CELL_MEDICS_CERTIFIED_CASE_SKUS = Object.values(CELL_MEDICS_CERTIFIED_CASE_BY_DEVICE);

// The only two accessories the certified flow may select from. /api/bundle restricts
// its accessory candidate pool to this list whenever certifiedCaseSku is set on the
// request, instead of the full catalog.
export const CELL_MEDICS_CERTIFIED_ACCESSORY_SKUS = ['CWX144', 'CWX202'];

// The only mounts the certified flow may select from: the active MagConnect HD line.
// Deliberately excludes the VESA HD mounts (MVU232/MVU332) and every non-HD mount.
export const CELL_MEDICS_CERTIFIED_MOUNT_SKUS = [
  'MMU205', 'MMU230', 'MMU231', 'MMU232', 'MMU331', 'MMU332', 'MMU333',
];

export function getCellMedicsCertifiedCaseSku(deviceId: string): string | null {
  return CELL_MEDICS_CERTIFIED_CASE_BY_DEVICE[deviceId] ?? null;
}
