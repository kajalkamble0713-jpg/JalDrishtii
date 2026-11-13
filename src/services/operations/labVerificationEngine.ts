/**
 * JalDrishti Laboratory Verification & Water Quality Testing Engine
 * Manages laboratory registries (marked NOT_CONFIGURED for external APIs),
 * multi-parameter test benches, verification sign-offs, and immutable amendment audits.
 */

import { GovernmentUser } from '../auth/rbacEngine.js';

export type LabVerificationStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'AMENDED';

export interface LabParameterSpec {
  code: string;
  name: string;
  unit: string;
  standard: string; // e.g. 'BIS 10500:2012'
  desirableMin?: number;
  desirableMax?: number;
  permissibleMax?: number;
  method: string;
  isMicrobiological: boolean;
}

export const WATER_QUALITY_TEST_SPECS: Record<string, LabParameterSpec> = {
  PH: {
    code: 'PH',
    name: 'pH (Hydrogen Ion Activity)',
    unit: 'pH Units',
    standard: 'BIS 10500:2012 (Desirable 6.5 - 8.5)',
    desirableMin: 6.5,
    desirableMax: 8.5,
    permissibleMax: 8.5,
    method: 'Electrometric Method (IS 3025 Part 11)',
    isMicrobiological: false,
  },
  TURBIDITY: {
    code: 'TURBIDITY',
    name: 'Nephelometric Turbidity',
    unit: 'NTU',
    standard: 'BIS 10500:2012 (Desirable <= 1.0 NTU, Permissible <= 5.0 NTU)',
    desirableMax: 1.0,
    permissibleMax: 5.0,
    method: 'Nephelometric Method (IS 3025 Part 10)',
    isMicrobiological: false,
  },
  RESIDUAL_CHLORINE: {
    code: 'RESIDUAL_CHLORINE',
    name: 'Free Residual Chlorine',
    unit: 'mg/L',
    standard: 'BIS 10500:2012 (Min 0.2 mg/L in distribution, 0.5 mg/L during epidemic risk)',
    desirableMin: 0.2,
    desirableMax: 1.0,
    permissibleMax: 2.0,
    method: 'DPD Colorimetric Method (IS 3025 Part 26)',
    isMicrobiological: false,
  },
  E_COLI: {
    code: 'E_COLI',
    name: 'Escherichia coli (Thermotolerant Coliform)',
    unit: 'CFU / 100 mL',
    standard: 'BIS 10500:2012 (Zero / 100 mL in treated drinking water)',
    desirableMax: 0.0,
    permissibleMax: 0.0,
    method: 'Membrane Filtration / MUG Agar Culture (IS 1622:1981)',
    isMicrobiological: true,
  },
  TOTAL_COLIFORM: {
    code: 'TOTAL_COLIFORM',
    name: 'Total Coliform Bacteria',
    unit: 'CFU / 100 mL',
    standard: 'BIS 10500:2012 (Zero / 100 mL in treated drinking water)',
    desirableMax: 0.0,
    permissibleMax: 0.0,
    method: 'Multiple Tube Fermentation / MPN (IS 1622:1981)',
    isMicrobiological: true,
  },
  DISSOLVED_OXYGEN: {
    code: 'DISSOLVED_OXYGEN',
    name: 'Dissolved Oxygen (DO)',
    unit: 'mg/L',
    standard: 'CPCB Inland Surface Water Class C (Min >= 4.0 mg/L)',
    desirableMin: 4.0,
    method: 'Winkler Azide Modification (IS 3025 Part 38)',
    isMicrobiological: false,
  },
  CONDUCTIVITY: {
    code: 'CONDUCTIVITY',
    name: 'Electrical Conductivity (EC)',
    unit: 'µS/cm',
    standard: 'WHO Benchmark (Desirable < 800 µS/cm)',
    desirableMax: 800.0,
    permissibleMax: 1500.0,
    method: 'Conductivity Meter at 25°C',
    isMicrobiological: false,
  },
};

