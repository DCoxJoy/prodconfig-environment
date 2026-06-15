export interface DeviceModel {
  id: string;
  name: string;
  /** Placeholder for the compatible-accessory count surfaced by the device_type filter. */
  compatibleProducts: number;
}

export interface DeviceFamily {
  id: string;
  name: string;
  description: string;
  models: DeviceModel[];
}

// Placeholder catalog mirroring the site's `device_type` filter facet.
// Replace with a live fetch (grouped by family) once /api/products is wired up.
export const deviceFamilies: DeviceFamily[] = [
  {
    id: "ipad",
    name: "Apple iPad",
    description: "iPad, iPad Air, iPad Mini, and iPad Pro models.",
    models: [
      { id: "ipad_10_9_10th_gen", name: 'iPad 10.9" 10th Gen', compatibleProducts: 5 },
      { id: "ipad_11_a16", name: 'iPad 11" (A16)', compatibleProducts: 7 },
      { id: "ipad_air_4th_gen", name: "iPad Air 4th Gen", compatibleProducts: 3 },
      { id: "ipad_air_5th_gen", name: "iPad Air 5th Gen", compatibleProducts: 3 },
      { id: "ipad_air_11_m3", name: 'iPad Air 11" (M3)', compatibleProducts: 2 },
      { id: "ipad_air_11_m4", name: 'iPad Air 11" (M4)', compatibleProducts: 2 },
      { id: "ipad_air_13_m3", name: 'iPad Air 13" (M3)', compatibleProducts: 1 },
      { id: "ipad_air_13_m4", name: 'iPad Air 13" (M4)', compatibleProducts: 1 },
      { id: "ipad_mini_a17_pro", name: "iPad Mini (A17 Pro)", compatibleProducts: 7 },
      { id: "ipad_mini_6", name: "iPad Mini 6", compatibleProducts: 6 },
      { id: "ipad_pro_11_m4", name: 'iPad Pro 11" (M4)', compatibleProducts: 2 },
      { id: "ipad_pro_11_m5", name: 'iPad Pro 11" (M5)', compatibleProducts: 2 },
      { id: "ipad_pro_11_1st_gen", name: 'iPad Pro 11" 1st Gen', compatibleProducts: 3 },
      { id: "ipad_pro_11_2nd_gen", name: 'iPad Pro 11" 2nd Gen', compatibleProducts: 1 },
      { id: "ipad_pro_13_m4", name: 'iPad Pro 13" (M4)', compatibleProducts: 1 },
      { id: "ipad_pro_13_m5", name: 'iPad Pro 13" (M5)', compatibleProducts: 1 },
    ],
  },
  {
    id: "surface",
    name: "Microsoft Surface",
    description: "Surface Go and Surface Pro tablets.",
    models: [
      { id: "surface_go", name: "Surface Go", compatibleProducts: 6 },
      { id: "surface_go_2", name: "Surface Go 2", compatibleProducts: 6 },
      { id: "surface_go_3", name: "Surface Go 3", compatibleProducts: 5 },
      { id: "surface_go_4", name: "Surface Go 4", compatibleProducts: 5 },
      { id: "surface_pro_8", name: "Surface Pro 8", compatibleProducts: 1 },
      { id: "surface_pro_9", name: "Surface Pro 9", compatibleProducts: 2 },
      { id: "surface_pro_10", name: "Surface Pro 10", compatibleProducts: 3 },
      { id: "surface_pro_12", name: 'Surface Pro 12"', compatibleProducts: 1 },
      { id: "surface_pro_13_11th_ed", name: 'Surface Pro 13" (11th Ed)', compatibleProducts: 2 },
      { id: "surface_pro_13_12th_ed", name: 'Surface Pro 13" (12th Ed)', compatibleProducts: 2 },
    ],
  },
  {
    id: "iphone",
    name: "Apple iPhone",
    description: "iPhone handheld devices.",
    models: [
      { id: "iphone_15", name: "iPhone 15", compatibleProducts: 4 },
      { id: "iphone_16", name: "iPhone 16", compatibleProducts: 2 },
      { id: "iphone_17", name: "iPhone 17", compatibleProducts: 3 },
    ],
  },
  {
    id: "universal",
    name: "Universal / Other",
    description: "Mounts and accessories compatible with most devices, regardless of model.",
    models: [{ id: "universal", name: "Universal", compatibleProducts: 69 }],
  },
];
