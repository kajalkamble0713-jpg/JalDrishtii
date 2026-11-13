/**
 * JalDrishti Data Management & Provenance Repository
 * Handles data sources registry, ingestion job executions, quality audit scores,
 * validation results, and ML feature provenance records.
 */

import { DatabaseManager } from '../connection.js';
import { DataSourceType, DataStatus } from '../../services/data/types.js';

export interface DataSourceRegistryRecord {
  sourceId: string;
  name: string;
  type: DataSourceType;
  provider: string;
  description: string;
  status: DataStatus;
  lastSuccessfulFetch?: string;
  lastAttempt?: string;
  nextExpectedUpdate?: string;
  updateFrequency: string;
  qualityScore: number;
  freshnessStatus: string;
  configurationStatus: string;
}

export interface IngestionJobDbRecord {
  jobId: string;
  sourceId: string;
  startedAt: string;
  completedAt?: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'CANCELLED';
  recordsReceived: number;
  recordsAccepted: number;
  recordsRejected: number;
  errorCount: number;
  errorMessage?: string;
  durationMs?: number;
  retryCount: number;
}

export interface VulnerabilityIndicatorRecord {
  vulnerabilityId?: string;
  districtId: string;
  surveySource: string;
  surveyYear: number;
  sviScore: number;
  unimprovedWaterPercent: number;
  openDefecationPercent: number;
  illiteracyPercent: number;
  belowPovertyLinePercent: number;
  calculationMethod: string;
  completenessPercent: number;
  qualityScore: number;
}

export class DataManagementRepository {
  private static instance: DataManagementRepository;

  private inMemorySources: DataSourceRegistryRecord[] = [
    {
      sourceId: 'src_open_meteo',
      name: 'Open-Meteo High-Resolution Numerical Weather Blend',
      type: 'weather',
      provider: 'Open-Meteo ECMWF/GFS Blend',
      description: 'Live ground temperature, precipitation, humidity, and barometric pressure',
      status: 'LIVE',
      updateFrequency: 'Hourly Real-Time',
      qualityScore: 98,
      freshnessStatus: 'LIVE',
      configurationStatus: 'CONFIGURED',
      lastSuccessfulFetch: new Date().toISOString(),
      lastAttempt: new Date().toISOString(),
    },
    {
      sourceId: 'src_sentinel2',
      name: 'Copernicus Sentinel-2 Level-2A Multi-Spectral',
      type: 'satellite_sentinel2',
      provider: 'Copernicus Data Space Ecosystem (ESA)',
      description: 'High-resolution multispectral indices: NDWI, AWEI, NDCI, and turbidity proxies',
      status: 'NOT_CONFIGURED',
      updateFrequency: '5-Day Orbital Revisit',
      qualityScore: 0,
      freshnessStatus: 'UNAVAILABLE',
      configurationStatus: 'PENDING_CREDENTIALS',
    },
    {
      sourceId: 'src_modis',
      name: 'NASA Terra/Aqua MODIS Land Surface Temperature (MOD11A1)',
      type: 'satellite_modis',
      provider: 'NASA Earthdata / LP DAAC',
      description: 'Diurnal thermal observations and surface water heating dynamics',
      status: 'NOT_CONFIGURED',
      updateFrequency: 'Daily Diurnal Pass',
      qualityScore: 0,
      freshnessStatus: 'UNAVAILABLE',
      configurationStatus: 'PENDING_CREDENTIALS',
    },
    {
      sourceId: 'src_hydrology',
      name: 'Central Water Commission (CWC) River Basin Telemetry',
      type: 'hydrology',
      provider: 'Central Water Commission (CWC) & India-WRIS',
      description: '9 major river basins, gauge heights, discharge rates, and flood warning levels',
      status: 'STATIC',
      updateFrequency: 'Daily Flood Season Synoptic',
      qualityScore: 82,
      freshnessStatus: 'STATIC',
      configurationStatus: 'CONFIGURED',
    },
    {
      sourceId: 'src_water_quality',
      name: 'Central Pollution Control Board Surface Water Quality',
      type: 'water_quality',
      provider: 'CPCB Guidelines & Calibrated Optical Model',
      description: 'Turbidity, pH, dissolved oxygen, fecal coliform, and conductivity benchmarks',
      status: 'MODELED',
      updateFrequency: 'Monthly Sampling Cycle',
      qualityScore: 78,
      freshnessStatus: 'MODELED',
      configurationStatus: 'CONFIGURED',
    },
    {
      sourceId: 'src_epidemiology',
      name: 'IDSP & EpiClim Health Surveillance Benchmarks',
      type: 'epidemiology',
      provider: 'EpiClim Project & IDSP Weekly Bulletins',
      description: 'Historical disease occurrence logs for ADD, Cholera, and Typhoid across 223 districts',
      status: 'STATIC',
      updateFrequency: 'Quarterly Scientific Release',
      qualityScore: 92,
      freshnessStatus: 'HISTORICAL',
      configurationStatus: 'CONFIGURED',
    },
    {
      sourceId: 'src_census_svi',
      name: 'NFHS-5 & Census 2011 Social Vulnerability Index',
      type: 'census_svi',
      provider: 'NFHS-5 (2019-2021) & Census of India (2011)',
      description: 'Socioeconomic vulnerability scores computed via Principal Component Analysis',
      status: 'STATIC',
      updateFrequency: 'Decennial / Multi-Year Survey',
      qualityScore: 96,
      freshnessStatus: 'STATIC',
      configurationStatus: 'CONFIGURED',
    },
  ];

