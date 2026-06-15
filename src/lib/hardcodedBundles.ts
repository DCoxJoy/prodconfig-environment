import { Bundle } from "../types";

// Mock product catalog standing in for the BigCommerce Catalog API (Phase 2).
// `tags` mirror the BigCommerce category structure used to group bundles:
// device type, industry, and use case.
export const bundles: Bundle[] = [
  {
    id: "bundle-001",
    name: "Field Operations Starter Kit",
    description: "Recommended for mobile device deployments in field service environments.",
    tags: ["rugged_tablet", "field_service", "diagnostics", "vehicle_mount"],
    products: [
      {
        sku: "SKU-1001",
        name: "Rugged Tablet — 10in",
        image: "/placeholder-product.png",
        price: 1299.0,
      },
      {
        sku: "SKU-1002",
        name: "Vehicle Mount Cradle",
        image: "/placeholder-product.png",
        price: 349.0,
      },
      {
        sku: "SKU-1003",
        name: "Extended Battery Pack",
        image: "/placeholder-product.png",
        price: 149.0,
      },
    ],
    totalPrice: 1797.0,
  },
  {
    id: "bundle-002",
    name: "Warehouse Scanning Bundle",
    description: "Built for high-volume picking, packing, and inventory control in logistics environments.",
    tags: ["handheld_computer", "logistics", "inventory", "operations_manager"],
    products: [
      {
        sku: "SKU-2001",
        name: "Rugged Handheld Scanner",
        image: "/placeholder-product.png",
        price: 899.0,
      },
      {
        sku: "SKU-2002",
        name: "Charging Dock — 4 Bay",
        image: "/placeholder-product.png",
        price: 249.0,
      },
      {
        sku: "SKU-2003",
        name: "Hip Holster & Hand Strap",
        image: "/placeholder-product.png",
        price: 59.0,
      },
    ],
    totalPrice: 1207.0,
  },
  {
    id: "bundle-003",
    name: "Wearable Productivity Kit",
    description: "Hands-free wearable computers and ring scanners for high-throughput manufacturing and packing lines.",
    tags: ["wearable_computer", "manufacturing", "inspections", "field_supervisor"],
    products: [
      {
        sku: "SKU-3001",
        name: "Industrial Wearable Computer",
        image: "/placeholder-product.png",
        price: 1099.0,
      },
      {
        sku: "SKU-3002",
        name: "Ring-Style Bluetooth Scanner",
        image: "/placeholder-product.png",
        price: 429.0,
      },
      {
        sku: "SKU-3003",
        name: "Arm Mount & Wrist Strap Kit",
        image: "/placeholder-product.png",
        price: 89.0,
      },
    ],
    totalPrice: 1617.0,
  },
  {
    id: "bundle-004",
    name: "Vehicle-Mount Fleet Kit",
    description: "Heavy-duty vehicle-mount computers for forklifts and cabins in demanding logistics and public safety operations.",
    tags: ["vehicle_mount", "logistics", "public_safety", "delivery", "it_director"],
    products: [
      {
        sku: "SKU-4001",
        name: "Vehicle-Mount Computer — 8in",
        image: "/placeholder-product.png",
        price: 1899.0,
      },
      {
        sku: "SKU-4002",
        name: "Forklift Mounting Arm",
        image: "/placeholder-product.png",
        price: 299.0,
      },
      {
        sku: "SKU-4003",
        name: "Vehicle Power Adapter",
        image: "/placeholder-product.png",
        price: 129.0,
      },
    ],
    totalPrice: 2327.0,
  },
];
