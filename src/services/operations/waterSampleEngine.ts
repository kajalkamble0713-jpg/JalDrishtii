/**
 * JalDrishti Water Sample Management & Chain of Custody Engine
 * Implements strict sample ID generation (JD-YYYY-DISTRICT-SEQUENCE),
 * comprehensive sample metadata, and immutable chain-of-custody tracking.
 */

import { GovernmentUser } from '../auth/rbacEngine.js';

export type SampleType =
  | 'DRINKING_WATER'
  | 'RIVER_WATER'
  | 'GROUNDWATER'
  | 'RESERVOIR_WATER'
  | 'TANK_WATER'
  | 'PIPELINE_WATER'
  | 'SEWAGE_EFFLUENT';

export type ContainerType =
  | 'STERILE_GLASS'
  | 'STERILE_PET'
  | 'AMBER_BOTTLE'
  | 'CHEMICAL_JUG';

export type PreservationMethod =
  | 'ICE_BOX_4C'
  | 'SODIUM_THIOSULFATE'
  | 'ACIDIFIED_HNO3'
  | 'NONE';

export type CustodyStage =
  | 'COLLECTED'
  | 'SEALED'
  | 'HANDED_OVER'
  | 'TRANSPORTED'
  | 'RECEIVED_BY_LAB'
  | 'TESTING'
  | 'RESULT_AVAILABLE'
  | 'VERIFIED';

export type SampleQCStatus = 'VALID' | 'QUESTIONABLE' | 'REJECTED';

export interface CustodyRecord {
  custodyId: string;
  sampleId: string;
  stage: CustodyStage;
  actorId: string;
  actorName: string;
  actorRole: string;
  fromEntity?: string;
  toEntity?: string;
  location: string;
  temperatureCelsius?: number; // Cold-chain audit verification
  conditionStatus: 'EXCELLENT' | 'GOOD' | 'SEAL_INTACT' | 'SLIGHT_WARMING' | 'LEAKAGE_DETECTED' | 'SEAL_BROKEN';
  notes: string;
  timestamp: string;
}

export interface WaterSample {
  sampleId: string; // Format: JD-YYYY-DISTRICT-SEQUENCE
  taskId?: string;
  alertId?: string;
  predictionId?: string;
  districtId: string;
  districtName: string;
  waterSourceId: string;
  waterSourceName: string;
  collectorId: string;
  collectorName: string;
  collectorRole: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  locationVerified: boolean;
  collectionTimestamp: string;
  sampleType: SampleType;
  containerType: ContainerType;
  preservationMethod: PreservationMethod;
  transportCondition: string;
  qcStatus: SampleQCStatus;
  qcNotes?: string;
  status: CustodyStage;
  custodyTrail: CustodyRecord[];
  createdAt: string;
  updatedAt: string;
}

export class WaterSampleEngine {
  private static instance: WaterSampleEngine;
  private samples: Map<string, WaterSample> = new Map();
  private districtCounters: Map<string, number> = new Map();

  private constructor() {
    this.seedBaselineWaterSamples();
  }

  public static getInstance(): WaterSampleEngine {
    if (!WaterSampleEngine.instance) {
      WaterSampleEngine.instance = new WaterSampleEngine();
    }
    return WaterSampleEngine.instance;
  }

  /**
   * Generates unique Sample ID strictly following: JD-YYYY-DISTRICT-SEQUENCE
   */
  public generateUniqueSampleId(districtId: string, year = 2026): string {
    const rawDistrict = districtId.split('_')[0].toUpperCase();
    const cleanDistrict = rawDistrict.replace(/[^A-Z]/g, '');
    const currentSeq = (this.districtCounters.get(cleanDistrict) || 0) + 1;
    this.districtCounters.set(cleanDistrict, currentSeq);

    const sampleId = `JD-${year}-${cleanDistrict}-${String(currentSeq).padStart(3, '0')}`;
    if (this.samples.has(sampleId)) {
      // Safety against reuse
      return this.generateUniqueSampleId(districtId, year);
    }
    return sampleId;
  }

