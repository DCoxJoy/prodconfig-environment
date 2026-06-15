export interface Industry {
  id: string;
  name: string;
  description: string;
}

// Placeholder catalog mirroring the site's `industry` filter facet.
// Replace with a live fetch once /api/products is wired up.
export const industries: Industry[] = [
  {
    id: "food_beverage",
    name: "Food and Beverage",
    description: "Food production, beverage manufacturing, and processing line operations.",
  },
  {
    id: "cpg",
    name: "Consumer Packaged Goods (CPG)",
    description: "Household, organic, and retail-ready consumer product manufacturing.",
  },
  {
    id: "automotive",
    name: "Automotive",
    description: "Parts suppliers and vehicle manufacturers streamlining production and quality control.",
  },
  {
    id: "life_sciences",
    name: "Life Sciences",
    description: "Medical device and pharmaceutical manufacturing with strict regulatory compliance and documentation.",
  },
  {
    id: "industrial_hightech",
    name: "Industrial and High-Tech Manufacturing",
    description: "Component assembly, electronics, and specialized industrial equipment production.",
  },
  {
    id: "distribution_logistics",
    name: "Distribution and Logistics",
    description: "Warehousing, supply chain execution, and distribution network operations.",
  },
];
