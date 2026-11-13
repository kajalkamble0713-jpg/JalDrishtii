/**
 * JalDrishti Government Intervention & Field Task Management Engine
 * Manages public health field actions, task assignment, evidence submission,
 * and supervisor verification sign-off.
 */

import { GovernmentUser } from '../auth/rbacEngine.js';

export type InterventionType =
  | 'Water Testing & Source Inspection'
  | 'Targeted Hyper-Chlorination'
  | 'Community Borewell Shock Treatment'
  | 'Overhead Tank Desilting & Flushing'
  | 'Pipeline Leakage & Backflow Repair'
  | 'Sanitation & Sludge Inundation Clearance'
  | 'Bilingual Community Risk Awareness Campaign'
  | 'PHC ORS & Zinc Stockpile Audit'
  | 'Microbiological Lab Sample Collection'
  | 'LoRaWAN Edge Water Sensor Diagnostic'
  | 'Water Treatment Plant Clarifier Inspection';

export type InterventionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type InterventionStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VERIFICATION_PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'CLOSED'
  | 'CANCELLED';

export interface InterventionEvidence {
  evidenceId: string;
  interventionId: string;
  uploadedBy: string;
  uploadedAt: string;
  location: string;
  fileType: 'PHOTOGRAPH' | 'LAB_REPORT' | 'GPS_LOG' | 'FIELD_INSPECTION_NOTE';
  fileReference: string;
  description: string;
  isVerified: boolean;
  verifiedBy?: string;
  verificationNotes?: string;
}

export interface GovernmentIntervention {
  interventionId: string;
  alertId?: string;
  districtId: string;
  districtName: string;
  type: InterventionType;
  description: string;
  priority: InterventionPriority;
  assignedDepartment: string;
  assignedOfficerName: string;
  assignedOfficerId?: string;
  location: string;
  deadline: string;
  status: InterventionStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  supervisorNotes?: string;
  evidence: InterventionEvidence[];
}

export class InterventionEngine {
  private static instance: InterventionEngine;
  private interventions: Map<string, GovernmentIntervention> = new Map();

  private constructor() {
    this.seedBaselineInterventions();
  }

  public static getInstance(): InterventionEngine {
    if (!InterventionEngine.instance) {
      InterventionEngine.instance = new InterventionEngine();
    }
    return InterventionEngine.instance;
  }

  private seedBaselineInterventions(): void {
    const intPatna01: GovernmentIntervention = {
      interventionId: 'INT_PATNA_001',
      alertId: 'ALT_PATNA_ADD_2026_01',
      districtId: 'patna_bihar',
      districtName: 'Patna',
      type: 'Targeted Hyper-Chlorination',
      description:
        'Inject 15% sodium hypochlorite solution at River Surface Intake Ward 14 to maintain 0.5 mg/L residual chlorine across downstream distribution taps.',
      priority: 'URGENT',
      assignedDepartment: 'Public Health Engineering Department (PHED)',
      assignedOfficerName: 'Er. S. N. Mishra (Executive Engineer)',
      assignedOfficerId: 'usr_phed_patna_01',
      location: 'Ganges Water Intake Pumphouse, Danapur Reach',
      deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // +2 days
      status: 'IN_PROGRESS',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      startedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      evidence: [],
    };
    this.interventions.set(intPatna01.interventionId, intPatna01);

    const intBhagalpur02: GovernmentIntervention = {
      interventionId: 'INT_BHAG_002',
      alertId: 'ALT_BHAGALPUR_CHOLERA_02',
      districtId: 'bhagalpur_bihar',
      districtName: 'Bhagalpur',
      type: 'Microbiological Lab Sample Collection',
      description:
        'Collect 12 sterile duplicate water samples across shallow handpumps in riverbank settlement for Vibrio cholerae culture & PCR verification.',
      priority: 'HIGH',
      assignedDepartment: 'District Water Testing Laboratory',
      assignedOfficerName: 'Sunita Devi (Chief Microbiologist)',
      assignedOfficerId: 'usr_lab_patna_01',
      location: 'Barari Ghat Shallow Handpump Cluster',
      deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'VERIFICATION_PENDING',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      startedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      evidence: [
        {
          evidenceId: 'EVID_BHAG_01',
          interventionId: 'INT_BHAG_002',
          uploadedBy: 'Sunita Devi (Lab Officer)',
          uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          location: 'Barari Ghat Sample Point 04 (25.2425° N, 86.9842° E)',
          fileType: 'LAB_REPORT',
          fileReference: 'DOC_LAB_BARARI_MEMBRANE_FILTRATION_LOG.pdf',
          description:
            'Membrane filtration report completed. Fecal coliform confirmed at 420 CFU/100mL. Alkaline peptone water subculture incubated for 18h.',
          isVerified: false,
        },
      ],
    };
    this.interventions.set(intBhagalpur02.interventionId, intBhagalpur02);

    const intVaranasi03: GovernmentIntervention = {
      interventionId: 'INT_VAR_003',
      alertId: 'ALT_VARANASI_TYPHOID_03',
      districtId: 'varanasi_up',
      districtName: 'Varanasi',
      type: 'PHC ORS & Zinc Stockpile Audit',
      description:
        'Verify buffer inventory of 5,000 WHO-formula ORS sachets and pediatric zinc dispersible tablets across 8 primary health centres.',
      priority: 'MEDIUM',
      assignedDepartment: 'District Health Administration (CMO Office)',
      assignedOfficerName: 'Rajesh Kumar (Field Surveillance)',
      assignedOfficerId: 'usr_field_patna_01',
      location: 'Primary Health Centres (Wards 1-8)',
      deadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      status: 'VERIFIED',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      verifiedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      verifiedBy: 'Dr. A. P. Singh (District Health Officer)',
      supervisorNotes: 'Physical stock tally confirmed against HMIS supply registers. Adequate 30-day buffer confirmed.',
      evidence: [
        {
          evidenceId: 'EVID_VAR_01',
          interventionId: 'INT_VAR_003',
          uploadedBy: 'Rajesh Kumar (Field Worker)',
          uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          location: 'Varanasi Central Medical Drug Store',
          fileType: 'PHOTOGRAPH',
          fileReference: 'IMG_DRUG_STOCKPILE_SEALED_PALLETS.jpg',
          description: 'Geotagged photographic verification of 5,400 ORS sachets stacked and climate-controlled.',
          isVerified: true,
          verifiedBy: 'Dr. A. P. Singh (CMO)',
          verificationNotes: 'Stock batch verified against invoice expiry dates (2028).',
        },
      ],
    };
    this.interventions.set(intVaranasi03.interventionId, intVaranasi03);
  }