  private seedBaselineWaterSamples(): void {
    const s1: WaterSample = {
      sampleId: 'JD-2026-PATNA-001',
      taskId: 'FT_PATNA_2026_001',
      alertId: 'ALT_PATNA_ADD_2026_01',
      predictionId: 'PRED_PATNA_2026_01',
      districtId: 'patna_bihar',
      districtName: 'Patna',
      waterSourceId: 'ws_patna_danapur_01',
      waterSourceName: 'Danapur Community Tube-well Cluster #4',
      collectorId: 'usr_field_patna_01',
      collectorName: 'Rajesh Kumar',
      collectorRole: 'FIELD_WORKER',
      latitude: 25.6186,
      longitude: 85.0442,
      locationAccuracy: 12.0,
      locationVerified: true,
      collectionTimestamp: new Date(Date.now() - 3600000 * 16).toISOString(),
      sampleType: 'DRINKING_WATER',
      containerType: 'STERILE_PET',
      preservationMethod: 'ICE_BOX_4C',
      transportCondition: 'Cold-chain insulated icebox held at 3.8°C',
      qcStatus: 'VALID',
      qcNotes: 'Collected in sterile PET bottle after 3 minutes pump flushing. Cold chain intact.',
      status: 'RECEIVED_BY_LAB',
      custodyTrail: [
        {
          custodyId: 'CUST_PATNA_001_1',
          sampleId: 'JD-2026-PATNA-001',
          stage: 'COLLECTED',
          actorId: 'usr_field_patna_01',
          actorName: 'Rajesh Kumar',
          actorRole: 'Senior MPHW (Field Worker)',
          location: 'Danapur Ward 4 Wellhead (25.6186°N, 85.0442°E)',
          temperatureCelsius: 22.4,
          conditionStatus: 'EXCELLENT',
          notes: 'Flushed well for 3 mins. Placed in sterile bottle with sodium thiosulfate.',
          timestamp: new Date(Date.now() - 3600000 * 16).toISOString(),
        },
        {
          custodyId: 'CUST_PATNA_001_2',
          sampleId: 'JD-2026-PATNA-001',
          stage: 'SEALED',
          actorId: 'usr_field_patna_01',
          actorName: 'Rajesh Kumar',
          actorRole: 'Senior MPHW (Field Worker)',
          location: 'Danapur Ward 4 Field Station',
          conditionStatus: 'SEAL_INTACT',
          notes: 'Tamper-evident barcode seal #JD-SEAL-8891 applied.',
          timestamp: new Date(Date.now() - 3600000 * 15.5).toISOString(),
        },
        {
          custodyId: 'CUST_PATNA_001_3',
          sampleId: 'JD-2026-PATNA-001',
          stage: 'TRANSPORTED',
          actorId: 'usr_field_patna_01',
          actorName: 'Rajesh Kumar',
          actorRole: 'Field Logistics',
          fromEntity: 'Danapur PHC',
          toEntity: 'District Water Testing Lab, Patna',
          location: 'Transit Vehicle BR-01-GH-4921',
          temperatureCelsius: 3.8,
          conditionStatus: 'SEAL_INTACT',
          notes: 'Cold chain verified with digital probe datalogger.',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          custodyId: 'CUST_PATNA_001_4',
          sampleId: 'JD-2026-PATNA-001',
          stage: 'RECEIVED_BY_LAB',
          actorId: 'usr_lab_patna_01',
          actorName: 'Sunita Devi',
          actorRole: 'LAB_OFFICER',
          location: 'Patna District Public Health Water Laboratory',
          temperatureCelsius: 4.1,
          conditionStatus: 'SEAL_INTACT',
          notes: 'Sample received within 4.5 hours of collection. Logged in lab accession register #LAB-2026-902.',
          timestamp: new Date(Date.now() - 3600000 * 11.5).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 11.5).toISOString(),
    };

    const s2: WaterSample = {
      sampleId: 'JD-2026-PATNA-002',
      taskId: 'FT_PATNA_2026_002',
      alertId: 'ALT_PATNA_ADD_2026_01',
      predictionId: 'PRED_PATNA_2026_01',
      districtId: 'patna_bihar',
      districtName: 'Patna',
      waterSourceId: 'ws_patna_digha_02',
      waterSourceName: 'Digha Ghat Raw Water Intake',
      collectorId: 'usr_field_patna_01',
      collectorName: 'Rajesh Kumar',
      collectorRole: 'FIELD_WORKER',
      latitude: 25.6421,
      longitude: 85.0991,
      locationAccuracy: 15.0,
      locationVerified: true,
      collectionTimestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      sampleType: 'RIVER_WATER',
      containerType: 'STERILE_GLASS',
      preservationMethod: 'ICE_BOX_4C',
      transportCondition: 'Cold-chain icebox maintained',
      qcStatus: 'VALID',
      qcNotes: 'Collected at 0.5m depth from river intake conduit.',
      status: 'TRANSPORTED',
      custodyTrail: [
        {
          custodyId: 'CUST_PATNA_002_1',
          sampleId: 'JD-2026-PATNA-002',
          stage: 'COLLECTED',
          actorId: 'usr_field_patna_01',
          actorName: 'Rajesh Kumar',
          actorRole: 'Senior MPHW',
          location: 'Digha Ghat Riverbank (25.6421°N, 85.0991°E)',
          temperatureCelsius: 26.2,
          conditionStatus: 'EXCELLENT',
          notes: 'Grab sample collected at 0.5m sub-surface.',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        {
          custodyId: 'CUST_PATNA_002_2',
          sampleId: 'JD-2026-PATNA-002',
          stage: 'SEALED',
          actorId: 'usr_field_patna_01',
          actorName: 'Rajesh Kumar',
          actorRole: 'Senior MPHW',
          location: 'Digha Pump House',
          conditionStatus: 'SEAL_INTACT',
          notes: 'Hermetic foil seal applied.',
          timestamp: new Date(Date.now() - 3600000 * 4.8).toISOString(),
        },
        {
          custodyId: 'CUST_PATNA_002_3',
          sampleId: 'JD-2026-PATNA-002',
          stage: 'TRANSPORTED',
          actorId: 'usr_field_patna_01',
          actorName: 'Rajesh Kumar',
          actorRole: 'Field Worker',
          location: 'En route to District Lab, Ashok Rajpath',
          temperatureCelsius: 4.0,
          conditionStatus: 'SEAL_INTACT',
          notes: 'Ice box temperature 4.0°C.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    };

    this.samples.set(s1.sampleId, s1);
    this.samples.set(s2.sampleId, s2);
    this.districtCounters.set('PATNA', 2);
  }

  public getSamples(filters?: {
    districtId?: string;
    status?: CustodyStage;
    sampleType?: SampleType;
    qcStatus?: SampleQCStatus;
  }): WaterSample[] {
    let result = Array.from(this.samples.values());

    if (filters?.districtId) {
      result = result.filter((s) => s.districtId === filters.districtId);
    }
    if (filters?.status) {
      result = result.filter((s) => s.status === filters.status);
    }
    if (filters?.sampleType) {
      result = result.filter((s) => s.sampleType === filters.sampleType);
    }
    if (filters?.qcStatus) {
      result = result.filter((s) => s.qcStatus === filters.qcStatus);
    }

    return result.sort((a, b) => new Date(b.collectionTimestamp).getTime() - new Date(a.collectionTimestamp).getTime());
  }

  public getSampleById(sampleId: string): WaterSample | null {
    return this.samples.get(sampleId) || null;
  }

  public registerSample(data: {
    collector: GovernmentUser;
    taskId?: string;
    alertId?: string;
    predictionId?: string;
    districtId: string;
    districtName: string;
    waterSourceId: string;
    waterSourceName: string;
    sampleType: SampleType;
    containerType: ContainerType;
    preservationMethod: PreservationMethod;
    latitude?: number | null;
    longitude?: number | null;
    locationAccuracy?: number | null;
    transportCondition?: string;
    initialNotes?: string;
  }): WaterSample {
    const sampleId = this.generateUniqueSampleId(data.districtId);

    const hasCoordinates = typeof data.latitude === 'number' && typeof data.longitude === 'number' &&
      !isNaN(data.latitude) && !isNaN(data.longitude) &&
      data.latitude >= -90 && data.latitude <= 90 &&
      data.longitude >= -180 && data.longitude <= 180;

    const locationVerified = Boolean(
      hasCoordinates &&
      typeof data.locationAccuracy === 'number' &&
      data.locationAccuracy > 0 &&
      data.locationAccuracy <= 50
    );

    const now = new Date().toISOString();

    const initialCustody: CustodyRecord = {
      custodyId: `CUST_${sampleId}_1`,
      sampleId,
      stage: 'COLLECTED',
      actorId: data.collector.userId,
      actorName: data.collector.fullName,
      actorRole: data.collector.role,
      location: locationVerified ? `${data.latitude?.toFixed(4)}°N, ${data.longitude?.toFixed(4)}°E` : data.waterSourceName,
      conditionStatus: 'EXCELLENT',
      notes: data.initialNotes || `Sample collected at ${data.waterSourceName} under standard sanitary sampling protocol.`,
      timestamp: now,
    };

    const newSample: WaterSample = {
      sampleId,
      taskId: data.taskId,
      alertId: data.alertId,
      predictionId: data.predictionId,
      districtId: data.districtId,
      districtName: data.districtName,
      waterSourceId: data.waterSourceId,
      waterSourceName: data.waterSourceName,
      collectorId: data.collector.userId,
      collectorName: data.collector.fullName,
      collectorRole: data.collector.role,
      latitude: hasCoordinates ? data.latitude! : null,
      longitude: hasCoordinates ? data.longitude! : null,
      locationAccuracy: data.locationAccuracy ?? null,
      locationVerified,
      collectionTimestamp: now,
      sampleType: data.sampleType,
      containerType: data.containerType,
      preservationMethod: data.preservationMethod,
      transportCondition: data.transportCondition || 'Ice-box cold chain storage at < 4°C',
      qcStatus: 'VALID',
      status: 'COLLECTED',
      custodyTrail: [initialCustody],
      createdAt: now,
      updatedAt: now,
    };

    this.samples.set(sampleId, newSample);
    return newSample;
  }

  public recordCustodyTransition(data: {
    sampleId: string;
    actor: GovernmentUser;
    stage: CustodyStage;
    fromEntity?: string;
    toEntity?: string;
    location: string;
    temperatureCelsius?: number;
    conditionStatus: 'EXCELLENT' | 'GOOD' | 'SEAL_INTACT' | 'SLIGHT_WARMING' | 'LEAKAGE_DETECTED' | 'SEAL_BROKEN';
    notes: string;
  }): { success: boolean; sample?: WaterSample; custody?: CustodyRecord; error?: string } {
    const sample = this.samples.get(data.sampleId);
    if (!sample) return { success: false, error: 'Sample not found' };

    const seq = sample.custodyTrail.length + 1;
    const custodyRecord: CustodyRecord = {
      custodyId: `CUST_${sample.sampleId}_${seq}`,
      sampleId: sample.sampleId,
      stage: data.stage,
      actorId: data.actor.userId,
      actorName: data.actor.fullName,
      actorRole: data.actor.role,
      fromEntity: data.fromEntity,
      toEntity: data.toEntity,
      location: data.location,
      temperatureCelsius: data.temperatureCelsius,
      conditionStatus: data.conditionStatus,
      notes: data.notes,
      timestamp: new Date().toISOString(),
    };

    sample.custodyTrail.push(custodyRecord);
    sample.status = data.stage;
    sample.updatedAt = new Date().toISOString();

    // Evaluate Quality Control status based on transit condition
    if (data.conditionStatus === 'SEAL_BROKEN' || data.conditionStatus === 'LEAKAGE_DETECTED') {
      sample.qcStatus = 'REJECTED';
      sample.qcNotes = `Quality rejected at custody stage ${data.stage}: ${data.conditionStatus}`;
    } else if (data.conditionStatus === 'SLIGHT_WARMING' || (data.temperatureCelsius && data.temperatureCelsius > 10.0)) {
      sample.qcStatus = 'QUESTIONABLE';
      sample.qcNotes = `Flagged questionable: Temperature reached ${data.temperatureCelsius}°C (standard requires <= 4-6°C)`;
    }

    return { success: true, sample, custody: custodyRecord };
  }
}
