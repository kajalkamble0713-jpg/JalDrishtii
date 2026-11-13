/**
 * JalDrishti Data Provider Type Definitions
 * Formal schemas, status enums, metadata interfaces, and validation contracts.
 */

export type DataSourceType =
  | 'weather'
  | 'satellite_sentinel2'
  | 'satellite_modis'
  | 'hydrology'
  | 'water_quality'
  | 'epidemiology'
  | 'census_svi'
  | 'iot_sensors';

export type DataStatus =
  | 'LIVE'
  | 'RECENT'
  | 'STALE'
  | 'FAILED'
  | 'UNAVAILABLE'
  | 'STATIC'
  | 'MODELED'
  | 'SIMULATED'
  | 'NOT_CONFIGURED';

export interface QualityScoreBreakdown {
  freshness: number; // 0 - 25
  completeness: number; // 0 - 25
  validity: number; // 0 - 25
  sourceReliability: number; // 0 - 25
  total: number; // 0 - 100
  notes: string[];
}

export interface DataMetadata {
  source: string;
  provider: string;
  sourceType: DataSourceType;
  status: DataStatus;
  fetchedAt: string; // ISO 8601 string
  observedAt: string | null;
  freshness: DataStatus;
  qualityScore: number; // 0 - 100
  qualityBreakdown: QualityScoreBreakdown;
  units?: Record<string, string>;
  location?: {
    lat: number;
    lng: number;
    district?: string;
    state?: string;
  };
  rawSourceReference?: string;
  isFallback: boolean;
  errorMessage?: string;
  lastSuccessfulFetch?: string;
  lastAttempt?: string;
  nextExpectedUpdate?: string;
}

export interface ValidationIssue {
  field: string;
  value: unknown;
  rule: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  validatedAt: string;
}

export interface DataResult<T> {
  data: T;
  metadata: DataMetadata;
  validation: ValidationResult;
}

/**
 * Common DataProvider interface adhered to by all ingestion sources.
 */
export interface IDataProvider<T> {
  readonly providerName: string;
  readonly sourceType: DataSourceType;
  getStatus(): DataStatus;
  fetch(params?: Record<string, unknown>): Promise<DataResult<T>>;
  validate(data: unknown): ValidationResult;
  normalize(raw: unknown): T;
  getMetadata(): DataMetadata;
  getFreshness(): { status: DataStatus; ageMinutes: number; nextExpectedMinutes?: number };
  getQualityScore(): QualityScoreBreakdown;
}

// -------------------------------------------------------------
// Normalized Domain Models
// -------------------------------------------------------------

export interface WeatherObservation {
  temperature2m: number; // °C
  precipitation: number; // mm
  surfacePressure: number; // hPa
  relativeHumidity?: number; // %
  windSpeed10m?: number; // km/h
  weatherCode?: number;
  observedAt: string;
  gridLatitude: number;
  gridLongitude: number;
  elevationMeters?: number;
  isDay?: boolean;
}

export interface Sentinel2Product {
  productId: string;
  acquisitionDate: string;
  cloudCoveragePercent: number;
  satellitePlatform: 'Sentinel-2A' | 'Sentinel-2B';
  processingLevel: 'Level-2A' | 'Level-1C';
  geographicCoverageBbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  spectralIndices: {
    ndwi: number; // Normalized Difference Water Index [-1 to 1]
    awei: number; // Automated Water Extraction Index
    ndci: number; // Normalized Difference Chlorophyll Index [-1 to 1]
    ndvi?: number; // Normalized Difference Vegetation Index
    turbidityProxy: number; // FNU / NTU proxy derived from Band 4 / Band 3
    cdomProxy: number; // Chromophoric Dissolved Organic Matter proxy
  };
  cloudMaskApplied: boolean;
  validWaterPixelsPercent: number;
  stacItemUrl?: string;
}

export interface ModisLSTObservation {
  productId: string;
  acquisitionDate: string;
  coordinates: { lat: number; lng: number };
  spatialResolutionMeters: number;
  lstDayCelsius: number;
  lstNightCelsius?: number;
  qualityFlags: {
    cloudContamination: boolean;
    emissivityError: boolean;
    l2ProcessingPassed: boolean;
  };
  qcDescription: string;
}

export interface RiverObservation {
  riverId: string;
  gaugeId: string;
  gaugeName: string;
  latitude: number;
  longitude: number;
  waterLevelMeters: number;
  dangerLevelMeters?: number;
  warningLevelMeters?: number;
  dischargeCusecs?: number;
  flowRateM3PerSec?: number;
  rainfallPast24hMm?: number;
  floodCondition: 'Normal' | 'Alert' | 'Warning' | 'Danger' | 'Extreme';
  observedAt: string;
  upstreamGaugeId?: string;
  downstreamGaugeId?: string;
  downstreamPropagationHours?: number;
}

export interface WaterQualityObservation {
  sampleId: string;
  source: string;
  location: {
    lat: number;
    lng: number;
    waterBody: string;
    district: string;
    state: string;
  };
  observedAt: string;
  parameters: {
    ph: number;
    turbidityNtu: number;
    dissolvedOxygenMgL: number;
    conductivityMicroSiemens?: number;
    waterTemperatureCelsius: number;
    residualChlorineMgL?: number;
    fecalColiformMpnPer100ml?: number;
    ecoliPresent?: boolean;
  };
  qualityLevel: 'Potable' | 'Acceptable' | 'Contaminated' | 'Severe Hazard';
  verificationStatus: 'Lab Verified' | 'Automated Sensor' | 'Field Kit Unverified' | 'Modeled Research Benchmark';
}

export interface EpidemiologicalObservation {
  districtId: string;
  districtName: string;
  state: string;
  disease: 'ADD' | 'Cholera' | 'Typhoid';
  periodStart: string;
  periodEnd: string;
  suspectedCases: number;
  confirmedCases: number;
  totalHospitalizations: number;
  deaths: number;
  reportingFacilityCount: number;
  reportingAgency: string;
  isHistoricalResearchData: boolean;
}

export interface CensusVulnerabilityRecord {
  districtId: string;
  districtName: string;
  state: string;
  surveyYear: number;
  datasetVersion: string;
  variablesUsed: string[];
  calculationMethod: 'PCA (Principal Component Analysis)' | 'Equal Weight Composite' | 'Census Aggregation';
  sviScore: number; // 0.00 to 1.00
  unimprovedWaterAccessPercent: number;
  openDefecationPercent: number;
  illiteracyPercent: number;
  belowPovertyLinePercent: number;
  completenessPercent: number;
  qualityScore: number;
}

export interface IoTSensorDevice {
  sensorId: string;
  deviceType: 'Optical Turbidity Meter' | 'Multi-Param Sonde' | 'Float Telemetry Buoy' | 'Pumping Station Flow';
  waterSource: string;
  location: { lat: number; lng: number; district: string };
  parametersMonitored: string[];
  lastSeen: string | null;
  batteryPercent: number | null;
  firmwareVersion: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'NO_CONNECTION';
  isSimulated: boolean;
}

export interface IoTSensorReading {
  readingId: string;
  sensorId: string;
  timestamp: string;
  parameter: string;
  value: number;
  unit: string;
  signalQualityDbm?: number;
  isValidated: boolean;
}

export interface IngestionJobRecord {
  jobId: string;
  sourceType: DataSourceType;
  title: string;
  scheduleDescription: string;
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  lastRunAt: string | null;
  nextRunAt: string | null;
  recordsIngested: number;
  lastErrorMessage: string | null;
  retryCount: number;
}
