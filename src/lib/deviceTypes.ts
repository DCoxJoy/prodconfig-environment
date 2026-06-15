export interface DeviceModel {
  id: string;
  name: string;
  /** Number of RedZone case SKUs (aXtion Bold MP / Slim MH / Pro MP) compatible with this model. */
  compatibleProducts: number;
}

export interface DeviceFamily {
  id: string;
  name: string;
  description: string;
  models: DeviceModel[];
}

// Placeholder catalog mirroring the site's `device_type` filter facet,
// limited to the iPad models RedZone currently ships aXtion cases for.
// Replace with a live fetch (grouped by line) once /api/products is wired up.
export const deviceFamilies: DeviceFamily[] = [
  {
    id: "ipad_pro",
    name: "iPad Pro",
    description: "iPad Pro 11-inch and 13-inch (M4 and M5) models.",
    models: [
      { id: "ipad_pro_11_m5", name: 'iPad Pro 11" (M5)', compatibleProducts: 2 },
      { id: "ipad_pro_11_m4", name: 'iPad Pro 11" (M4)', compatibleProducts: 2 },
      { id: "ipad_pro_13_m5", name: 'iPad Pro 13" (M5)', compatibleProducts: 1 },
      { id: "ipad_pro_13_m4", name: 'iPad Pro 13" (M4)', compatibleProducts: 1 },
    ],
  },
  {
    id: "ipad_air",
    name: "iPad Air",
    description: "iPad Air 11-inch and 13-inch (M3 and M4) models.",
    models: [
      { id: "ipad_air_11_m4", name: 'iPad Air 11" (M4)', compatibleProducts: 2 },
      { id: "ipad_air_11_m3", name: 'iPad Air 11" (M3)', compatibleProducts: 2 },
      { id: "ipad_air_13_m4", name: 'iPad Air 13" (M4)', compatibleProducts: 1 },
      { id: "ipad_air_13_m3", name: 'iPad Air 13" (M3)', compatibleProducts: 1 },
    ],
  },
  {
    id: "ipad",
    name: "iPad",
    description: 'iPad 11-inch (A16) and iPad 10.9-inch (10th Gen).',
    models: [
      { id: "ipad_11_a16", name: 'iPad 11" (A16)', compatibleProducts: 3 },
      { id: "ipad_10_9_10th_gen", name: 'iPad 10.9" (10th Gen)', compatibleProducts: 3 },
    ],
  },
  {
    id: "ipad_mini",
    name: "iPad mini",
    description: "iPad mini (A17 Pro) and iPad mini (6th Gen).",
    models: [
      { id: "ipad_mini_a17_pro", name: "iPad mini (A17 Pro)", compatibleProducts: 2 },
      { id: "ipad_mini_6th_gen", name: "iPad mini (6th Gen)", compatibleProducts: 2 },
    ],
  },
];

export function findDeviceModel(modelId: string): DeviceModel | undefined {
  for (const family of deviceFamilies) {
    const model = family.models.find((m) => m.id === modelId);
    if (model) return model;
  }
  return undefined;
}
