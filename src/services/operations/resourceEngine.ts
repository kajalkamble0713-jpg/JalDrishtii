/**
 * JalDrishti Government Resource Inventory & Prioritized Allocation Engine
 * Tracks emergency public health supply stockpiles, generates shortage alerts,
 * and formulates transparent allocation recommendations with officer sign-off.
 */

import { GovernmentUser } from '../auth/rbacEngine.js';

export type ResourceType =
  | 'CHLORINE_DISINFECTANT'
  | 'ORS_ELECTROLYTES'
  | 'WATER_TESTING_KITS'
  | 'MOBILE_RO_PURIFICATION'
  | 'FIELD_BACTERIOLOGY_KITS'
  | 'EMERGENCY_MEDICAL_BEDS';

export interface DistrictResourceStock {
  resourceId: string;
  name: string;
  resourceType: ResourceType;
  districtId: string;
  districtName: string;
  location: string;
  availableQuantity: number;
  reservedQuantity: number;
  minimumStock: number;
  unitOfMeasure: string;
  unitCostInr: number;
  updatedAt: string;
}

export interface ResourceShortageAlert {
  shortageId: string;
  resourceId: string;
  districtId: string;
  districtName: string;
  resourceName: string;
  severity: 'CRITICAL_SHORTAGE' | 'LOW_STOCK' | 'SUPPLY_DELAY';
  deficitQuantity: number;
  message: string;
  detectedAt: string;
}

