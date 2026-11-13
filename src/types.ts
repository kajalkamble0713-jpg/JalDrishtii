export type DiseaseType = 'ADD' | 'Cholera' | 'Typhoid';

export type RiskTier = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface SatelliteData {
  turbidity: number; // FNU / relative unit
  ndci: number; // Normalized Difference Chlorophyll Index
  cdom: number; // Chromophoric Dissolved Organic Matter
  ndwi: number; // Normalized Difference Water Index
  awei: number; // Automated Water Extraction Index
  lstCelsius: number; // Land Surface Temperature in °C
}

export interface DistrictData {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  riskTier: RiskTier;
  riskScore: number; // 0.0 to 1.0
  addProbability: number;
  choleraProbability: number;
  typhoidProbability: number;
  typhoidCases2019?: number;
  sviScore: number;
  sviSource: 'NFHS-5' | 'Census 2011' | 'State Baseline';
  satellite: SatelliteData;
  lags: {
    turbidityLag1: number;
    turbidityLag2: number;
    ndciLag1: number;
    ndciLag2: number;
    lstLag1: number;
    lstLag2: number;
  };
  waterProximityKm: number; // Distance to nearest major river/lake
  outbreakRecords: number;
  historicalCases: { year: number; month: number; cases: number; risk: number }[];
}

export interface ModelMetrics {
  disease: DiseaseType;
  aucRoc: number;
  prAuc: number;
  precision: number;
  recall: number;
  f1Score: number;
  brierScore: number;
  ece: number;
  bestParams: {
    learning_rate: number;
    max_depth: number;
    n_estimators: number;
  };
  datasize: string;
}

export interface DistrictTransited {
  districtId?: string;
  name: string;
  state: string;
  role: 'Source / Upper Course' | 'Upper Course' | 'Mid-Course Basin' | 'Downstream Estuary / Delta';
  riskLevel: 'Very High' | 'High' | 'Moderate' | 'Low';
}

export interface RiverData {
  id: string;
  name: string;
  type: 'Major River' | 'Sub-Basin River' | 'Urban Tributary' | 'Estuary';
  lengthKm: number;
  origin: string;
  outflow: string;
  turbidity: string;
  turbidityValue: number; // FNU
  ndciValue: number; // Chlorophyll-a index
  cdomValue: number; // Dissolved organic matter
  dissolvedOxygenMgL: number; // mg/L
  phLevel: number;
  flowRate: string; // e.g. "12,000 m³/s"
  waterTempCelsius: number;
  outbreakRiskLevel: 'Very High' | 'High' | 'Moderate' | 'Low';
  statesTransited: string[];
  districtsTransited: DistrictTransited[];
  downstreamPropagationHours: number; // hours for upstream contamination to reach downstream districts
  basinPopulationMillions: number;
  keyOutbreakThreat: string;
  recommendedWashAction: string;
  path: [number, number][]; // Lat, Lng polyline points
}

export interface GlobeControlsState {
  autoRotate: boolean;
  rotationSpeed: number;
  atmosphereGlow: boolean;
  nightLights: boolean;
  showClouds: boolean;
  showDistrictMarkers: boolean;
  showRivers: boolean;
  cameraPreset: 'india' | 'global' | 'telangana';
}

export interface OutbreakAlert {
  id: string;
  districtId: string;
  districtName: string;
  state: string;
  disease: DiseaseType;
  riskTier: RiskTier;
  riskScore: number;
  timestamp: string;
  triggerFactor: string;
}
