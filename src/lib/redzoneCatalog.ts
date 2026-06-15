import { Bundle, Product } from "../types";

export type CaseStyle = "bold_mp" | "slim_mh" | "pro_mp";

export interface CaseProduct {
  sku: string;
  name: string;
  style: CaseStyle;
  styleDescription: string;
  compatibleModels: string[];
  price: number;
}

export interface MountProduct {
  sku: string;
  name: string;
  description: string;
  price: number;
}

export interface AccessoryProduct {
  sku: string;
  name: string;
  description: string;
  price: number;
}

const STYLE_DESCRIPTIONS: Record<CaseStyle, string> = {
  bold_mp:
    "Rugged, drop-protective case with a built-in multi-position stand and hand strap — built for high-impact environments.",
  slim_mh:
    "Slim, lightweight case with an integrated hand strap — built for all-day handheld use without added bulk.",
  pro_mp:
    "Professional-grade case with a multi-position stand — balances drop protection with a lower profile.",
};

// Placeholder catalog mirroring the RedZone aXtion case lineup.
// Replace with a live fetch once /api/products is wired up.
export const caseCatalog: CaseProduct[] = [
  {
    sku: "CWA4122MP",
    name: "aXtion Bold MP for iPad Pro 11-inch (M5) | 11-inch (M4)",
    style: "bold_mp",
    styleDescription: STYLE_DESCRIPTIONS.bold_mp,
    compatibleModels: ["ipad_pro_11_m5", "ipad_pro_11_m4"],
    price: 134.99,
  },
  {
    sku: "CWA4123MP",
    name: "aXtion Bold MP for iPad Pro 13-inch (M5) | 13-inch (M4)",
    style: "bold_mp",
    styleDescription: STYLE_DESCRIPTIONS.bold_mp,
    compatibleModels: ["ipad_pro_13_m5", "ipad_pro_13_m4"],
    price: 144.99,
  },
  {
    sku: "CWA5122MP",
    name: "aXtion Bold MP for iPad Air 11-inch (M4) | 11-inch (M3)",
    style: "bold_mp",
    styleDescription: STYLE_DESCRIPTIONS.bold_mp,
    compatibleModels: ["ipad_air_11_m4", "ipad_air_11_m3"],
    price: 129.99,
  },
  {
    sku: "CWA5123MP",
    name: "aXtion Bold MP for iPad Air 13-inch (M4) | 13-inch (M3)",
    style: "bold_mp",
    styleDescription: STYLE_DESCRIPTIONS.bold_mp,
    compatibleModels: ["ipad_air_13_m4", "ipad_air_13_m3"],
    price: 139.99,
  },
  {
    sku: "CWA652MP",
    name: 'aXtion Bold MP for iPad 11-inch (A16) | iPad 10.9-inch 10th Gen',
    style: "bold_mp",
    styleDescription: STYLE_DESCRIPTIONS.bold_mp,
    compatibleModels: ["ipad_11_a16", "ipad_10_9_10th_gen"],
    price: 124.99,
  },
  {
    sku: "CWA302MP",
    name: "aXtion Bold MP for iPad mini (A17 Pro) | 6th Gen",
    style: "bold_mp",
    styleDescription: STYLE_DESCRIPTIONS.bold_mp,
    compatibleModels: ["ipad_mini_a17_pro", "ipad_mini_6th_gen"],
    price: 109.99,
  },
  {
    sku: "CWA4152MH",
    name: "aXtion Slim MH for iPad Pro 11-inch (M5) | 11-inch (M4)",
    style: "slim_mh",
    styleDescription: STYLE_DESCRIPTIONS.slim_mh,
    compatibleModels: ["ipad_pro_11_m5", "ipad_pro_11_m4"],
    price: 84.99,
  },
  {
    sku: "CWA5152MH",
    name: "aXtion Slim MH for iPad Air 11-inch (M4) | 11-inch (M3)",
    style: "slim_mh",
    styleDescription: STYLE_DESCRIPTIONS.slim_mh,
    compatibleModels: ["ipad_air_11_m4", "ipad_air_11_m3"],
    price: 79.99,
  },
  {
    sku: "CWA655MH",
    name: 'aXtion Slim MH for iPad 11-inch (A16) | iPad 10.9-inch 10th Gen',
    style: "slim_mh",
    styleDescription: STYLE_DESCRIPTIONS.slim_mh,
    compatibleModels: ["ipad_11_a16", "ipad_10_9_10th_gen"],
    price: 74.99,
  },
  {
    sku: "CWA305MH",
    name: "aXtion Slim MH for iPad mini (A17 Pro) | 6th Gen",
    style: "slim_mh",
    styleDescription: STYLE_DESCRIPTIONS.slim_mh,
    compatibleModels: ["ipad_mini_a17_pro", "ipad_mini_6th_gen"],
    price: 69.99,
  },
  {
    sku: "CWA659MP",
    name: 'aXtion Pro MP for iPad 11-inch (A16) | iPad 10.9-inch 10th Gen',
    style: "pro_mp",
    styleDescription: STYLE_DESCRIPTIONS.pro_mp,
    compatibleModels: ["ipad_11_a16", "ipad_10_9_10th_gen"],
    price: 99.99,
  },
];

