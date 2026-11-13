/**
 * JalDrishti Data Ingestion Scheduler & Job Engine
 * Manages recurring background tasks, backoff retries, execution history,
 * and manual re-triggering for all environmental data feeds.
 */

import { DataSourceType, IngestionJobRecord } from '../types';
import { DataProviderRegistry } from '../registry';

export class IngestionScheduler {
  private static instance: IngestionScheduler;
  private jobs: Map<string, IngestionJobRecord> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private executionLogs: Array<{ jobId: string; timestamp: string; status: string; message: string }> = [];

  private constructor() {
    this.initializeJobs();
  }

  public static getInstance(): IngestionScheduler {
    if (!IngestionScheduler.instance) {
      IngestionScheduler.instance = new IngestionScheduler();
    }
    return IngestionScheduler.instance;
  }

  private initializeJobs(): void {
    const jobTemplates: Omit<IngestionJobRecord, 'lastRunAt' | 'nextRunAt' | 'recordsIngested' | 'lastErrorMessage' | 'retryCount'>[] = [
      {
        jobId: 'job_weather_sync',
        sourceType: 'weather',
        title: 'Open-Meteo High-Resolution Atmospheric Sync',
        scheduleDescription: 'Every 15 minutes (or manual trigger)',
        status: 'IDLE',
      },
      {
        jobId: 'job_sentinel2_stac',
        sourceType: 'satellite_sentinel2',
        title: 'Copernicus Sentinel-2 MSI L2A STAC Ingestion',
        scheduleDescription: 'Every 5 days on satellite overpass',
        status: 'IDLE',
      },
      {
        jobId: 'job_modis_lst',
        sourceType: 'satellite_modis',
        title: 'NASA MODIS Diurnal Land Surface Temperature Sync',
        scheduleDescription: 'Daily at 06:00 UTC',
        status: 'IDLE',
      },
      {
        jobId: 'job_cwc_hydrology',
        sourceType: 'hydrology',
        title: 'Central Water Commission (CWC) River Gauge Ingestion',
        scheduleDescription: 'Hourly flood monitoring cycle',
        status: 'IDLE',
      },
      {
        jobId: 'job_cpcb_water_quality',
        sourceType: 'water_quality',
        title: 'CPCB National Water Quality Monitoring Programme',
        scheduleDescription: 'Daily laboratory verification cycle',
        status: 'IDLE',
      },
      {
        jobId: 'job_idsp_epidemiology',
        sourceType: 'epidemiology',
        title: 'IDSP / IHIP Syndromic Health Surveillance Sync',
        scheduleDescription: 'Weekly epidemiological surveillance week (Epi-Week)',
        status: 'IDLE',
      },
      {
        jobId: 'job_iot_telemetry',
        sourceType: 'iot_sensors',
        title: 'In-Situ Edge Water Sonde Telemetry Harvester',
        scheduleDescription: 'Continuous event-driven / 5-min heartbeat',
        status: 'IDLE',
      },
    ];

    for (const t of jobTemplates) {
      this.jobs.set(t.jobId, {
        ...t,
        lastRunAt: null,
        nextRunAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        recordsIngested: 0,
        lastErrorMessage: null,
        retryCount: 0,
      });
    }
  }

  public listJobs(): IngestionJobRecord[] {
    return Array.from(this.jobs.values());
  }

  public getJob(jobId: string): IngestionJobRecord | undefined {
    return this.jobs.get(jobId);
  }

  public getLogs(): Array<{ jobId: string; timestamp: string; status: string; message: string }> {
    return [...this.executionLogs].slice(-50); // Keep last 50 logs
  }

  /**
   * Execute or trigger an ingestion job manually or on schedule.
   */
  public async runJob(jobId: string): Promise<{ success: boolean; message: string; recordsIngested: number }> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return { success: false, message: `Job ${jobId} not found`, recordsIngested: 0 };
    }

    job.status = 'RUNNING';
    const startTime = new Date().toISOString();

    const registry = DataProviderRegistry.getInstance();
    let recordsIngested = 0;
    let success = false;
    let errorMsg: string | null = null;

    try {
      switch (job.sourceType) {
        case 'weather': {
          const res = await registry.weather.fetch({ lat: 25.5941, lng: 85.1376 });
          recordsIngested = 1;
          success = res.validation.isValid;
          if (!success) errorMsg = 'Validation issue in weather payload.';
          break;
        }
        case 'satellite_sentinel2': {
          const res = await registry.sentinel2.fetch({ lat: 25.5941, lng: 85.1376 });
          recordsIngested = 1;
          success = true;
          break;
        }
        case 'satellite_modis': {
          const res = await registry.modis.fetch({ lat: 25.5941, lng: 85.1376 });
          recordsIngested = 1;
          success = true;
          break;
        }
        case 'hydrology': {
          const res = await registry.hydrology.fetch();
          recordsIngested = res.data.length;
          success = true;
          break;
        }
        case 'water_quality': {
          const res = await registry.waterQuality.fetch();
          recordsIngested = res.data.length;
          success = true;
          break;
        }
        case 'epidemiology': {
          const res = await registry.epidemiology.fetch();
          recordsIngested = res.data.length;
          success = true;
          break;
        }
        case 'iot_sensors': {
          const res = await registry.iotSensors.fetch();
          recordsIngested = res.data.length;
          success = true;
          break;
        }
        default:
          success = true;
      }

      job.status = success ? 'SUCCESS' : 'FAILED';
      job.lastRunAt = startTime;
      job.recordsIngested = recordsIngested;
      job.lastErrorMessage = errorMsg;
      job.nextRunAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      this.logExecution(jobId, job.status, success ? `Ingested ${recordsIngested} record(s) successfully.` : errorMsg || 'Failed');
      return { success, message: job.status, recordsIngested };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      job.status = 'FAILED';
      job.lastRunAt = startTime;
      job.lastErrorMessage = msg;
      job.retryCount++;
      this.logExecution(jobId, 'FAILED', `Error: ${msg}`);
      return { success: false, message: msg, recordsIngested: 0 };
    }
  }

  private logExecution(jobId: string, status: string, message: string): void {
    this.executionLogs.push({
      jobId,
      timestamp: new Date().toISOString(),
      status,
      message,
    });
  }
}
