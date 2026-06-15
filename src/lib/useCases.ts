export interface MountOption {
  sku: string;
  name: string;
}

export interface AccessoryOption {
  sku: string;
  name: string;
}

export interface UseCase {
  id: string;
  title: string;
  description: string;
  recommendedMount: MountOption | null;
  recommendedAccessories: AccessoryOption[];
}

// Placeholder catalog mapping each primary use case to the RedZone mount and
// accessory SKUs that should be included in the recommended bundle.
// Replace with a live fetch once /api/products is wired up.
export const useCases: UseCase[] = [
  {
    id: "floor_walks",
    title: "Production Floor / Gemba Walks",
    description: "Walking the line for audits, observations, and real-time data capture at each station.",
    recommendedMount: null,
    recommendedAccessories: [{ sku: "CWX202", name: "Universal Shoulder Strap II" }],
  },
  {
    id: "fixed_workstation",
    title: "Fixed Workstation / Line Station",
    description: "Mounted at a single production line position for ongoing reference and data entry.",
    recommendedMount: { sku: "MMU232", name: "MagConnect HD AMPS Mount (26mm) Table Top" },
    recommendedAccessories: [],
  },
  {
    id: "forklift_mobile_equipment",
    title: "Forklift / Mobile Equipment",
    description: "Mounted on a forklift, tow motor, or other mobile equipment for in-motion access.",
    recommendedMount: { sku: "MMU230", name: "MagConnect HD Single Arm Forklift | Pole Mount (26mm)" },
    recommendedAccessories: [{ sku: "CWX144", name: "aXtion Collapsible Sun Visor and Harness" }],
  },
  {
    id: "wall_kiosk",
    title: "Wall-Mounted Kiosk / Shared Station",
    description: "A shared device mounted at an entry point, time clock, or team huddle board.",
    recommendedMount: { sku: "MMU104", name: "MagConnect Wall | Counter Mount" },
    recommendedAccessories: [],
  },
  {
    id: "maintenance_work_orders",
    title: "Maintenance & Work Orders",
    description: "Technicians moving between equipment to log work orders, diagnostics, and signatures.",
    recommendedMount: { sku: "MMU116", name: "MagConnect C-Clamp Dual Arm Mount" },
    recommendedAccessories: [{ sku: "CWX210", name: "aXtion Universal Stylus Tether" }],
  },
];