  public getInterventions(filter?: {
    districtId?: string;
    status?: InterventionStatus;
    priority?: InterventionPriority;
  }): GovernmentIntervention[] {
    let result = Array.from(this.interventions.values());
    if (filter?.districtId) {
      result = result.filter((i) => i.districtId === filter.districtId);
    }
    if (filter?.status) {
      result = result.filter((i) => i.status === filter.status);
    }
    if (filter?.priority) {
      result = result.filter((i) => i.priority === filter.priority);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getInterventionById(id: string): GovernmentIntervention | undefined {
    return this.interventions.get(id);
  }

  public createIntervention(params: {
    alertId?: string;
    districtId: string;
    districtName: string;
    type: InterventionType;
    description: string;
    priority: InterventionPriority;
    assignedDepartment: string;
    assignedOfficerName: string;
    assignedOfficerId?: string;
    location: string;
    deadline: string;
  }): GovernmentIntervention {
    const interventionId = `INT_${params.districtId.substring(0, 4).toUpperCase()}_${Date.now()}`;
    const newInt: GovernmentIntervention = {
      ...params,
      interventionId,
      status: 'ASSIGNED',
      createdAt: new Date().toISOString(),
      evidence: [],
    };
    this.interventions.set(interventionId, newInt);
    return newInt;
  }

  public updateStatus(
    interventionId: string,
    status: InterventionStatus,
    officer: GovernmentUser,
    notes?: string
  ): { success: boolean; intervention?: GovernmentIntervention; error?: string } {
    const item = this.interventions.get(interventionId);
    if (!item) return { success: false, error: 'Intervention not found' };

    item.status = status;
    if (status === 'IN_PROGRESS' && !item.startedAt) {
      item.startedAt = new Date().toISOString();
    } else if (status === 'COMPLETED' || status === 'VERIFICATION_PENDING') {
      item.completedAt = new Date().toISOString();
    }
    if (notes) {
      item.supervisorNotes = notes;
    }

    return { success: true, intervention: item };
  }

  public uploadEvidence(params: {
    interventionId: string;
    uploadedBy: GovernmentUser;
    location: string;
    fileType: 'PHOTOGRAPH' | 'LAB_REPORT' | 'GPS_LOG' | 'FIELD_INSPECTION_NOTE';
    fileReference: string;
    description: string;
  }): { success: boolean; evidence?: InterventionEvidence; error?: string } {
    const item = this.interventions.get(params.interventionId);
    if (!item) return { success: false, error: 'Intervention not found' };

    const newEvidence: InterventionEvidence = {
      evidenceId: `EVID_${Date.now()}`,
      interventionId: params.interventionId,
      uploadedBy: params.uploadedBy.fullName,
      uploadedAt: new Date().toISOString(),
      location: params.location,
      fileType: params.fileType,
      fileReference: params.fileReference,
      description: params.description,
      isVerified: false,
    };

    item.evidence.push(newEvidence);
    item.status = 'VERIFICATION_PENDING';

    return { success: true, evidence: newEvidence };
  }

  public verifyEvidence(params: {
    interventionId: string;
    evidenceId: string;
    supervisor: GovernmentUser;
    isApproved: boolean;
    notes: string;
  }): { success: boolean; intervention?: GovernmentIntervention; error?: string } {
    const item = this.interventions.get(params.interventionId);
    if (!item) return { success: false, error: 'Intervention not found' };

    const ev = item.evidence.find((e) => e.evidenceId === params.evidenceId);
    if (ev) {
      ev.isVerified = params.isApproved;
      ev.verifiedBy = params.supervisor.fullName;
      ev.verificationNotes = params.notes;
    }

    if (params.isApproved) {
      item.status = 'VERIFIED';
      item.verifiedAt = new Date().toISOString();
      item.verifiedBy = params.supervisor.fullName;
      item.supervisorNotes = params.notes;
    } else {
      item.status = 'REJECTED';
      item.supervisorNotes = `Action rejected upon supervisor audit: ${params.notes}`;
    }

    return { success: true, intervention: item };
  }
}
