export interface JobTitleRole {
  id: string;
  title: string;
  description: string;
}

// Shared role catalog. Sectors reference these by id so common roles
// (Plant Manager, Quality Manager, etc.) stay consistent across industries.
const ROLES: Record<string, JobTitleRole> = {
  plant_manager: {
    id: "plant_manager",
    title: "Plant Manager",
    description: "Owns full plant performance, safety, and cross-shift coordination across the facility.",
  },
  production_supervisor: {
    id: "production_supervisor",
    title: "Production Supervisor",
    description: "Leads day-to-day shift operations, line staffing, and production targets on the floor.",
  },
  operations_manager: {
    id: "operations_manager",
    title: "Operations Manager",
    description: "Coordinates operations across departments, scheduling, and throughput goals.",
  },
  quality_assurance_manager: {
    id: "quality_assurance_manager",
    title: "Quality Assurance Manager",
    description: "Oversees QA programs, inspection standards, and corrective action processes.",
  },
  quality_manager: {
    id: "quality_manager",
    title: "Quality Manager",
    description: "Sets quality standards, audit programs, and compliance reporting for the plant.",
  },
  quality_engineer: {
    id: "quality_engineer",
    title: "Quality Engineer",
    description: "Develops inspection criteria, validates processes, and resolves quality issues on the line.",
  },
  maintenance_manager: {
    id: "maintenance_manager",
    title: "Maintenance Manager",
    description: "Manages preventive maintenance schedules, equipment uptime, and repair work orders.",
  },
  continuous_improvement_manager: {
    id: "continuous_improvement_manager",
    title: "Continuous Improvement Manager",
    description: "Drives lean initiatives, root-cause analysis, and plant-wide efficiency gains.",
  },
  manufacturing_engineer: {
    id: "manufacturing_engineer",
    title: "Manufacturing / Process Engineer",
    description: "Designs and improves production processes, tooling, and line layouts.",
  },
  line_packaging_supervisor: {
    id: "line_packaging_supervisor",
    title: "Line / Packaging Supervisor",
    description: "Supervises packaging lines, changeovers, and line-level quality checks.",
  },
  validation_compliance_manager: {
    id: "validation_compliance_manager",
    title: "Validation / Compliance Manager",
    description: "Manages validation protocols, documentation, and regulatory compliance (GxP/FDA).",
  },
  warehouse_manager: {
    id: "warehouse_manager",
    title: "Warehouse Manager",
    description: "Oversees warehouse operations, staffing, layout, and inventory accuracy.",
  },
  shift_supervisor: {
    id: "shift_supervisor",
    title: "Shift Supervisor",
    description: "Manages shift staffing, task assignments, and performance on the warehouse floor.",
  },
  inventory_control_manager: {
    id: "inventory_control_manager",
    title: "Inventory Control Manager",
    description: "Tracks inventory accuracy, cycle counts, and stock movement across the facility.",
  },
  logistics_coordinator: {
    id: "logistics_coordinator",
    title: "Logistics Coordinator",
    description: "Coordinates inbound/outbound shipments, carrier scheduling, and delivery tracking.",
  },
};

// Maps each StepTwo sector id to its top job title options for StepThree.
export const jobTitlesBySector: Record<string, JobTitleRole[]> = {
  food_beverage: [
    ROLES.plant_manager,
    ROLES.production_supervisor,
    ROLES.quality_assurance_manager,
    ROLES.maintenance_manager,
    ROLES.continuous_improvement_manager,
  ],
  cpg: [
    ROLES.plant_manager,
    ROLES.operations_manager,
    ROLES.line_packaging_supervisor,
    ROLES.continuous_improvement_manager,
    ROLES.quality_manager,
  ],
  automotive: [
    ROLES.plant_manager,
    ROLES.production_supervisor,
    ROLES.quality_engineer,
    ROLES.maintenance_manager,
    ROLES.manufacturing_engineer,
  ],
  life_sciences: [
    ROLES.plant_manager,
    ROLES.production_supervisor,
    ROLES.quality_assurance_manager,
    ROLES.validation_compliance_manager,
    ROLES.manufacturing_engineer,
  ],
  industrial_hightech: [
    ROLES.plant_manager,
    ROLES.production_supervisor,
    ROLES.manufacturing_engineer,
    ROLES.quality_manager,
    ROLES.maintenance_manager,
  ],
  distribution_logistics: [
    ROLES.warehouse_manager,
    ROLES.operations_manager,
    ROLES.shift_supervisor,
    ROLES.inventory_control_manager,
    ROLES.logistics_coordinator,
  ],
};

// Fallback list shown if no sector has been selected yet.
export const defaultJobTitles: JobTitleRole[] = [
  ROLES.plant_manager,
  ROLES.operations_manager,
  ROLES.production_supervisor,
  ROLES.quality_manager,
  ROLES.maintenance_manager,
  ROLES.continuous_improvement_manager,
];

export function getJobTitlesForSector(sectorId?: string): JobTitleRole[] {
  if (sectorId && jobTitlesBySector[sectorId]) {
    return jobTitlesBySector[sectorId];
  }
  return defaultJobTitles;
}