export interface LabTestResult {
  resultId: string;
  sampleId: string;
  labId: string;
  parameterCode: string;
  parameterName: string;
  numericValue: number;
  qualitativeValue?: string; // e.g. 'DETECTED / POSITIVE' or 'NOT DETECTED'
  unit: string;
  isExceeded: boolean;
  benchmarkStandard: string;
  testedBy: string;
  testedAt: string;
  verificationStatus: LabVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  amendmentHistory: Array<{
    amendedBy: string;
    previousValue: number;
    newValue: number;
    justification: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface LaboratoryRecord {
  labId: string;
  name: string;
  districtId: string;
  stateId: string;
  accreditation: 'NABL_ACCREDITED' | 'STATE_GOVT_RECOGNIZED' | 'PHED_DISTRICT_LAB';
  address: string;
  contactPerson: string;
  apiIntegrationStatus: 'LIVE' | 'NOT_CONFIGURED' | 'UNAVAILABLE';
  integrationNotes: string;
  isActive: boolean;
}

export class LabVerificationEngine {
  private static instance: LabVerificationEngine;
  private laboratories: Map<string, LaboratoryRecord> = new Map();
  private results: Map<string, LabTestResult> = new Map();

  private constructor() {
    this.seedBaselineLaboratories();
    this.seedBaselineLabResults();
  }

  public static getInstance(): LabVerificationEngine {
    if (!LabVerificationEngine.instance) {
      LabVerificationEngine.instance = new LabVerificationEngine();
    }
    return LabVerificationEngine.instance;
  }

  private seedBaselineLaboratories(): void {
    const labPatna: LaboratoryRecord = {
      labId: 'LAB_PATNA_01',
      name: 'District Water Testing & Surveillance Laboratory, Patna',
      districtId: 'patna_bihar',
      stateId: 'bihar',
      accreditation: 'NABL_ACCREDITED',
      address: 'PHED Water Works Campus, Ashok Rajpath, Patna - 800004',
      contactPerson: 'Sunita Devi (Chief Microbiologist)',
      apiIntegrationStatus: 'NOT_CONFIGURED',
      integrationNotes: 'LIMS integration pending secure NIC government API gateway deployment. Currently operating in validated standalone manual data entry mode.',
      isActive: true,
    };

    const labKhordha: LaboratoryRecord = {
      labId: 'LAB_KHORDHA_01',
      name: 'State Water & Sanitation Mission Testing Lab, Bhubaneswar',
      districtId: 'khordha_odisha',
      stateId: 'odisha',
      accreditation: 'STATE_GOVT_RECOGNIZED',
      address: 'RWSS Division Campus, Unit-V, Bhubaneswar - 751001',
      contactPerson: 'Dr. P. K. Nayak (Senior Chemist)',
      apiIntegrationStatus: 'NOT_CONFIGURED',
      integrationNotes: 'Odisha State LIMS interface in evaluation phase. Marked NOT_CONFIGURED per system guidelines.',
      isActive: true,
    };

    this.laboratories.set(labPatna.labId, labPatna);
    this.laboratories.set(labKhordha.labId, labKhordha);
  }

  private seedBaselineLabResults(): void {
    const res1: LabTestResult = {
      resultId: 'RES_PATNA_001_ECOLI',
      sampleId: 'JD-2026-PATNA-001',
      labId: 'LAB_PATNA_01',
      parameterCode: 'E_COLI',
      parameterName: 'Escherichia coli (Thermotolerant Coliform)',
      numericValue: 42.0,
      qualitativeValue: 'CONFIRMED CONTAMINATION DETECTED',
      unit: 'CFU / 100 mL',
      isExceeded: true, // Exceeds 0 CFU/100 mL BIS standard
      benchmarkStandard: 'BIS 10500:2012 (Permissible: 0 CFU/100 mL)',
      testedBy: 'Sunita Devi (Chief Microbiologist)',
      testedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      verificationStatus: 'VERIFIED',
      verifiedBy: 'Sunita Devi (Chief Microbiologist)',
      verifiedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      verificationNotes: 'Triplicate membrane filtration culture confirmed thermotolerant colonies with metallic sheen on EMB agar. Exceeds drinking water threshold. Immediate source chlorination advised.',
      amendmentHistory: [],
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    };

    const res2: LabTestResult = {
      resultId: 'RES_PATNA_001_CHLORINE',
      sampleId: 'JD-2026-PATNA-001',
      labId: 'LAB_PATNA_01',
      parameterCode: 'RESIDUAL_CHLORINE',
      parameterName: 'Free Residual Chlorine',
      numericValue: 0.05,
      qualitativeValue: 'DEFICIENT CHLORINE RESIDUAL',
      unit: 'mg/L',
      isExceeded: true, // Deficient below 0.2 mg/L requirement
      benchmarkStandard: 'BIS 10500:2012 (Desirable Min 0.2 mg/L)',
      testedBy: 'Sunita Devi (Chief Microbiologist)',
      testedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      verificationStatus: 'VERIFIED',
      verifiedBy: 'Sunita Devi (Chief Microbiologist)',
      verifiedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      verificationNotes: 'DPD photometric reading 0.05 mg/L is critically below safety minimum 0.20 mg/L.',
      amendmentHistory: [],
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    };

    const res3: LabTestResult = {
      resultId: 'RES_PATNA_001_TURBIDITY',
      sampleId: 'JD-2026-PATNA-001',
      labId: 'LAB_PATNA_01',
      parameterCode: 'TURBIDITY',
      parameterName: 'Nephelometric Turbidity',
      numericValue: 3.8,
      qualitativeValue: 'SLIGHT TURBIDITY ELEVATION',
      unit: 'NTU',
      isExceeded: false, // Within permissible 5.0 NTU though above desirable 1.0
      benchmarkStandard: 'BIS 10500:2012 (Desirable <= 1.0 NTU, Permissible <= 5.0 NTU)',
      testedBy: 'Sunita Devi (Chief Microbiologist)',
      testedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      verificationStatus: 'VERIFIED',
      verifiedBy: 'Sunita Devi (Chief Microbiologist)',
      verifiedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      verificationNotes: 'Within BIS permissible limit (5 NTU) for unpiped community source.',
      amendmentHistory: [],
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    };

    this.results.set(res1.resultId, res1);
    this.results.set(res2.resultId, res2);
    this.results.set(res3.resultId, res3);
  }

  public getLaboratories(): LaboratoryRecord[] {
    return Array.from(this.laboratories.values());
  }

  public getResults(sampleId?: string): LabTestResult[] {
    let list = Array.from(this.results.values());
    if (sampleId) {
      list = list.filter((r) => r.sampleId === sampleId);
    }
    return list.sort((a, b) => new Date(b.testedAt).getTime() - new Date(a.testedAt).getTime());
  }

  public getResultById(resultId: string): LabTestResult | null {
    return this.results.get(resultId) || null;
  }

  public submitTestResult(data: {
    sampleId: string;
    labId: string;
    parameterCode: string;
    numericValue: number;
    testedBy: string;
    qualitativeValue?: string;
    notes?: string;
  }): { success: boolean; result?: LabTestResult; error?: string } {
    const spec = WATER_QUALITY_TEST_SPECS[data.parameterCode.toUpperCase()];
    if (!spec) {
      return { success: false, error: `Unknown water quality parameter code: ${data.parameterCode}` };
    }

    const resultId = `RES_${data.sampleId}_${data.parameterCode.toUpperCase()}_${Date.now()}`;

    // Determine if exceeded based on parameter standard
    let isExceeded = false;
    if (spec.code === 'RESIDUAL_CHLORINE') {
      // For chlorine, deficient is a failure
      isExceeded = data.numericValue < (spec.desirableMin ?? 0.2);
    } else if (spec.permissibleMax !== undefined) {
      isExceeded = data.numericValue > spec.permissibleMax;
    } else if (spec.desirableMax !== undefined) {
      isExceeded = data.numericValue > spec.desirableMax;
    }

    const now = new Date().toISOString();
    const newResult: LabTestResult = {
      resultId,
      sampleId: data.sampleId,
      labId: data.labId,
      parameterCode: spec.code,
      parameterName: spec.name,
      numericValue: data.numericValue,
      qualitativeValue: data.qualitativeValue || (isExceeded ? 'EXCEEDED' : 'WITHIN_DESIRABLE_LIMITS'),
      unit: spec.unit,
      isExceeded,
      benchmarkStandard: spec.standard,
      testedBy: data.testedBy,
      testedAt: now,
      verificationStatus: 'SUBMITTED',
      verificationNotes: data.notes,
      amendmentHistory: [],
      createdAt: now,
      updatedAt: now,
    };

    this.results.set(resultId, newResult);
    return { success: true, result: newResult };
  }

  public verifyResult(data: {
    resultId: string;
    verifier: GovernmentUser;
    isApproved: boolean;
    verificationNotes: string;
  }): { success: boolean; result?: LabTestResult; error?: string } {
    const result = this.results.get(data.resultId);
    if (!result) return { success: false, error: 'Result not found' };

    result.verificationStatus = data.isApproved ? 'VERIFIED' : 'REJECTED';
    result.verifiedBy = data.verifier.fullName;
    result.verifiedAt = new Date().toISOString();
    result.verificationNotes = data.verificationNotes;
    result.updatedAt = new Date().toISOString();

    return { success: true, result };
  }

  public amendResult(data: {
    resultId: string;
    amender: GovernmentUser;
    newValue: number;
    justification: string;
  }): { success: boolean; result?: LabTestResult; error?: string } {
    const result = this.results.get(data.resultId);
    if (!result) return { success: false, error: 'Result not found' };

    if (!data.justification || data.justification.trim().length === 0) {
      return { success: false, error: 'Mandatory justification required for laboratory result amendment' };
    }

    // Record immutable audit history of amendment
    result.amendmentHistory.push({
      amendedBy: `${data.amender.fullName} (${data.amender.role})`,
      previousValue: result.numericValue,
      newValue: data.newValue,
      justification: data.justification,
      timestamp: new Date().toISOString(),
    });

    result.numericValue = data.newValue;
    result.verificationStatus = 'AMENDED';
    result.updatedAt = new Date().toISOString();

    return { success: true, result };
  }
}
