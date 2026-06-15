export interface Industry {
  id: string;
  name: string;
  description: string;
}

// Placeholder catalog mirroring the site's `industry` filter facet.
// Replace with a live fetch once /api/products is wired up.
export const industries: Industry[] = [
  {
    id: "manufacturing",
    name: "Manufacturing",
    description: "Work-in-progress tracking, quality control audits, and assembly line tooling.",
  },
  {
    id: "oil_gas",
    name: "Oil & Gas",
    description: "Rugged field data collection for upstream, midstream, and downstream operations.",
  },
  {
    id: "construction",
    name: "Construction",
    description: "Jobsite project management, equipment tracking, and on-site documentation.",
  },
  {
    id: "energy_utilities",
    name: "Energy & Utilities",
    description: "Grid maintenance, meter reading, and infrastructure inspection workflows.",
  },
  {
    id: "warehouse_logistics",
    name: "Warehouse & Logistics",
    description: "Inventory tracking, order fulfillment, cross-docking, and barcode scanning.",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Patient record access, asset tracking, and point-of-care data capture.",
  },
  {
    id: "retail",
    name: "Retail",
    description: "Point-of-sale, inventory lookups, and in-store fulfillment tasks.",
  },
  {
    id: "hospitality",
    name: "Hospitality",
    description: "Guest services, housekeeping coordination, and front-desk operations.",
  },
];