// Placeholder catalog mirroring the RedZone MagConnect mount lineup.
export const mountCatalog: MountProduct[] = [
  {
    sku: "MMU232",
    name: "MagConnect HD AMPS Mount (26mm) Table Top",
    description: "Table-top AMPS mount for fixed workstations and line-side stations.",
    price: 89.99,
  },
  {
    sku: "MMU230",
    name: "MagConnect HD Single Arm Forklift | Pole Mount (26mm)",
    description: "Heavy-duty single-arm mount for forklifts, tow motors, and poles up to 3 inches wide.",
    price: 129.99,
  },
  {
    sku: "MMU331",
    name: "MagConnect HD Universal Adhesive Mount (38mm) Table Top",
    description: "Adhesive table-top mount for quick, permanent installs at line stations.",
    price: 79.99,
  },
  {
    sku: "MMU217",
    name: "MagConnect Magnetic Mount (Wall Mount)",
    description: "Magnetic wall mount for quick-release shared device stations.",
    price: 69.99,
  },
  {
    sku: "MMU104",
    name: "MagConnect Wall | Counter Mount",
    description: "Wall or counter mount for shared kiosks, entry points, and huddle boards.",
    price: 74.99,
  },
  {
    sku: "MMU116",
    name: "MagConnect C-Clamp Dual Arm Mount (Table Top Clamp)",
    description: "Dual-arm C-clamp mount for workbenches and maintenance stations.",
    price: 94.99,
  },
];

// Placeholder catalog mirroring the RedZone aXtion accessory lineup.
export const accessoryCatalog: AccessoryProduct[] = [
  {
    sku: "CWX202",
    name: "Universal Shoulder Strap II",
    description: "Adjustable shoulder strap for hands-free carrying during floor walks.",
    price: 19.99,
  },
  {
    sku: "CWX210",
    name: "aXtion Universal Stylus Tether",
    description: "Tethered stylus holder to keep a stylus attached to the case for digital forms and signatures.",
    price: 11.99,
  },
  {
    sku: "CWX144",
    name: "aXtion Collapsible Sun Visor and Harness",
    description: "Collapsible sun visor and harness for outdoor and vehicle-cab glare protection.",
    price: 34.99,
  },
];

export function getCaseOptionsForModel(modelId: string): CaseProduct[] {
  return caseCatalog.filter((c) => c.compatibleModels.includes(modelId));
}

export function getMountProduct(sku: string): MountProduct | undefined {
  return mountCatalog.find((m) => m.sku === sku);
}

export function getAccessoryProduct(sku: string): AccessoryProduct | undefined {
  return accessoryCatalog.find((a) => a.sku === sku);
}

function toProduct(item: { sku: string; name: string; price: number }): Product {
  return { sku: item.sku, name: item.name, image: "/placeholder-product.png", price: item.price };
}

// Default bundle shown before a recommendation has loaded, or if /api/recommend fails.
const fallbackCase = caseCatalog.find((c) => c.sku === "CWA652MP")!;
const fallbackMount = getMountProduct("MMU232")!;
const fallbackAccessory = getAccessoryProduct("CWX202")!;

export const fallbackBundle: Bundle = {
  id: "fallback-ipad-floor-kit",
  name: "Standard iPad Field Kit",
  description: "A general-purpose RedZone configuration: rugged case, table-top mount, and shoulder strap.",
  products: [toProduct(fallbackCase), toProduct(fallbackMount), toProduct(fallbackAccessory)],
  totalPrice: fallbackCase.price + fallbackMount.price + fallbackAccessory.price,
};