  private inMemoryJobs: IngestionJobDbRecord[] = [];

  private constructor() {}

  public static getInstance(): DataManagementRepository {
    if (!DataManagementRepository.instance) {
      DataManagementRepository.instance = new DataManagementRepository();
    }
    return DataManagementRepository.instance;
  }

  public async getDataSources(): Promise<DataSourceRegistryRecord[]> {
    const db = DatabaseManager.getInstance();
    const res = await db.query<any>(
      `SELECT source_id, name, type, provider, description, status, last_successful_fetch,
              last_attempt, next_expected_update, update_frequency, quality_score, freshness_status,
              configuration_status
       FROM data_sources
       ORDER BY quality_score DESC;`
    );
    if (res && res.rows.length > 0) {
      return res.rows.map((r) => ({
        sourceId: r.source_id,
        name: r.name,
        type: r.type,
        provider: r.provider,
        description: r.description,
        status: r.status,
        lastSuccessfulFetch: r.last_successful_fetch,
        lastAttempt: r.last_attempt,
        nextExpectedUpdate: r.next_expected_update,
        updateFrequency: r.update_frequency,
        qualityScore: r.quality_score,
        freshnessStatus: r.freshness_status,
        configurationStatus: r.configuration_status,
      }));
    }

    return this.inMemorySources;
  }

  public async recordIngestionJob(job: IngestionJobDbRecord): Promise<void> {
    const db = DatabaseManager.getInstance();
    await db.query(
      `INSERT INTO data_ingestion_jobs (
        job_id, source_id, started_at, completed_at, status, records_received,
        records_accepted, records_rejected, error_count, error_message, duration_ms, retry_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (job_id) DO UPDATE SET
        status = EXCLUDED.status,
        completed_at = EXCLUDED.completed_at,
        records_received = EXCLUDED.records_received,
        records_accepted = EXCLUDED.records_accepted,
        duration_ms = EXCLUDED.duration_ms;`,
      [
        job.jobId,
        job.sourceId,
        job.startedAt,
        job.completedAt || new Date().toISOString(),
        job.status,
        job.recordsReceived,
        job.recordsAccepted,
        job.recordsRejected,
        job.errorCount,
        job.errorMessage || null,
        job.durationMs || 0,
        job.retryCount,
      ]
    );

    const idx = this.inMemoryJobs.findIndex((j) => j.jobId === job.jobId);
    if (idx >= 0) {
      this.inMemoryJobs[idx] = job;
    } else {
      this.inMemoryJobs.unshift(job);
    }
  }

  public async getIngestionJobs(limit = 20): Promise<IngestionJobDbRecord[]> {
    const db = DatabaseManager.getInstance();
    const res = await db.query<any>(
      `SELECT job_id, source_id, started_at, completed_at, status, records_received,
              records_accepted, records_rejected, error_count, error_message, duration_ms, retry_count
       FROM data_ingestion_jobs
       ORDER BY started_at DESC
       LIMIT $1;`,
      [limit]
    );
    if (res && res.rows.length > 0) {
      return res.rows.map((r) => ({
        jobId: r.job_id,
        sourceId: r.source_id,
        startedAt: r.started_at,
        completedAt: r.completed_at,
        status: r.status,
        recordsReceived: r.records_received,
        recordsAccepted: r.records_accepted,
        recordsRejected: r.records_rejected,
        errorCount: r.error_count,
        errorMessage: r.error_message,
        durationMs: r.duration_ms,
        retryCount: r.retry_count,
      }));
    }

    return this.inMemoryJobs.slice(0, limit);
  }

  public async getVulnerability(districtId?: string): Promise<VulnerabilityIndicatorRecord[]> {
    const db = DatabaseManager.getInstance();
    let sql = `
      SELECT vulnerability_id, district_id, survey_source, survey_year, svi_score,
             unimproved_water_percent, open_defecation_percent, illiteracy_percent,
             below_poverty_line_percent, calculation_method, completeness_percent, quality_score
      FROM vulnerability_indicators
      WHERE 1=1
    `;
    const values: any[] = [];
    if (districtId) {
      sql += ` AND district_id = $1`;
      values.push(districtId);
    }
    sql += ` ORDER BY svi_score DESC;`;

    const res = await db.query<any>(sql, values);
    if (res && res.rows.length > 0) {
      return res.rows.map((r) => ({
        vulnerabilityId: r.vulnerability_id,
        districtId: r.district_id,
        surveySource: r.survey_source,
        surveyYear: r.survey_year,
        sviScore: r.svi_score,
        unimprovedWaterPercent: r.unimproved_water_percent,
        openDefecationPercent: r.open_defecation_percent,
        illiteracyPercent: r.illiteracy_percent,
        belowPovertyLinePercent: r.below_poverty_line_percent,
        calculationMethod: r.calculation_method,
        completenessPercent: r.completeness_percent,
        qualityScore: r.quality_score,
      }));
    }

    return [
      {
        districtId: districtId || 'patna_bihar',
        surveySource: 'NFHS-5 (2019-2021)',
        surveyYear: 2020,
        sviScore: 0.72,
        unimprovedWaterPercent: 28.5,
        openDefecationPercent: 24.1,
        illiteracyPercent: 29.8,
        belowPovertyLinePercent: 33.4,
        calculationMethod: 'Principal Component Analysis (PCA)',
        completenessPercent: 98.5,
        qualityScore: 94,
      },
    ];
  }
}
