/**
 * JalDrishti Data Provider Registry & Orchestrator
 * Central singleton managing all 7 environmental and health data providers.
 * Exposes platform-wide data health grids, quality score aggregation, and unified ingestion.
 */

import { DataSourceType, DataMetadata, QualityScoreBreakdown, DataStatus } from './types';
import { OpenMeteoProvider } from './weather/OpenMeteoProvider';
import { Sentinel2Provider } from './satellite/Sentinel2Provider';
import { ModisProvider } from './satellite/ModisProvider';
import { HydrologyProvider } from './hydrology/HydrologyProvider';
import { WaterQualityProvider } from './waterQuality/WaterQualityProvider';
import { EpidemiologyProvider } from './epidemiology/EpidemiologyProvider';
import { CensusVulnerabilityProvider } from './census/CensusVulnerabilityProvider';
import { IoTSensorProvider } from './sensors/IoTSensorProvider';

export interface SourceHealthStatus {
  sourceType: DataSourceType;
  title: string;
  provider: string;
  status: DataStatus;
  qualityScore: number;
  lastObservedAt: string | null;
  lastFetchedAt: string;
  isFallback: boolean;
  notes: string;
  badgeClass: string;
}

export class DataProviderRegistry {
  private static instance: DataProviderRegistry;

  public readonly weather: OpenMeteoProvider;
  public readonly sentinel2: Sentinel2Provider;
  public readonly modis: ModisProvider;
  public readonly hydrology: HydrologyProvider;
  public readonly waterQuality: WaterQualityProvider;
  public readonly epidemiology: EpidemiologyProvider;
  public readonly census: CensusVulnerabilityProvider;
  public readonly iotSensors: IoTSensorProvider;

  private constructor() {
    this.weather = new OpenMeteoProvider();
    this.sentinel2 = new Sentinel2Provider();
    this.modis = new ModisProvider();
    this.hydrology = new HydrologyProvider();
    this.waterQuality = new WaterQualityProvider();
    this.epidemiology = new EpidemiologyProvider();
    this.census = new CensusVulnerabilityProvider();
    this.iotSensors = new IoTSensorProvider();
  }

  public static getInstance(): DataProviderRegistry {
    if (!DataProviderRegistry.instance) {
      DataProviderRegistry.instance = new DataProviderRegistry();
    }
    return DataProviderRegistry.instance;
  }

  /**
   * Return comprehensive health and provenance status for all sources.
   */
  public getHealthSummary(): SourceHealthStatus[] {
    const weatherMeta = this.weather.getMetadata();
    const sentinelMeta = this.sentinel2.getMetadata();
    const modisMeta = this.modis.getMetadata();
    const hydroMeta = this.hydrology.getMetadata();
    const wqMeta = this.waterQuality.getMetadata();
    const epiMeta = this.epidemiology.getMetadata();
    const censusMeta = this.census.getMetadata();
    const iotMeta = this.iotSensors.getMetadata();

    const makeStatus = (
      type: DataSourceType,
      title: string,
      meta: DataMetadata,
      defaultNote: string
    ): SourceHealthStatus => {
      let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
      if (meta.status === 'LIVE') badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      else if (meta.status === 'RECENT') badgeClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      else if (meta.status === 'STALE') badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      else if (meta.status === 'STATIC') badgeClass = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      else if (meta.status === 'MODELED') badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      else if (meta.status === 'NOT_CONFIGURED') badgeClass = 'bg-zinc-800 text-zinc-400 border-zinc-700';
      else if (meta.status === 'UNAVAILABLE') badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';

      return {
        sourceType: type,
        title,
        provider: meta.provider,
        status: meta.status,
        qualityScore: meta.qualityScore,
        lastObservedAt: meta.observedAt,
        lastFetchedAt: meta.fetchedAt,
        isFallback: meta.isFallback,
        notes: meta.errorMessage || defaultNote,
        badgeClass,
      };
    };

    return [
      makeStatus('weather', 'Meteorological Forecast & Weather API', weatherMeta, 'Active live sync via Open-Meteo.'),
      makeStatus('satellite_sentinel2', 'Sentinel-2 Multispectral Water Quality', sentinelMeta, 'STAC credentials unconfigured; using verified research baseline.'),
      makeStatus(
        'satellite_modis',
        'MODIS Land Surface Temperature (LST)',
        modisMeta,
        this.modis.getStatus() === 'NOT_CONFIGURED'
          ? 'NASA Earthdata unconfigured; using validated climatological baseline.'
          : 'NASA Earthdata credentials configured; MOD11A1 diurnal thermal feeds active.'
      ),
      makeStatus('hydrology', 'River Hydrology & Basin Flow Polylines', hydroMeta, 'CWC river geometry and mid-basin reference stations.'),
      makeStatus('water_quality', 'Surface Water Quality Laboratory Metrics', wqMeta, 'Calibrated biophysical optical model.'),
      makeStatus('epidemiology', 'Disease Surveillance Ground Truth', epiMeta, 'EpiClim & Telangana HMIS historical outbreak benchmarks.'),
      makeStatus('census_svi', 'Census & NFHS-5 Vulnerability Index (SVI)', censusMeta, 'Static official survey demographics & PCA weights.'),
      makeStatus(
        'iot_sensors',
        'In-Situ Edge Water Sensors (MQTT/REST)',
        iotMeta,
        'NO LIVE SENSOR CONNECTION. Gateway awaiting hardware pairing.'
      ),
    ];
  }

  /**
   * Aggregate platform-wide data quality score (weighted average).
   */
  public getOverallPlatformQuality(): { score: number; liveSourceCount: number; totalSources: number } {
    const summary = this.getHealthSummary();
    const liveCount = summary.filter((s) => s.status === 'LIVE' || s.status === 'RECENT').length;
    const avgScore = Math.round(summary.reduce((acc, s) => acc + s.qualityScore, 0) / summary.length);

    return {
      score: avgScore,
      liveSourceCount: liveCount,
      totalSources: summary.length,
    };
  }
}