export interface ResourceAllocationRecord {
  allocationId: string;
  resourceId: string;
  districtId: string;
  districtName: string;
  interventionId?: string;
  allocatedQuantity: number;
  unitOfMeasure: string;
  priorityScore: number; // 0 - 100
  rationale: string;
  status: 'RECOMMENDATION' | 'APPROVED' | 'DISPATCHED' | 'DELIVERED';
  recommendedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export class ResourceEngine {
  private static instance: ResourceEngine;

  private inventory: Map<string, DistrictResourceStock> = new Map();
  private allocations: ResourceAllocationRecord[] = [];

  private constructor() {
    this.seedBaselineInventory();
  }

  public static getInstance(): ResourceEngine {
    if (!ResourceEngine.instance) {
      ResourceEngine.instance = new ResourceEngine();
    }
    return ResourceEngine.instance;
  }

  private seedBaselineInventory(): void {
    const items: DistrictResourceStock[] = [
      {
        resourceId: 'RES_PATNA_CHLORINE',
        name: 'Sodium Dichloroisocyanurate (NaDCC) Chlorine Tablets',
        resourceType: 'CHLORINE_DISINFECTANT',
        districtId: 'patna_bihar',
        districtName: 'Patna',
        location: 'PHED Central Chemical Depot, Danapur',
        availableQuantity: 4500, // Good
        reservedQuantity: 500,
        minimumStock: 2000,
        unitOfMeasure: 'Tablets (1,000 / Box)',
        unitCostInr: 1250,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: 'RES_PATNA_ORS',
        name: 'WHO-Formula Low-Osmolarity ORS Sachets',
        resourceType: 'ORS_ELECTROLYTES',
        districtId: 'patna_bihar',
        districtName: 'Patna',
        location: 'Patna District CMO Drug Warehouse',
        availableQuantity: 1800, // Below minimum 3000! LOW_STOCK
        reservedQuantity: 400,
        minimumStock: 3000,
        unitOfMeasure: 'Boxes (100 Sachets/Box)',
        unitCostInr: 450,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: 'RES_PATNA_RO_BARGE',
        name: 'Trailer-Mounted 5,000 LPH Emergency RO Purification Unit',
        resourceType: 'MOBILE_RO_PURIFICATION',
        districtId: 'patna_bihar',
        districtName: 'Patna',
        location: 'State Disaster Response Force Base, Bihta',
        availableQuantity: 2,
        reservedQuantity: 1,
        minimumStock: 1,
        unitOfMeasure: 'Mobile Units',
        unitCostInr: 450000,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: 'RES_BHAG_CHLORINE',
        name: 'Sodium Dichloroisocyanurate (NaDCC) Chlorine Tablets',
        resourceType: 'CHLORINE_DISINFECTANT',
        districtId: 'bhagalpur_bihar',
        districtName: 'Bhagalpur',
        location: 'Bhagalpur Sadar Hospital Store',
        availableQuantity: 400, // CRITICAL_SHORTAGE (minimum 2500)
        reservedQuantity: 100,
        minimumStock: 2500,
        unitOfMeasure: 'Tablets (1,000 / Box)',
        unitCostInr: 1250,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: 'RES_BHAG_KITS',
        name: 'Portable Water Multi-Parameter Optical Test Kits',
        resourceType: 'WATER_TESTING_KITS',
        districtId: 'bhagalpur_bihar',
        districtName: 'Bhagalpur',
        location: 'Barari Water Quality Sub-Station',
        availableQuantity: 14,
        reservedQuantity: 2,
        minimumStock: 10,
        unitOfMeasure: 'Field Kits',
        unitCostInr: 18500,
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: 'RES_VAR_ORS',
        name: 'WHO-Formula Low-Osmolarity ORS Sachets',
        resourceType: 'ORS_ELECTROLYTES',
        districtId: 'varanasi_up',
        districtName: 'Varanasi',
        location: 'Varanasi Divisional Drug Depot',
        availableQuantity: 6200,
        reservedQuantity: 800,
        minimumStock: 2500,
        unitOfMeasure: 'Boxes (100 Sachets/Box)',
        unitCostInr: 450,
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const item of items) {
      this.inventory.set(item.resourceId, item);
    }

    // Seed baseline allocation recommendations
    this.allocations.push({
      allocationId: 'ALLOC_BHAG_CHLORINE_01',
      resourceId: 'RES_BHAG_CHLORINE',
      districtId: 'bhagalpur_bihar',
      districtName: 'Bhagalpur',
      interventionId: 'INT_BHAG_002',
      allocatedQuantity: 2000,
      unitOfMeasure: 'Tablets (1,000 / Box)',
      priorityScore: 92,
      rationale:
        'RECOMMENDATION: Bhagalpur Ganges riverbank settlement experiences critical chlorine deficit (400 vs 2,500 min stock) coinciding with VERY_HIGH Cholera risk tier (0.78). Direct emergency diversion recommended from State Reserve.',
      status: 'RECOMMENDATION',
      recommendedBy: 'Automated Epidemiological Logistics Optimizer',
      createdAt: new Date().toISOString(),
    });
  }

  public getInventory(districtId?: string): DistrictResourceStock[] {
    const list = Array.from(this.inventory.values());
    if (districtId) {
      return list.filter((item) => item.districtId === districtId);
    }
    return list;
  }

  public getShortageAlerts(): ResourceShortageAlert[] {
    const shortages: ResourceShortageAlert[] = [];
    for (const item of this.inventory.values()) {
      if (item.availableQuantity <= item.minimumStock * 0.5) {
        shortages.push({
          shortageId: `SHORT_${item.resourceId}`,
          resourceId: item.resourceId,
          districtId: item.districtId,
          districtName: item.districtName,
          resourceName: item.name,
          severity: 'CRITICAL_SHORTAGE',
          deficitQuantity: item.minimumStock - item.availableQuantity,
          message: `CRITICAL SHORTAGE: ${item.districtName} holds only ${item.availableQuantity} units (minimum stock safety buffer is ${item.minimumStock}). Immediate replenishment dispatch needed.`,
          detectedAt: new Date().toISOString(),
        });
      } else if (item.availableQuantity < item.minimumStock) {
        shortages.push({
          shortageId: `SHORT_${item.resourceId}`,
          resourceId: item.resourceId,
          districtId: item.districtId,
          districtName: item.districtName,
          resourceName: item.name,
          severity: 'LOW_STOCK',
          deficitQuantity: item.minimumStock - item.availableQuantity,
          message: `LOW STOCK: ${item.districtName} available quantity (${item.availableQuantity}) is below required minimum reserve (${item.minimumStock}).`,
          detectedAt: new Date().toISOString(),
        });
      }
    }
    return shortages;
  }

  public getAllocations(): ResourceAllocationRecord[] {
    return this.allocations;
  }

  public approveAllocation(
    allocationId: string,
    officer: GovernmentUser
  ): { success: boolean; allocation?: ResourceAllocationRecord; error?: string } {
    const alloc = this.allocations.find((a) => a.allocationId === allocationId);
    if (!alloc) return { success: false, error: 'Allocation record not found' };

    alloc.status = 'APPROVED';
    alloc.approvedBy = `${officer.fullName} (${officer.designation})`;
    alloc.approvedAt = new Date().toISOString();

    // Reserve quantity in inventory
    const stock = this.inventory.get(alloc.resourceId);
    if (stock) {
      stock.reservedQuantity += alloc.allocatedQuantity;
      stock.updatedAt = new Date().toISOString();
    }

    return { success: true, allocation: alloc };
  }
}
