import { Bundle } from "../types";

export const bundles: Bundle[] = [
  {
    id: "bundle-001",
    name: "Field Operations Starter Kit",
    description: "Recommended for mobile device deployments in field service environments.",
    products: [
      {
        sku: "SKU-1001",
        name: "Rugged Tablet — 10in",
        image: "/placeholder-product.png",
        price: 1299.00,
      },
      {
        sku: "SKU-1002",
        name: "Vehicle Mount Cradle",
        image: "/placeholder-product.png",
        price: 349.00,
      },
      {
        sku: "SKU-1003",
        name: "Extended Battery Pack",
        image: "/placeholder-product.png",
        price: 149.00,
      },
    ],
    totalPrice: 1797.00,
  },
];
