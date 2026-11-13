import { DistrictData } from '../types';

/**
 * JalDrishti Pan-India Hydrological & Epidemiological District Dataset (119 Districts)
 * Includes all 31 districts of Karnataka with dedicated river basin telemetry,
 * and comprehensive coverage across major river basins of India.
 */
export const COMPREHENSIVE_DISTRICTS: DistrictData[] = [
  // =========================================================================
  // 1. KARNATAKA (All 31 Districts - Special Hydrological Focus)
  // Basins: Cauvery, Krishna, Tungabhadra, Netravati, Sharavathi, Malaprabha, Ghataprabha
  // =========================================================================
  {
    id: 'bengaluru_urban_karnataka',
    name: 'Bengaluru Urban',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    riskTier: 'Moderate',
    riskScore: 0.58,
    addProbability: 0.56,
    choleraProbability: 0.52,
    typhoidProbability: 0.59,
    sviScore: 0.42,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.42,
      ndci: 0.28,
      cdom: 1.45,
      ndwi: 0.32,
      awei: -0.10,
      lstCelsius: 30.5
    },
    lags: {
      turbidityLag1: 3.25,
      turbidityLag2: 2.95,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 31.0,
      lstLag2: 29.8
    },
    waterProximityKm: 2.1,
    outbreakRecords: 19,
    historicalCases: [
      { year: 2021, month: 5, cases: 42, risk: 0.52 },
      { year: 2021, month: 6, cases: 58, risk: 0.59 },
      { year: 2022, month: 5, cases: 46, risk: 0.54 },
      { year: 2022, month: 6, cases: 62, risk: 0.61 }
    ]
  },
  {
    id: 'bengaluru_rural_karnataka',
    name: 'Bengaluru Rural',
    state: 'Karnataka',
    lat: 13.2847,
    lng: 77.5815,
    riskTier: 'Moderate',
    riskScore: 0.52,
    addProbability: 0.50,
    choleraProbability: 0.44,
    typhoidProbability: 0.51,
    sviScore: 0.49,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.10,
      ndci: 0.22,
      cdom: 1.30,
      ndwi: 0.28,
      awei: -0.14,
      lstCelsius: 31.8
    },
    lags: {
      turbidityLag1: 2.90,
      turbidityLag2: 2.65,
      ndciLag1: 0.20,
      ndciLag2: 0.18,
      lstLag1: 32.2,
      lstLag2: 30.6
    },
    waterProximityKm: 4.8,
    outbreakRecords: 12,
    historicalCases: [
      { year: 2021, month: 6, cases: 28, risk: 0.48 },
      { year: 2022, month: 6, cases: 34, risk: 0.53 }
    ]
  },
  {
    id: 'kalaburagi_karnataka',
    name: 'Kalaburagi',
    state: 'Karnataka',
    lat: 17.3297,
    lng: 76.8343,
    riskTier: 'Very High',
    riskScore: 0.82,
    addProbability: 0.84,
    choleraProbability: 0.81,
    typhoidProbability: 0.79,
    sviScore: 0.74,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.45,
      ndci: 0.35,
      cdom: 1.82,
      ndwi: 0.40,
      awei: -0.05,
      lstCelsius: 37.4
    },
    lags: {
      turbidityLag1: 4.12,
      turbidityLag2: 3.80,
      ndciLag1: 0.31,
      ndciLag2: 0.27,
      lstLag1: 36.5,
      lstLag2: 35.1
    },
    waterProximityKm: 1.8,
    outbreakRecords: 38,
    historicalCases: [
      { year: 2021, month: 5, cases: 82, risk: 0.78 },
      { year: 2021, month: 6, cases: 114, risk: 0.86 },
      { year: 2022, month: 5, cases: 90, risk: 0.81 },
      { year: 2022, month: 6, cases: 126, risk: 0.88 }
    ]
  },
  {
    id: 'udupi_karnataka',
    name: 'Udupi',
    state: 'Karnataka',
    lat: 13.3409,
    lng: 74.7421,
    riskTier: 'High',
    riskScore: 0.71,
    addProbability: 0.72,
    choleraProbability: 0.68,
    typhoidProbability: 0.65,
    sviScore: 0.38,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.15,
      ndci: 0.29,
      cdom: 1.70,
      ndwi: 0.52,
      awei: 0.08,
      lstCelsius: 32.1
    },
    lags: {
      turbidityLag1: 3.85,
      turbidityLag2: 3.50,
      ndciLag1: 0.26,
      ndciLag2: 0.22,
      lstLag1: 31.8,
      lstLag2: 30.5
    },
    waterProximityKm: 0.6,
    outbreakRecords: 24,
    historicalCases: [
      { year: 2021, month: 7, cases: 65, risk: 0.72 },
      { year: 2021, month: 8, cases: 54, risk: 0.68 },
      { year: 2022, month: 7, cases: 74, risk: 0.75 }
    ]
  },
  {
    id: 'mysuru_karnataka',
    name: 'Mysuru',
    state: 'Karnataka',
    lat: 12.2958,
    lng: 76.6394,
    riskTier: 'Moderate',
    riskScore: 0.54,
    addProbability: 0.55,
    choleraProbability: 0.51,
    typhoidProbability: 0.53,
    sviScore: 0.46,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.25,
      ndci: 0.24,
      cdom: 1.38,
      ndwi: 0.35,
      awei: -0.09,
      lstCelsius: 31.2
    },
    lags: {
      turbidityLag1: 3.05,
      turbidityLag2: 2.80,
      ndciLag1: 0.21,
      ndciLag2: 0.19,
      lstLag1: 31.8,
      lstLag2: 30.2
    },
    waterProximityKm: 1.5,
    outbreakRecords: 17,
    historicalCases: [
      { year: 2021, month: 6, cases: 38, risk: 0.52 },
      { year: 2022, month: 6, cases: 45, risk: 0.56 }
    ]
  },
  {
    id: 'belagavi_karnataka',
    name: 'Belagavi',
    state: 'Karnataka',
    lat: 15.8497,
    lng: 74.4977,
    riskTier: 'High',
    riskScore: 0.69,
    addProbability: 0.70,
    choleraProbability: 0.66,
    typhoidProbability: 0.64,
    sviScore: 0.58,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.92,
      ndci: 0.27,
      cdom: 1.60,
      ndwi: 0.42,
      awei: -0.04,
      lstCelsius: 32.8
    },
    lags: {
      turbidityLag1: 3.70,
      turbidityLag2: 3.35,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 33.2,
      lstLag2: 31.9
    },
    waterProximityKm: 2.4,
    outbreakRecords: 26,
    historicalCases: [
      { year: 2021, month: 7, cases: 58, risk: 0.66 },
      { year: 2022, month: 7, cases: 69, risk: 0.72 }
    ]
  },
  {
    id: 'dakshina_kannada_karnataka',
    name: 'Dakshina Kannada',
    state: 'Karnataka',
    lat: 12.8703,
    lng: 74.8806,
    riskTier: 'High',
    riskScore: 0.68,
    addProbability: 0.69,
    choleraProbability: 0.67,
    typhoidProbability: 0.62,
    sviScore: 0.36,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.10,
      ndci: 0.30,
      cdom: 1.68,
      ndwi: 0.54,
      awei: 0.09,
      lstCelsius: 31.9
    },
    lags: {
      turbidityLag1: 3.80,
      turbidityLag2: 3.42,
      ndciLag1: 0.27,
      ndciLag2: 0.23,
      lstLag1: 31.5,
      lstLag2: 30.1
    },
    waterProximityKm: 0.8,
    outbreakRecords: 22,
    historicalCases: [
      { year: 2021, month: 7, cases: 54, risk: 0.65 },
      { year: 2022, month: 7, cases: 62, risk: 0.70 }
    ]
  },
  {
    id: 'uttara_kannada_karnataka',
    name: 'Uttara Kannada',
    state: 'Karnataka',
    lat: 14.8135,
    lng: 74.1298,
    riskTier: 'Moderate',
    riskScore: 0.61,
    addProbability: 0.62,
    choleraProbability: 0.58,
    typhoidProbability: 0.56,
    sviScore: 0.44,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.65,
      ndci: 0.25,
      cdom: 1.55,
      ndwi: 0.48,
      awei: 0.04,
      lstCelsius: 31.4
    },
    lags: {
      turbidityLag1: 3.40,
      turbidityLag2: 3.10,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 31.9,
      lstLag2: 30.6
    },
    waterProximityKm: 1.1,
    outbreakRecords: 16,
    historicalCases: [
      { year: 2021, month: 7, cases: 41, risk: 0.58 },
      { year: 2022, month: 7, cases: 48, risk: 0.63 }
    ]
  },
  {
    id: 'shivamogga_karnataka',
    name: 'Shivamogga',
    state: 'Karnataka',
    lat: 13.9299,
    lng: 75.5681,
    riskTier: 'High',
    riskScore: 0.67,
    addProbability: 0.68,
    choleraProbability: 0.63,
    typhoidProbability: 0.61,
    sviScore: 0.48,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.88,
      ndci: 0.26,
      cdom: 1.58,
      ndwi: 0.44,
      awei: -0.02,
      lstCelsius: 32.4
    },
    lags: {
      turbidityLag1: 3.62,
      turbidityLag2: 3.28,
      ndciLag1: 0.23,
      ndciLag2: 0.20,
      lstLag1: 32.8,
      lstLag2: 31.2
    },
    waterProximityKm: 1.4,
    outbreakRecords: 21,
    historicalCases: [
      { year: 2021, month: 6, cases: 49, risk: 0.62 },
      { year: 2022, month: 6, cases: 57, risk: 0.69 }
    ]
  },
  {
    id: 'ballari_karnataka',
    name: 'Ballari',
    state: 'Karnataka',
    lat: 15.1394,
    lng: 76.9214,
    riskTier: 'Very High',
    riskScore: 0.81,
    addProbability: 0.82,
    choleraProbability: 0.79,
    typhoidProbability: 0.77,
    sviScore: 0.68,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.38,
      ndci: 0.33,
      cdom: 1.76,
      ndwi: 0.36,
      awei: -0.07,
      lstCelsius: 38.1
    },
    lags: {
      turbidityLag1: 4.10,
      turbidityLag2: 3.75,
      ndciLag1: 0.30,
      ndciLag2: 0.26,
      lstLag1: 37.4,
      lstLag2: 35.8
    },
    waterProximityKm: 2.8,
    outbreakRecords: 35,
    historicalCases: [
      { year: 2021, month: 5, cases: 78, risk: 0.77 },
      { year: 2021, month: 6, cases: 104, risk: 0.84 },
      { year: 2022, month: 5, cases: 88, risk: 0.80 },
      { year: 2022, month: 6, cases: 118, risk: 0.87 }
    ]
  },
  {
    id: 'vijayanagara_karnataka',
    name: 'Vijayanagara',
    state: 'Karnataka',
    lat: 15.2689,
    lng: 76.3909,
    riskTier: 'High',
    riskScore: 0.74,
    addProbability: 0.75,
    choleraProbability: 0.71,
    typhoidProbability: 0.69,
    sviScore: 0.63,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.05,
      ndci: 0.28,
      cdom: 1.62,
      ndwi: 0.40,
      awei: -0.06,
      lstCelsius: 37.0
    },
    lags: {
      turbidityLag1: 3.82,
      turbidityLag2: 3.50,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 36.5,
      lstLag2: 34.8
    },
    waterProximityKm: 1.2,
    outbreakRecords: 27,
    historicalCases: [
      { year: 2021, month: 6, cases: 62, risk: 0.71 },
      { year: 2022, month: 6, cases: 73, risk: 0.76 }
    ]
  },
  {
    id: 'dharwad_karnataka',
    name: 'Dharwad',
    state: 'Karnataka',
    lat: 15.3647,
    lng: 75.1240,
    riskTier: 'Moderate',
    riskScore: 0.62,
    addProbability: 0.63,
    choleraProbability: 0.59,
    typhoidProbability: 0.58,
    sviScore: 0.49,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.58,
      ndci: 0.24,
      cdom: 1.48,
      ndwi: 0.36,
      awei: -0.11,
      lstCelsius: 33.6
    },
    lags: {
      turbidityLag1: 3.35,
      turbidityLag2: 3.05,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 34.0,
      lstLag2: 32.5
    },
    waterProximityKm: 3.5,
    outbreakRecords: 18,
    historicalCases: [
      { year: 2021, month: 6, cases: 44, risk: 0.59 },
      { year: 2022, month: 6, cases: 52, risk: 0.64 }
    ]
  },
  {
    id: 'mandya_karnataka',
    name: 'Mandya',
    state: 'Karnataka',
    lat: 12.5223,
    lng: 76.8971,
    riskTier: 'High',
    riskScore: 0.68,
    addProbability: 0.69,
    choleraProbability: 0.65,
    typhoidProbability: 0.64,
    sviScore: 0.52,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.90,
      ndci: 0.27,
      cdom: 1.58,
      ndwi: 0.45,
      awei: -0.03,
      lstCelsius: 32.0
    },
    lags: {
      turbidityLag1: 3.65,
      turbidityLag2: 3.32,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 32.5,
      lstLag2: 31.0
    },
    waterProximityKm: 1.0,
    outbreakRecords: 23,
    historicalCases: [
      { year: 2021, month: 6, cases: 53, risk: 0.65 },
      { year: 2022, month: 6, cases: 64, risk: 0.70 }
    ]
  },
  {
    id: 'hassan_karnataka',
    name: 'Hassan',
    state: 'Karnataka',
    lat: 13.0033,
    lng: 76.1004,
    riskTier: 'Moderate',
    riskScore: 0.57,
    addProbability: 0.58,
    choleraProbability: 0.54,
    typhoidProbability: 0.52,
    sviScore: 0.47,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.40,
      ndci: 0.23,
      cdom: 1.42,
      ndwi: 0.38,
      awei: -0.08,
      lstCelsius: 31.0
    },
    lags: {
      turbidityLag1: 3.20,
      turbidityLag2: 2.92,
      ndciLag1: 0.21,
      ndciLag2: 0.18,
      lstLag1: 31.6,
      lstLag2: 30.2
    },
    waterProximityKm: 2.2,
    outbreakRecords: 15,
    historicalCases: [
      { year: 2021, month: 6, cases: 39, risk: 0.55 },
      { year: 2022, month: 6, cases: 46, risk: 0.59 }
    ]
  },
  {
    id: 'tumakuru_karnataka',
    name: 'Tumakuru',
    state: 'Karnataka',
    lat: 13.3409,
    lng: 77.1010,
    riskTier: 'Moderate',
    riskScore: 0.59,
    addProbability: 0.60,
    choleraProbability: 0.56,
    typhoidProbability: 0.55,
    sviScore: 0.51,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.50,
      ndci: 0.24,
      cdom: 1.46,
      ndwi: 0.33,
      awei: -0.12,
      lstCelsius: 33.2
    },
    lags: {
      turbidityLag1: 3.30,
      turbidityLag2: 3.00,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 33.8,
      lstLag2: 32.1
    },
    waterProximityKm: 3.8,
    outbreakRecords: 18,
    historicalCases: [
      { year: 2021, month: 6, cases: 43, risk: 0.57 },
      { year: 2022, month: 6, cases: 51, risk: 0.61 }
    ]
  },
  {
    id: 'davanagere_karnataka',
    name: 'Davanagere',
    state: 'Karnataka',
    lat: 14.4644,
    lng: 75.9218,
    riskTier: 'High',
    riskScore: 0.72,
    addProbability: 0.73,
    choleraProbability: 0.70,
    typhoidProbability: 0.68,
    sviScore: 0.59,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.12,
      ndci: 0.29,
      cdom: 1.66,
      ndwi: 0.41,
      awei: -0.05,
      lstCelsius: 35.8
    },
    lags: {
      turbidityLag1: 3.88,
      turbidityLag2: 3.52,
      ndciLag1: 0.26,
      ndciLag2: 0.23,
      lstLag1: 35.2,
      lstLag2: 33.7
    },
    waterProximityKm: 1.6,
    outbreakRecords: 25,
    historicalCases: [
      { year: 2021, month: 6, cases: 61, risk: 0.69 },
      { year: 2022, month: 6, cases: 72, risk: 0.74 }
    ]
  },
  {
    id: 'chikkamagaluru_karnataka',
    name: 'Chikkamagaluru',
    state: 'Karnataka',
    lat: 13.3161,
    lng: 75.7720,
    riskTier: 'Moderate',
    riskScore: 0.51,
    addProbability: 0.52,
    choleraProbability: 0.46,
    typhoidProbability: 0.48,
    sviScore: 0.43,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 2.95,
      ndci: 0.20,
      cdom: 1.32,
      ndwi: 0.46,
      awei: 0.02,
      lstCelsius: 29.5
    },
    lags: {
      turbidityLag1: 2.75,
      turbidityLag2: 2.50,
      ndciLag1: 0.18,
      ndciLag2: 0.16,
      lstLag1: 30.0,
      lstLag2: 28.7
    },
    waterProximityKm: 1.8,
    outbreakRecords: 11,
    historicalCases: [
      { year: 2021, month: 7, cases: 31, risk: 0.49 },
      { year: 2022, month: 7, cases: 36, risk: 0.53 }
    ]
  },
  {
    id: 'kodagu_karnataka',
    name: 'Kodagu',
    state: 'Karnataka',
    lat: 12.4244,
    lng: 75.7382,
    riskTier: 'Low',
    riskScore: 0.38,
    addProbability: 0.39,
    choleraProbability: 0.34,
    typhoidProbability: 0.35,
    sviScore: 0.35,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 2.45,
      ndci: 0.16,
      cdom: 1.15,
      ndwi: 0.50,
      awei: 0.06,
      lstCelsius: 27.8
    },
    lags: {
      turbidityLag1: 2.30,
      turbidityLag2: 2.10,
      ndciLag1: 0.15,
      ndciLag2: 0.13,
      lstLag1: 28.2,
      lstLag2: 27.0
    },
    waterProximityKm: 0.9,
    outbreakRecords: 8,
    historicalCases: [
      { year: 2021, month: 7, cases: 22, risk: 0.36 },
      { year: 2022, month: 7, cases: 25, risk: 0.39 }
    ]
  },
  {
    id: 'chamarajanagar_karnataka',
    name: 'Chamarajanagar',
    state: 'Karnataka',
    lat: 11.9261,
    lng: 76.9437,
    riskTier: 'High',
    riskScore: 0.70,
    addProbability: 0.71,
    choleraProbability: 0.68,
    typhoidProbability: 0.66,
    sviScore: 0.65,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.98,
      ndci: 0.28,
      cdom: 1.62,
      ndwi: 0.37,
      awei: -0.07,
      lstCelsius: 34.5
    },
    lags: {
      turbidityLag1: 3.75,
      turbidityLag2: 3.40,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 34.0,
      lstLag2: 32.8
    },
    waterProximityKm: 2.6,
    outbreakRecords: 24,
    historicalCases: [
      { year: 2021, month: 6, cases: 56, risk: 0.67 },
      { year: 2022, month: 6, cases: 67, risk: 0.72 }
    ]
  },
  {
    id: 'ramanagara_karnataka',
    name: 'Ramanagara',
    state: 'Karnataka',
    lat: 12.7209,
    lng: 77.2799,
    riskTier: 'Moderate',
    riskScore: 0.55,
    addProbability: 0.56,
    choleraProbability: 0.51,
    typhoidProbability: 0.53,
    sviScore: 0.48,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.30,
      ndci: 0.23,
      cdom: 1.40,
      ndwi: 0.34,
      awei: -0.10,
      lstCelsius: 32.4
    },
    lags: {
      turbidityLag1: 3.10,
      turbidityLag2: 2.85,
      ndciLag1: 0.21,
      ndciLag2: 0.18,
      lstLag1: 32.9,
      lstLag2: 31.4
    },
    waterProximityKm: 2.3,
    outbreakRecords: 14,
    historicalCases: [
      { year: 2021, month: 6, cases: 36, risk: 0.53 },
      { year: 2022, month: 6, cases: 42, risk: 0.57 }
    ]
  },
  {
    id: 'chikkaballapura_karnataka',
    name: 'Chikkaballapura',
    state: 'Karnataka',
    lat: 13.4325,
    lng: 77.7275,
    riskTier: 'Moderate',
    riskScore: 0.58,
    addProbability: 0.59,
    choleraProbability: 0.54,
    typhoidProbability: 0.56,
    sviScore: 0.54,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.45,
      ndci: 0.24,
      cdom: 1.45,
      ndwi: 0.29,
      awei: -0.13,
      lstCelsius: 33.5
    },
    lags: {
      turbidityLag1: 3.25,
      turbidityLag2: 2.95,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 34.0,
      lstLag2: 32.2
    },
    waterProximityKm: 4.2,
    outbreakRecords: 16,
    historicalCases: [
      { year: 2021, month: 6, cases: 41, risk: 0.56 },
      { year: 2022, month: 6, cases: 49, risk: 0.60 }
    ]
  },
  {
    id: 'kolar_karnataka',
    name: 'Kolar',
    state: 'Karnataka',
    lat: 13.1367,
    lng: 78.1291,
    riskTier: 'High',
    riskScore: 0.66,
    addProbability: 0.67,
    choleraProbability: 0.62,
    typhoidProbability: 0.64,
    sviScore: 0.57,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.82,
      ndci: 0.26,
      cdom: 1.55,
      ndwi: 0.27,
      awei: -0.15,
      lstCelsius: 34.2
    },
    lags: {
      turbidityLag1: 3.60,
      turbidityLag2: 3.25,
      ndciLag1: 0.23,
      ndciLag2: 0.20,
      lstLag1: 34.8,
      lstLag2: 33.1
    },
    waterProximityKm: 5.1,
    outbreakRecords: 22,
    historicalCases: [
      { year: 2021, month: 6, cases: 52, risk: 0.63 },
      { year: 2022, month: 6, cases: 63, risk: 0.68 }
    ]
  },
  {
    id: 'raichur_karnataka',
    name: 'Raichur',
    state: 'Karnataka',
    lat: 16.2076,
    lng: 77.3463,
    riskTier: 'Very High',
    riskScore: 0.85,
    addProbability: 0.86,
    choleraProbability: 0.83,
    typhoidProbability: 0.80,
    sviScore: 0.77,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.65,
      ndci: 0.36,
      cdom: 1.88,
      ndwi: 0.42,
      awei: -0.04,
      lstCelsius: 38.8
    },
    lags: {
      turbidityLag1: 4.35,
      turbidityLag2: 3.95,
      ndciLag1: 0.33,
      ndciLag2: 0.28,
      lstLag1: 38.0,
      lstLag2: 36.2
    },
    waterProximityKm: 1.3,
    outbreakRecords: 41,
    historicalCases: [
      { year: 2021, month: 5, cases: 94, risk: 0.81 },
      { year: 2021, month: 6, cases: 128, risk: 0.88 },
      { year: 2022, month: 5, cases: 102, risk: 0.84 },
      { year: 2022, month: 6, cases: 140, risk: 0.90 }
    ]
  },
  {
    id: 'koppal_karnataka',
    name: 'Koppal',
    state: 'Karnataka',
    lat: 15.3458,
    lng: 76.1554,
    riskTier: 'High',
    riskScore: 0.76,
    addProbability: 0.77,
    choleraProbability: 0.73,
    typhoidProbability: 0.71,
    sviScore: 0.69,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.18,
      ndci: 0.30,
      cdom: 1.68,
      ndwi: 0.39,
      awei: -0.06,
      lstCelsius: 37.5
    },
    lags: {
      turbidityLag1: 3.95,
      turbidityLag2: 3.60,
      ndciLag1: 0.27,
      ndciLag2: 0.24,
      lstLag1: 36.8,
      lstLag2: 35.0
    },
    waterProximityKm: 2.1,
    outbreakRecords: 29,
    historicalCases: [
      { year: 2021, month: 6, cases: 68, risk: 0.73 },
      { year: 2022, month: 6, cases: 81, risk: 0.78 }
    ]
  },
  {
    id: 'yadgir_karnataka',
    name: 'Yadgir',
    state: 'Karnataka',
    lat: 16.7621,
    lng: 77.1378,
    riskTier: 'Very High',
    riskScore: 0.83,
    addProbability: 0.84,
    choleraProbability: 0.80,
    typhoidProbability: 0.78,
    sviScore: 0.79,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.52,
      ndci: 0.34,
      cdom: 1.84,
      ndwi: 0.38,
      awei: -0.05,
      lstCelsius: 38.2
    },
    lags: {
      turbidityLag1: 4.22,
      turbidityLag2: 3.85,
      ndciLag1: 0.31,
      ndciLag2: 0.26,
      lstLag1: 37.5,
      lstLag2: 35.8
    },
    waterProximityKm: 1.7,
    outbreakRecords: 36,
    historicalCases: [
      { year: 2021, month: 5, cases: 88, risk: 0.79 },
      { year: 2021, month: 6, cases: 119, risk: 0.86 },
      { year: 2022, month: 5, cases: 96, risk: 0.82 },
      { year: 2022, month: 6, cases: 131, risk: 0.89 }
    ]
  },
  {
    id: 'bidar_karnataka',
    name: 'Bidar',
    state: 'Karnataka',
    lat: 17.9104,
    lng: 77.5199,
    riskTier: 'High',
    riskScore: 0.75,
    addProbability: 0.76,
    choleraProbability: 0.72,
    typhoidProbability: 0.70,
    sviScore: 0.67,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.10,
      ndci: 0.29,
      cdom: 1.64,
      ndwi: 0.35,
      awei: -0.09,
      lstCelsius: 36.9
    },
    lags: {
      turbidityLag1: 3.86,
      turbidityLag2: 3.52,
      ndciLag1: 0.26,
      ndciLag2: 0.22,
      lstLag1: 36.2,
      lstLag2: 34.6
    },
    waterProximityKm: 2.9,
    outbreakRecords: 28,
    historicalCases: [
      { year: 2021, month: 6, cases: 65, risk: 0.72 },
      { year: 2022, month: 6, cases: 78, risk: 0.77 }
    ]
  },
  {
    id: 'bagalkote_karnataka',
    name: 'Bagalkote',
    state: 'Karnataka',
    lat: 16.1691,
    lng: 75.6615,
    riskTier: 'High',
    riskScore: 0.77,
    addProbability: 0.78,
    choleraProbability: 0.74,
    typhoidProbability: 0.72,
    sviScore: 0.66,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.25,
      ndci: 0.31,
      cdom: 1.72,
      ndwi: 0.44,
      awei: -0.03,
      lstCelsius: 37.1
    },
    lags: {
      turbidityLag1: 3.98,
      turbidityLag2: 3.65,
      ndciLag1: 0.28,
      ndciLag2: 0.24,
      lstLag1: 36.5,
      lstLag2: 35.0
    },
    waterProximityKm: 1.1,
    outbreakRecords: 31,
    historicalCases: [
      { year: 2021, month: 6, cases: 71, risk: 0.74 },
      { year: 2022, month: 6, cases: 85, risk: 0.79 }
    ]
  },
  {
    id: 'vijayapura_karnataka',
    name: 'Vijayapura',
    state: 'Karnataka',
    lat: 16.8302,
    lng: 75.7100,
    riskTier: 'Very High',
    riskScore: 0.80,
    addProbability: 0.81,
    choleraProbability: 0.78,
    typhoidProbability: 0.76,
    sviScore: 0.71,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.35,
      ndci: 0.32,
      cdom: 1.78,
      ndwi: 0.37,
      awei: -0.06,
      lstCelsius: 37.9
    },
    lags: {
      turbidityLag1: 4.08,
      turbidityLag2: 3.72,
      ndciLag1: 0.29,
      ndciLag2: 0.25,
      lstLag1: 37.2,
      lstLag2: 35.5
    },
    waterProximityKm: 2.5,
    outbreakRecords: 34,
    historicalCases: [
      { year: 2021, month: 5, cases: 75, risk: 0.76 },
      { year: 2021, month: 6, cases: 101, risk: 0.83 },
      { year: 2022, month: 5, cases: 85, risk: 0.79 },
      { year: 2022, month: 6, cases: 114, risk: 0.86 }
    ]
  },
  {
    id: 'gadag_karnataka',
    name: 'Gadag',
    state: 'Karnataka',
    lat: 15.4312,
    lng: 75.6358,
    riskTier: 'Moderate',
    riskScore: 0.63,
    addProbability: 0.64,
    choleraProbability: 0.60,
    typhoidProbability: 0.59,
    sviScore: 0.53,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.62,
      ndci: 0.25,
      cdom: 1.50,
      ndwi: 0.32,
      awei: -0.11,
      lstCelsius: 35.2
    },
    lags: {
      turbidityLag1: 3.40,
      turbidityLag2: 3.10,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 35.6,
      lstLag2: 34.0
    },
    waterProximityKm: 3.2,
    outbreakRecords: 19,
    historicalCases: [
      { year: 2021, month: 6, cases: 47, risk: 0.60 },
      { year: 2022, month: 6, cases: 55, risk: 0.65 }
    ]
  },
  {
    id: 'haveri_karnataka',
    name: 'Haveri',
    state: 'Karnataka',
    lat: 14.7951,
    lng: 75.3991,
    riskTier: 'High',
    riskScore: 0.67,
    addProbability: 0.68,
    choleraProbability: 0.64,
    typhoidProbability: 0.62,
    sviScore: 0.56,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.85,
      ndci: 0.26,
      cdom: 1.56,
      ndwi: 0.39,
      awei: -0.06,
      lstCelsius: 34.8
    },
    lags: {
      turbidityLag1: 3.62,
      turbidityLag2: 3.30,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 35.1,
      lstLag2: 33.6
    },
    waterProximityKm: 1.9,
    outbreakRecords: 22,
    historicalCases: [
      { year: 2021, month: 6, cases: 52, risk: 0.64 },
      { year: 2022, month: 6, cases: 61, risk: 0.69 }
    ]
  },
  {
    id: 'chitradurga_karnataka',
    name: 'Chitradurga',
    state: 'Karnataka',
    lat: 14.2251,
    lng: 76.3980,
    riskTier: 'High',
    riskScore: 0.69,
    addProbability: 0.70,
    choleraProbability: 0.66,
    typhoidProbability: 0.65,
    sviScore: 0.61,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.92,
      ndci: 0.27,
      cdom: 1.59,
      ndwi: 0.31,
      awei: -0.12,
      lstCelsius: 36.2
    },
    lags: {
      turbidityLag1: 3.70,
      turbidityLag2: 3.35,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 36.5,
      lstLag2: 34.9
    },
    waterProximityKm: 3.6,
    outbreakRecords: 24,
    historicalCases: [
      { year: 2021, month: 6, cases: 57, risk: 0.66 },
      { year: 2022, month: 6, cases: 68, risk: 0.71 }
    ]
  },

  // =========================================================================
  // 2. BIHAR (12 Districts - Ganges & Kosi Floodplain)
  // =========================================================================
  {
    id: 'patna_bihar',
    name: 'Patna',
    state: 'Bihar',
    lat: 25.5941,
    lng: 85.1376,
    riskTier: 'Very High',
    riskScore: 0.88,
    addProbability: 0.89,
    choleraProbability: 0.76,
    typhoidProbability: 0.82,
    sviScore: 0.78,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.82,
      ndci: 0.34,
      cdom: 1.85,
      ndwi: 0.42,
      awei: -0.08,
      lstCelsius: 34.2
    },
    lags: {
      turbidityLag1: 4.51,
      turbidityLag2: 4.10,
      ndciLag1: 0.31,
      ndciLag2: 0.28,
      lstLag1: 33.8,
      lstLag2: 32.5
    },
    waterProximityKm: 1.2,
    outbreakRecords: 42,
    historicalCases: [
      { year: 2021, month: 6, cases: 124, risk: 0.82 },
      { year: 2021, month: 7, cases: 168, risk: 0.91 },
      { year: 2021, month: 8, cases: 145, risk: 0.86 },
      { year: 2022, month: 6, cases: 130, risk: 0.84 },
      { year: 2022, month: 7, cases: 182, risk: 0.93 },
      { year: 2022, month: 8, cases: 151, risk: 0.88 }
    ]
  },
  {
    id: 'gaya_bihar',
    name: 'Gaya',
    state: 'Bihar',
    lat: 24.7914,
    lng: 85.0002,
    riskTier: 'High',
    riskScore: 0.78,
    addProbability: 0.79,
    choleraProbability: 0.72,
    typhoidProbability: 0.75,
    sviScore: 0.73,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.20,
      ndci: 0.29,
      cdom: 1.68,
      ndwi: 0.35,
      awei: -0.10,
      lstCelsius: 36.5
    },
    lags: {
      turbidityLag1: 3.95,
      turbidityLag2: 3.60,
      ndciLag1: 0.26,
      ndciLag2: 0.23,
      lstLag1: 35.8,
      lstLag2: 34.2
    },
    waterProximityKm: 1.8,
    outbreakRecords: 31,
    historicalCases: [
      { year: 2021, month: 6, cases: 88, risk: 0.75 },
      { year: 2022, month: 6, cases: 97, risk: 0.80 }
    ]
  },
  {
    id: 'muzaffarpur_bihar',
    name: 'Muzaffarpur',
    state: 'Bihar',
    lat: 26.1209,
    lng: 85.3647,
    riskTier: 'Very High',
    riskScore: 0.86,
    addProbability: 0.87,
    choleraProbability: 0.78,
    typhoidProbability: 0.81,
    sviScore: 0.76,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.70,
      ndci: 0.33,
      cdom: 1.80,
      ndwi: 0.44,
      awei: -0.06,
      lstCelsius: 33.8
    },
    lags: {
      turbidityLag1: 4.42,
      turbidityLag2: 4.02,
      ndciLag1: 0.30,
      ndciLag2: 0.27,
      lstLag1: 33.2,
      lstLag2: 31.8
    },
    waterProximityKm: 0.9,
    outbreakRecords: 39,
    historicalCases: [
      { year: 2021, month: 7, cases: 135, risk: 0.85 },
      { year: 2022, month: 7, cases: 148, risk: 0.88 }
    ]
  },
  {
    id: 'bhagalpur_bihar',
    name: 'Bhagalpur',
    state: 'Bihar',
    lat: 25.2425,
    lng: 86.9842,
    riskTier: 'Very High',
    riskScore: 0.84,
    addProbability: 0.85,
    choleraProbability: 0.77,
    typhoidProbability: 0.79,
    sviScore: 0.74,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.60,
      ndci: 0.32,
      cdom: 1.76,
      ndwi: 0.45,
      awei: -0.05,
      lstCelsius: 34.5
    },
    lags: {
      turbidityLag1: 4.30,
      turbidityLag2: 3.92,
      ndciLag1: 0.29,
      ndciLag2: 0.25,
      lstLag1: 34.0,
      lstLag2: 32.5
    },
    waterProximityKm: 0.7,
    outbreakRecords: 35,
    historicalCases: [
      { year: 2021, month: 7, cases: 118, risk: 0.82 },
      { year: 2022, month: 7, cases: 132, risk: 0.86 }
    ]
  },
  {
    id: 'darbhanga_bihar',
    name: 'Darbhanga',
    state: 'Bihar',
    lat: 26.1542,
    lng: 85.8918,
    riskTier: 'Very High',
    riskScore: 0.85,
    addProbability: 0.86,
    choleraProbability: 0.79,
    typhoidProbability: 0.80,
    sviScore: 0.77,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.68,
      ndci: 0.33,
      cdom: 1.79,
      ndwi: 0.46,
      awei: -0.04,
      lstCelsius: 33.5
    },
    lags: {
      turbidityLag1: 4.38,
      turbidityLag2: 3.98,
      ndciLag1: 0.30,
      ndciLag2: 0.26,
      lstLag1: 33.0,
      lstLag2: 31.6
    },
    waterProximityKm: 0.8,
    outbreakRecords: 37,
    historicalCases: [
      { year: 2021, month: 7, cases: 125, risk: 0.84 },
      { year: 2022, month: 7, cases: 140, risk: 0.87 }
    ]
  },
  {
    id: 'purnia_bihar',
    name: 'Purnia',
    state: 'Bihar',
    lat: 25.7771,
    lng: 87.4753,
    riskTier: 'High',
    riskScore: 0.79,
    addProbability: 0.80,
    choleraProbability: 0.74,
    typhoidProbability: 0.76,
    sviScore: 0.75,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.30,
      ndci: 0.30,
      cdom: 1.70,
      ndwi: 0.43,
      awei: -0.06,
      lstCelsius: 33.2
    },
    lags: {
      turbidityLag1: 4.05,
      turbidityLag2: 3.68,
      ndciLag1: 0.27,
      ndciLag2: 0.24,
      lstLag1: 32.8,
      lstLag2: 31.5
    },
    waterProximityKm: 1.5,
    outbreakRecords: 30,
    historicalCases: [
      { year: 2021, month: 7, cases: 98, risk: 0.77 },
      { year: 2022, month: 7, cases: 110, risk: 0.81 }
    ]
  },
  {
    id: 'begusarai_bihar',
    name: 'Begusarai',
    state: 'Bihar',
    lat: 25.4182,
    lng: 86.1272,
    riskTier: 'High',
    riskScore: 0.77,
    addProbability: 0.78,
    choleraProbability: 0.73,
    typhoidProbability: 0.74,
    sviScore: 0.72,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.15,
      ndci: 0.29,
      cdom: 1.66,
      ndwi: 0.41,
      awei: -0.07,
      lstCelsius: 34.0
    },
    lags: {
      turbidityLag1: 3.90,
      turbidityLag2: 3.55,
      ndciLag1: 0.26,
      ndciLag2: 0.23,
      lstLag1: 33.6,
      lstLag2: 32.1
    },
    waterProximityKm: 1.1,
    outbreakRecords: 28,
    historicalCases: [
      { year: 2021, month: 7, cases: 86, risk: 0.74 },
      { year: 2022, month: 7, cases: 98, risk: 0.79 }
    ]
  },
  {
    id: 'vaishali_bihar',
    name: 'Vaishali',
    state: 'Bihar',
    lat: 25.6833,
    lng: 85.2167,
    riskTier: 'Very High',
    riskScore: 0.83,
    addProbability: 0.84,
    choleraProbability: 0.77,
    typhoidProbability: 0.79,
    sviScore: 0.73,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.55,
      ndci: 0.32,
      cdom: 1.75,
      ndwi: 0.43,
      awei: -0.05,
      lstCelsius: 34.1
    },
    lags: {
      turbidityLag1: 4.25,
      turbidityLag2: 3.88,
      ndciLag1: 0.29,
      ndciLag2: 0.25,
      lstLag1: 33.7,
      lstLag2: 32.2
    },
    waterProximityKm: 1.0,
    outbreakRecords: 33,
    historicalCases: [
      { year: 2021, month: 7, cases: 108, risk: 0.81 },
      { year: 2022, month: 7, cases: 122, risk: 0.85 }
    ]
  },
  {
    id: 'samastipur_bihar',
    name: 'Samastipur',
    state: 'Bihar',
    lat: 25.8631,
    lng: 85.7811,
    riskTier: 'High',
    riskScore: 0.78,
    addProbability: 0.79,
    choleraProbability: 0.73,
    typhoidProbability: 0.75,
    sviScore: 0.74,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.25,
      ndci: 0.29,
      cdom: 1.68,
      ndwi: 0.42,
      awei: -0.06,
      lstCelsius: 33.9
    },
    lags: {
      turbidityLag1: 3.98,
      turbidityLag2: 3.62,
      ndciLag1: 0.26,
      ndciLag2: 0.23,
      lstLag1: 33.4,
      lstLag2: 32.0
    },
    waterProximityKm: 1.3,
    outbreakRecords: 29,
    historicalCases: [
      { year: 2021, month: 7, cases: 92, risk: 0.76 },
      { year: 2022, month: 7, cases: 104, risk: 0.80 }
    ]
  },
  {
    id: 'nalanda_bihar',
    name: 'Nalanda',
    state: 'Bihar',
    lat: 25.1982,
    lng: 85.5149,
    riskTier: 'High',
    riskScore: 0.74,
    addProbability: 0.75,
    choleraProbability: 0.69,
    typhoidProbability: 0.72,
    sviScore: 0.70,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.95,
      ndci: 0.27,
      cdom: 1.60,
      ndwi: 0.36,
      awei: -0.09,
      lstCelsius: 35.2
    },
    lags: {
      turbidityLag1: 3.72,
      turbidityLag2: 3.40,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 34.8,
      lstLag2: 33.2
    },
    waterProximityKm: 2.2,
    outbreakRecords: 26,
    historicalCases: [
      { year: 2021, month: 6, cases: 74, risk: 0.71 },
      { year: 2022, month: 6, cases: 86, risk: 0.76 }
    ]
  },
  {
    id: 'saran_bihar',
    name: 'Saran',
    state: 'Bihar',
    lat: 25.7796,
    lng: 84.7499,
    riskTier: 'High',
    riskScore: 0.79,
    addProbability: 0.80,
    choleraProbability: 0.75,
    typhoidProbability: 0.76,
    sviScore: 0.73,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.32,
      ndci: 0.30,
      cdom: 1.70,
      ndwi: 0.44,
      awei: -0.05,
      lstCelsius: 34.3
    },
    lags: {
      turbidityLag1: 4.05,
      turbidityLag2: 3.70,
      ndciLag1: 0.27,
      ndciLag2: 0.24,
      lstLag1: 33.9,
      lstLag2: 32.4
    },
    waterProximityKm: 0.9,
    outbreakRecords: 31,
    historicalCases: [
      { year: 2021, month: 7, cases: 95, risk: 0.77 },
      { year: 2022, month: 7, cases: 109, risk: 0.81 }
    ]
  },
  {
    id: 'katihar_bihar',
    name: 'Katihar',
    state: 'Bihar',
    lat: 25.5414,
    lng: 87.5707,
    riskTier: 'Very High',
    riskScore: 0.82,
    addProbability: 0.83,
    choleraProbability: 0.78,
    typhoidProbability: 0.77,
    sviScore: 0.78,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.50,
      ndci: 0.32,
      cdom: 1.75,
      ndwi: 0.47,
      awei: -0.03,
      lstCelsius: 33.4
    },
    lags: {
      turbidityLag1: 4.20,
      turbidityLag2: 3.82,
      ndciLag1: 0.29,
      ndciLag2: 0.25,
      lstLag1: 32.9,
      lstLag2: 31.4
    },
    waterProximityKm: 0.6,
    outbreakRecords: 34,
    historicalCases: [
      { year: 2021, month: 7, cases: 106, risk: 0.80 },
      { year: 2022, month: 7, cases: 121, risk: 0.84 }
    ]
  },

  // =========================================================================
  // 3. UTTAR PRADESH (12 Districts - Ganges & Yamuna Basin)
  // =========================================================================
  {
    id: 'varanasi_up',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    riskTier: 'Very High',
    riskScore: 0.85,
    addProbability: 0.86,
    choleraProbability: 0.80,
    typhoidProbability: 0.78,
    sviScore: 0.72,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.62,
      ndci: 0.32,
      cdom: 1.78,
      ndwi: 0.41,
      awei: -0.09,
      lstCelsius: 35.1
    },
    lags: {
      turbidityLag1: 4.35,
      turbidityLag2: 3.98,
      ndciLag1: 0.29,
      ndciLag2: 0.26,
      lstLag1: 34.6,
      lstLag2: 33.2
    },
    waterProximityKm: 0.5,
    outbreakRecords: 36,
    historicalCases: [
      { year: 2021, month: 6, cases: 98, risk: 0.79 },
      { year: 2021, month: 7, cases: 142, risk: 0.88 },
      { year: 2022, month: 6, cases: 110, risk: 0.83 },
      { year: 2022, month: 7, cases: 156, risk: 0.90 }
    ]
  },
  {
    id: 'prayagraj_up',
    name: 'Prayagraj',
    state: 'Uttar Pradesh',
    lat: 25.4358,
    lng: 81.8463,
    riskTier: 'Very High',
    riskScore: 0.83,
    addProbability: 0.84,
    choleraProbability: 0.78,
    typhoidProbability: 0.77,
    sviScore: 0.71,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.48,
      ndci: 0.31,
      cdom: 1.72,
      ndwi: 0.43,
      awei: -0.07,
      lstCelsius: 35.8
    },
    lags: {
      turbidityLag1: 4.20,
      turbidityLag2: 3.85,
      ndciLag1: 0.28,
      ndciLag2: 0.25,
      lstLag1: 35.2,
      lstLag2: 33.8
    },
    waterProximityKm: 0.4,
    outbreakRecords: 34,
    historicalCases: [
      { year: 2021, month: 6, cases: 92, risk: 0.77 },
      { year: 2022, month: 6, cases: 104, risk: 0.82 }
    ]
  },
  {
    id: 'lucknow_up',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    lat: 26.8467,
    lng: 80.9462,
    riskTier: 'High',
    riskScore: 0.72,
    addProbability: 0.73,
    choleraProbability: 0.68,
    typhoidProbability: 0.71,
    sviScore: 0.58,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.90,
      ndci: 0.27,
      cdom: 1.58,
      ndwi: 0.35,
      awei: -0.11,
      lstCelsius: 34.8
    },
    lags: {
      turbidityLag1: 3.68,
      turbidityLag2: 3.35,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 34.2,
      lstLag2: 32.8
    },
    waterProximityKm: 1.4,
    outbreakRecords: 25,
    historicalCases: [
      { year: 2021, month: 6, cases: 62, risk: 0.68 },
      { year: 2022, month: 6, cases: 73, risk: 0.74 }
    ]
  },
  {
    id: 'kanpur_nagar_up',
    name: 'Kanpur Nagar',
    state: 'Uttar Pradesh',
    lat: 26.4499,
    lng: 80.3319,
    riskTier: 'Very High',
    riskScore: 0.84,
    addProbability: 0.85,
    choleraProbability: 0.79,
    typhoidProbability: 0.80,
    sviScore: 0.69,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.58,
      ndci: 0.33,
      cdom: 1.76,
      ndwi: 0.39,
      awei: -0.08,
      lstCelsius: 36.2
    },
    lags: {
      turbidityLag1: 4.28,
      turbidityLag2: 3.92,
      ndciLag1: 0.30,
      ndciLag2: 0.26,
      lstLag1: 35.6,
      lstLag2: 34.1
    },
    waterProximityKm: 0.8,
    outbreakRecords: 38,
    historicalCases: [
      { year: 2021, month: 7, cases: 115, risk: 0.82 },
      { year: 2022, month: 7, cases: 128, risk: 0.86 }
    ]
  },
  {
    id: 'gorakhpur_up',
    name: 'Gorakhpur',
    state: 'Uttar Pradesh',
    lat: 26.7606,
    lng: 83.3732,
    riskTier: 'Very High',
    riskScore: 0.86,
    addProbability: 0.87,
    choleraProbability: 0.81,
    typhoidProbability: 0.82,
    sviScore: 0.76,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.72,
      ndci: 0.34,
      cdom: 1.82,
      ndwi: 0.44,
      awei: -0.05,
      lstCelsius: 34.4
    },
    lags: {
      turbidityLag1: 4.40,
      turbidityLag2: 4.05,
      ndciLag1: 0.31,
      ndciLag2: 0.27,
      lstLag1: 33.9,
      lstLag2: 32.4
    },
    waterProximityKm: 0.7,
    outbreakRecords: 40,
    historicalCases: [
      { year: 2021, month: 7, cases: 129, risk: 0.84 },
      { year: 2022, month: 7, cases: 145, risk: 0.88 }
    ]
  },
  {
    id: 'agra_up',
    name: 'Agra',
    state: 'Uttar Pradesh',
    lat: 27.1767,
    lng: 78.0081,
    riskTier: 'High',
    riskScore: 0.74,
    addProbability: 0.75,
    choleraProbability: 0.69,
    typhoidProbability: 0.73,
    sviScore: 0.64,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.02,
      ndci: 0.28,
      cdom: 1.62,
      ndwi: 0.34,
      awei: -0.12,
      lstCelsius: 37.8
    },
    lags: {
      turbidityLag1: 3.78,
      turbidityLag2: 3.42,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 37.1,
      lstLag2: 35.4
    },
    waterProximityKm: 1.1,
    outbreakRecords: 27,
    historicalCases: [
      { year: 2021, month: 6, cases: 68, risk: 0.71 },
      { year: 2022, month: 6, cases: 79, risk: 0.76 }
    ]
  },
  {
    id: 'meerut_up',
    name: 'Meerut',
    state: 'Uttar Pradesh',
    lat: 28.9845,
    lng: 77.7064,
    riskTier: 'Moderate',
    riskScore: 0.64,
    addProbability: 0.65,
    choleraProbability: 0.60,
    typhoidProbability: 0.63,
    sviScore: 0.57,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.65,
      ndci: 0.25,
      cdom: 1.50,
      ndwi: 0.33,
      awei: -0.13,
      lstCelsius: 35.5
    },
    lags: {
      turbidityLag1: 3.42,
      turbidityLag2: 3.12,
      ndciLag1: 0.23,
      ndciLag2: 0.20,
      lstLag1: 35.0,
      lstLag2: 33.5
    },
    waterProximityKm: 3.1,
    outbreakRecords: 19,
    historicalCases: [
      { year: 2021, month: 6, cases: 48, risk: 0.61 },
      { year: 2022, month: 6, cases: 56, risk: 0.66 }
    ]
  },
  {
    id: 'ayodhya_up',
    name: 'Ayodhya',
    state: 'Uttar Pradesh',
    lat: 26.7922,
    lng: 82.1998,
    riskTier: 'High',
    riskScore: 0.77,
    addProbability: 0.78,
    choleraProbability: 0.72,
    typhoidProbability: 0.74,
    sviScore: 0.70,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.18,
      ndci: 0.29,
      cdom: 1.66,
      ndwi: 0.40,
      awei: -0.08,
      lstCelsius: 34.6
    },
    lags: {
      turbidityLag1: 3.92,
      turbidityLag2: 3.58,
      ndciLag1: 0.26,
      ndciLag2: 0.23,
      lstLag1: 34.1,
      lstLag2: 32.7
    },
    waterProximityKm: 0.8,
    outbreakRecords: 28,
    historicalCases: [
      { year: 2021, month: 6, cases: 72, risk: 0.73 },
      { year: 2022, month: 6, cases: 84, risk: 0.78 }
    ]
  },
  {
    id: 'mirzapur_up',
    name: 'Mirzapur',
    state: 'Uttar Pradesh',
    lat: 25.1337,
    lng: 82.5644,
    riskTier: 'High',
    riskScore: 0.76,
    addProbability: 0.77,
    choleraProbability: 0.71,
    typhoidProbability: 0.73,
    sviScore: 0.73,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.12,
      ndci: 0.28,
      cdom: 1.64,
      ndwi: 0.38,
      awei: -0.09,
      lstCelsius: 36.1
    },
    lags: {
      turbidityLag1: 3.88,
      turbidityLag2: 3.52,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 35.5,
      lstLag2: 34.0
    },
    waterProximityKm: 0.6,
    outbreakRecords: 27,
    historicalCases: [
      { year: 2021, month: 6, cases: 69, risk: 0.72 },
      { year: 2022, month: 6, cases: 80, risk: 0.77 }
    ]
  },
  {
    id: 'ghazipur_up',
    name: 'Ghazipur',
    state: 'Uttar Pradesh',
    lat: 25.5840,
    lng: 83.5770,
    riskTier: 'Very High',
    riskScore: 0.82,
    addProbability: 0.83,
    choleraProbability: 0.77,
    typhoidProbability: 0.78,
    sviScore: 0.74,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.45,
      ndci: 0.31,
      cdom: 1.74,
      ndwi: 0.42,
      awei: -0.07,
      lstCelsius: 34.9
    },
    lags: {
      turbidityLag1: 4.18,
      turbidityLag2: 3.82,
      ndciLag1: 0.28,
      ndciLag2: 0.25,
      lstLag1: 34.4,
      lstLag2: 33.0
    },
    waterProximityKm: 0.7,
    outbreakRecords: 32,
    historicalCases: [
      { year: 2021, month: 7, cases: 99, risk: 0.79 },
      { year: 2022, month: 7, cases: 114, risk: 0.83 }
    ]
  },
  {
    id: 'ballia_up',
    name: 'Ballia',
    state: 'Uttar Pradesh',
    lat: 25.7597,
    lng: 84.1497,
    riskTier: 'Very High',
    riskScore: 0.84,
    addProbability: 0.85,
    choleraProbability: 0.79,
    typhoidProbability: 0.80,
    sviScore: 0.75,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.60,
      ndci: 0.33,
      cdom: 1.78,
      ndwi: 0.44,
      awei: -0.05,
      lstCelsius: 34.5
    },
    lags: {
      turbidityLag1: 4.32,
      turbidityLag2: 3.95,
      ndciLag1: 0.30,
      ndciLag2: 0.26,
      lstLag1: 34.0,
      lstLag2: 32.6
    },
    waterProximityKm: 0.5,
    outbreakRecords: 36,
    historicalCases: [
      { year: 2021, month: 7, cases: 112, risk: 0.82 },
      { year: 2022, month: 7, cases: 126, risk: 0.86 }
    ]
  },
  {
    id: 'mathura_up',
    name: 'Mathura',
    state: 'Uttar Pradesh',
    lat: 27.4924,
    lng: 77.6737,
    riskTier: 'High',
    riskScore: 0.71,
    addProbability: 0.72,
    choleraProbability: 0.67,
    typhoidProbability: 0.70,
    sviScore: 0.62,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.85,
      ndci: 0.27,
      cdom: 1.56,
      ndwi: 0.36,
      awei: -0.11,
      lstCelsius: 37.2
    },
    lags: {
      turbidityLag1: 3.62,
      turbidityLag2: 3.30,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 36.6,
      lstLag2: 35.0
    },
    waterProximityKm: 0.9,
    outbreakRecords: 24,
    historicalCases: [
      { year: 2021, month: 6, cases: 59, risk: 0.68 },
      { year: 2022, month: 6, cases: 70, risk: 0.73 }
    ]
  },

  // =========================================================================
  // 4. WEST BENGAL (10 Districts - Hooghly & Ganges Delta)
  // =========================================================================
  {
    id: 'kolkata_wb',
    name: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    riskTier: 'High',
    riskScore: 0.78,
    addProbability: 0.76,
    choleraProbability: 0.82,
    typhoidProbability: 0.68,
    sviScore: 0.48,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.12,
      ndci: 0.30,
      cdom: 1.68,
      ndwi: 0.44,
      awei: -0.05,
      lstCelsius: 33.8
    },
    lags: {
      turbidityLag1: 3.90,
      turbidityLag2: 3.55,
      ndciLag1: 0.27,
      ndciLag2: 0.24,
      lstLag1: 33.2,
      lstLag2: 32.0
    },
    waterProximityKm: 0.8,
    outbreakRecords: 38,
    historicalCases: [
      { year: 2021, month: 7, cases: 142, risk: 0.80 },
      { year: 2021, month: 8, cases: 118, risk: 0.74 },
      { year: 2022, month: 7, cases: 156, risk: 0.84 }
    ]
  },
  {
    id: 'howrah_wb',
    name: 'Howrah',
    state: 'West Bengal',
    lat: 22.5958,
    lng: 88.2636,
    riskTier: 'High',
    riskScore: 0.79,
    addProbability: 0.78,
    choleraProbability: 0.83,
    typhoidProbability: 0.70,
    sviScore: 0.52,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.25,
      ndci: 0.31,
      cdom: 1.72,
      ndwi: 0.46,
      awei: -0.04,
      lstCelsius: 33.9
    },
    lags: {
      turbidityLag1: 4.02,
      turbidityLag2: 3.68,
      ndciLag1: 0.28,
      ndciLag2: 0.25,
      lstLag1: 33.4,
      lstLag2: 32.1
    },
    waterProximityKm: 0.5,
    outbreakRecords: 34,
    historicalCases: [
      { year: 2021, month: 7, cases: 126, risk: 0.78 },
      { year: 2022, month: 7, cases: 140, risk: 0.82 }
    ]
  },
  {
    id: 'north_24_parganas_wb',
    name: 'North 24 Parganas',
    state: 'West Bengal',
    lat: 22.7210,
    lng: 88.4810,
    riskTier: 'Very High',
    riskScore: 0.83,
    addProbability: 0.84,
    choleraProbability: 0.86,
    typhoidProbability: 0.74,
    sviScore: 0.62,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.52,
      ndci: 0.34,
      cdom: 1.80,
      ndwi: 0.49,
      awei: 0.02,
      lstCelsius: 33.5
    },
    lags: {
      turbidityLag1: 4.25,
      turbidityLag2: 3.88,
      ndciLag1: 0.31,
      ndciLag2: 0.27,
      lstLag1: 33.0,
      lstLag2: 31.8
    },
    waterProximityKm: 0.7,
    outbreakRecords: 44,
    historicalCases: [
      { year: 2021, month: 7, cases: 160, risk: 0.83 },
      { year: 2022, month: 7, cases: 178, risk: 0.87 }
    ]
  },
  {
    id: 'south_24_parganas_wb',
    name: 'South 24 Parganas',
    state: 'West Bengal',
    lat: 22.1352,
    lng: 88.5432,
    riskTier: 'Very High',
    riskScore: 0.86,
    addProbability: 0.87,
    choleraProbability: 0.89,
    typhoidProbability: 0.76,
    sviScore: 0.71,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.75,
      ndci: 0.36,
      cdom: 1.88,
      ndwi: 0.58,
      awei: 0.12,
      lstCelsius: 32.9
    },
    lags: {
      turbidityLag1: 4.45,
      turbidityLag2: 4.08,
      ndciLag1: 0.33,
      ndciLag2: 0.29,
      lstLag1: 32.5,
      lstLag2: 31.2
    },
    waterProximityKm: 0.3,
    outbreakRecords: 48,
    historicalCases: [
      { year: 2021, month: 7, cases: 178, risk: 0.86 },
      { year: 2022, month: 7, cases: 196, risk: 0.90 }
    ]
  },
  {
    id: 'murshidabad_wb',
    name: 'Murshidabad',
    state: 'West Bengal',
    lat: 24.1759,
    lng: 88.2802,
    riskTier: 'Very High',
    riskScore: 0.84,
    addProbability: 0.85,
    choleraProbability: 0.82,
    typhoidProbability: 0.77,
    sviScore: 0.76,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.58,
      ndci: 0.33,
      cdom: 1.78,
      ndwi: 0.46,
      awei: -0.03,
      lstCelsius: 34.2
    },
    lags: {
      turbidityLag1: 4.30,
      turbidityLag2: 3.92,
      ndciLag1: 0.30,
      ndciLag2: 0.26,
      lstLag1: 33.7,
      lstLag2: 32.3
    },
    waterProximityKm: 0.6,
    outbreakRecords: 41,
    historicalCases: [
      { year: 2021, month: 7, cases: 145, risk: 0.83 },
      { year: 2022, month: 7, cases: 162, risk: 0.87 }
    ]
  },
  {
    id: 'nadia_wb',
    name: 'Nadia',
    state: 'West Bengal',
    lat: 23.4710,
    lng: 88.5565,
    riskTier: 'High',
    riskScore: 0.78,
    addProbability: 0.79,
    choleraProbability: 0.76,
    typhoidProbability: 0.72,
    sviScore: 0.64,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.18,
      ndci: 0.29,
      cdom: 1.66,
      ndwi: 0.44,
      awei: -0.05,
      lstCelsius: 34.0
    },
    lags: {
      turbidityLag1: 3.92,
      turbidityLag2: 3.58,
      ndciLag1: 0.26,
      ndciLag2: 0.23,
      lstLag1: 33.5,
      lstLag2: 32.1
    },
    waterProximityKm: 0.8,
    outbreakRecords: 31,
    historicalCases: [
      { year: 2021, month: 7, cases: 104, risk: 0.76 },
      { year: 2022, month: 7, cases: 118, risk: 0.81 }
    ]
  },
  {
    id: 'malda_wb',
    name: 'Malda',
    state: 'West Bengal',
    lat: 25.0108,
    lng: 88.1411,
    riskTier: 'Very High',
    riskScore: 0.81,
    addProbability: 0.82,
    choleraProbability: 0.79,
    typhoidProbability: 0.75,
    sviScore: 0.74,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.42,
      ndci: 0.31,
      cdom: 1.74,
      ndwi: 0.45,
      awei: -0.04,
      lstCelsius: 34.3
    },
    lags: {
      turbidityLag1: 4.15,
      turbidityLag2: 3.80,
      ndciLag1: 0.28,
      ndciLag2: 0.25,
      lstLag1: 33.8,
      lstLag2: 32.4
    },
    waterProximityKm: 0.9,
    outbreakRecords: 35,
    historicalCases: [
      { year: 2021, month: 7, cases: 118, risk: 0.80 },
      { year: 2022, month: 7, cases: 133, risk: 0.84 }
    ]
  },
  {
    id: 'hooghly_wb',
    name: 'Hooghly',
    state: 'West Bengal',
    lat: 22.9038,
    lng: 88.3968,
    riskTier: 'High',
    riskScore: 0.75,
    addProbability: 0.76,
    choleraProbability: 0.74,
    typhoidProbability: 0.69,
    sviScore: 0.55,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.05,
      ndci: 0.28,
      cdom: 1.62,
      ndwi: 0.43,
      awei: -0.06,
      lstCelsius: 34.1
    },
    lags: {
      turbidityLag1: 3.82,
      turbidityLag2: 3.48,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 33.6,
      lstLag2: 32.2
    },
    waterProximityKm: 0.7,
    outbreakRecords: 28,
    historicalCases: [
      { year: 2021, month: 7, cases: 94, risk: 0.74 },
      { year: 2022, month: 7, cases: 106, risk: 0.78 }
    ]
  },
  {
    id: 'paschim_medinipur_wb',
    name: 'Paschim Medinipur',
    state: 'West Bengal',
    lat: 22.4257,
    lng: 87.3199,
    riskTier: 'High',
    riskScore: 0.73,
    addProbability: 0.74,
    choleraProbability: 0.70,
    typhoidProbability: 0.68,
    sviScore: 0.68,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.92,
      ndci: 0.27,
      cdom: 1.58,
      ndwi: 0.39,
      awei: -0.08,
      lstCelsius: 35.2
    },
    lags: {
      turbidityLag1: 3.70,
      turbidityLag2: 3.35,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 34.8,
      lstLag2: 33.2
    },
    waterProximityKm: 1.6,
    outbreakRecords: 26,
    historicalCases: [
      { year: 2021, month: 7, cases: 82, risk: 0.71 },
      { year: 2022, month: 7, cases: 94, risk: 0.76 }
    ]
  },
  {
    id: 'jalpaiguri_wb',
    name: 'Jalpaiguri',
    state: 'West Bengal',
    lat: 26.5414,
    lng: 88.7196,
    riskTier: 'High',
    riskScore: 0.76,
    addProbability: 0.77,
    choleraProbability: 0.72,
    typhoidProbability: 0.70,
    sviScore: 0.69,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.15,
      ndci: 0.28,
      cdom: 1.64,
      ndwi: 0.51,
      awei: 0.05,
      lstCelsius: 30.8
    },
    lags: {
      turbidityLag1: 3.88,
      turbidityLag2: 3.52,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 30.2,
      lstLag2: 29.0
    },
    waterProximityKm: 0.8,
    outbreakRecords: 27,
    historicalCases: [
      { year: 2021, month: 7, cases: 88, risk: 0.74 },
      { year: 2022, month: 7, cases: 101, risk: 0.78 }
    ]
  },

  // =========================================================================
  // 5. TELANGANA (8 Districts - Godavari & Krishna Basin)
  // =========================================================================
  {
    id: 'khammam_telangana',
    name: 'Khammam',
    state: 'Telangana',
    lat: 17.2473,
    lng: 80.1514,
    riskTier: 'High',
    riskScore: 0.79,
    addProbability: 0.74,
    choleraProbability: 0.62,
    typhoidProbability: 0.85,
    typhoidCases2019: 342,
    sviScore: 0.65,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.95,
      ndci: 0.28,
      cdom: 1.62,
      ndwi: 0.38,
      awei: -0.12,
      lstCelsius: 36.8
    },
    lags: {
      turbidityLag1: 3.80,
      turbidityLag2: 3.42,
      ndciLag1: 0.25,
      ndciLag2: 0.21,
      lstLag1: 35.5,
      lstLag2: 34.1
    },
    waterProximityKm: 3.4,
    outbreakRecords: 28,
    historicalCases: [
      { year: 2019, month: 5, cases: 85, risk: 0.71 },
      { year: 2019, month: 6, cases: 112, risk: 0.78 },
      { year: 2019, month: 7, cases: 145, risk: 0.85 },
      { year: 2019, month: 8, cases: 120, risk: 0.81 }
    ]
  },
  {
    id: 'nizamabad_telangana',
    name: 'Nizamabad',
    state: 'Telangana',
    lat: 18.6725,
    lng: 78.0941,
    riskTier: 'High',
    riskScore: 0.76,
    addProbability: 0.71,
    choleraProbability: 0.58,
    typhoidProbability: 0.81,
    typhoidCases2019: 298,
    sviScore: 0.61,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.78,
      ndci: 0.26,
      cdom: 1.54,
      ndwi: 0.35,
      awei: -0.15,
      lstCelsius: 35.4
    },
    lags: {
      turbidityLag1: 3.60,
      turbidityLag2: 3.25,
      ndciLag1: 0.23,
      ndciLag2: 0.20,
      lstLag1: 34.8,
      lstLag2: 33.2
    },
    waterProximityKm: 4.1,
    outbreakRecords: 22,
    historicalCases: [
      { year: 2019, month: 6, cases: 94, risk: 0.72 },
      { year: 2019, month: 7, cases: 128, risk: 0.81 },
      { year: 2019, month: 8, cases: 105, risk: 0.76 }
    ]
  },
  {
    id: 'medak_telangana',
    name: 'Medak',
    state: 'Telangana',
    lat: 18.0478,
    lng: 78.2618,
    riskTier: 'Moderate',
    riskScore: 0.62,
    addProbability: 0.63,
    choleraProbability: 0.51,
    typhoidProbability: 0.73,
    typhoidCases2019: 184,
    sviScore: 0.58,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.35,
      ndci: 0.22,
      cdom: 1.41,
      ndwi: 0.31,
      awei: -0.18,
      lstCelsius: 36.1
    },
    lags: {
      turbidityLag1: 3.15,
      turbidityLag2: 2.90,
      ndciLag1: 0.20,
      ndciLag2: 0.17,
      lstLag1: 35.2,
      lstLag2: 33.8
    },
    waterProximityKm: 6.2,
    outbreakRecords: 16,
    historicalCases: [
      { year: 2019, month: 6, cases: 58, risk: 0.62 },
      { year: 2019, month: 7, cases: 79, risk: 0.71 }
    ]
  },
  {
    id: 'adilabad_telangana',
    name: 'Adilabad',
    state: 'Telangana',
    lat: 19.6641,
    lng: 78.5320,
    riskTier: 'High',
    riskScore: 0.74,
    addProbability: 0.75,
    choleraProbability: 0.69,
    typhoidProbability: 0.67,
    sviScore: 0.72,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.10,
      ndci: 0.29,
      cdom: 1.64,
      ndwi: 0.39,
      awei: -0.10,
      lstCelsius: 37.5
    },
    lags: {
      turbidityLag1: 3.85,
      turbidityLag2: 3.50,
      ndciLag1: 0.26,
      ndciLag2: 0.22,
      lstLag1: 36.8,
      lstLag2: 35.2
    },
    waterProximityKm: 2.1,
    outbreakRecords: 25,
    historicalCases: [
      { year: 2019, month: 6, cases: 72, risk: 0.70 },
      { year: 2019, month: 7, cases: 95, risk: 0.76 }
    ]
  },
  {
    id: 'hyderabad_telangana',
    name: 'Hyderabad',
    state: 'Telangana',
    lat: 17.3850,
    lng: 78.4867,
    riskTier: 'Moderate',
    riskScore: 0.58,
    addProbability: 0.57,
    choleraProbability: 0.52,
    typhoidProbability: 0.64,
    sviScore: 0.45,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.45,
      ndci: 0.25,
      cdom: 1.48,
      ndwi: 0.30,
      awei: -0.14,
      lstCelsius: 35.8
    },
    lags: {
      turbidityLag1: 3.25,
      turbidityLag2: 2.98,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 35.2,
      lstLag2: 33.6
    },
    waterProximityKm: 2.5,
    outbreakRecords: 21,
    historicalCases: [
      { year: 2021, month: 6, cases: 64, risk: 0.56 },
      { year: 2022, month: 6, cases: 73, risk: 0.60 }
    ]
  },
  {
    id: 'warangal_telangana',
    name: 'Warangal',
    state: 'Telangana',
    lat: 17.9689,
    lng: 79.5941,
    riskTier: 'High',
    riskScore: 0.71,
    addProbability: 0.72,
    choleraProbability: 0.65,
    typhoidProbability: 0.75,
    sviScore: 0.60,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.82,
      ndci: 0.27,
      cdom: 1.56,
      ndwi: 0.36,
      awei: -0.12,
      lstCelsius: 36.5
    },
    lags: {
      turbidityLag1: 3.60,
      turbidityLag2: 3.28,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 36.0,
      lstLag2: 34.5
    },
    waterProximityKm: 3.8,
    outbreakRecords: 24,
    historicalCases: [
      { year: 2021, month: 6, cases: 68, risk: 0.69 },
      { year: 2022, month: 6, cases: 79, risk: 0.73 }
    ]
  },
  {
    id: 'karimnagar_telangana',
    name: 'Karimnagar',
    state: 'Telangana',
    lat: 18.4386,
    lng: 79.1288,
    riskTier: 'High',
    riskScore: 0.73,
    addProbability: 0.74,
    choleraProbability: 0.67,
    typhoidProbability: 0.76,
    sviScore: 0.62,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.90,
      ndci: 0.28,
      cdom: 1.60,
      ndwi: 0.38,
      awei: -0.10,
      lstCelsius: 37.2
    },
    lags: {
      turbidityLag1: 3.68,
      turbidityLag2: 3.34,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 36.6,
      lstLag2: 35.1
    },
    waterProximityKm: 2.8,
    outbreakRecords: 26,
    historicalCases: [
      { year: 2021, month: 6, cases: 71, risk: 0.71 },
      { year: 2022, month: 6, cases: 82, risk: 0.75 }
    ]
  },
  {
    id: 'nalgonda_telangana',
    name: 'Nalgonda',
    state: 'Telangana',
    lat: 17.0577,
    lng: 79.2684,
    riskTier: 'High',
    riskScore: 0.72,
    addProbability: 0.73,
    choleraProbability: 0.66,
    typhoidProbability: 0.74,
    sviScore: 0.64,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.86,
      ndci: 0.27,
      cdom: 1.58,
      ndwi: 0.35,
      awei: -0.12,
      lstCelsius: 37.0
    },
    lags: {
      turbidityLag1: 3.62,
      turbidityLag2: 3.30,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 36.4,
      lstLag2: 34.8
    },
    waterProximityKm: 3.5,
    outbreakRecords: 23,
    historicalCases: [
      { year: 2021, month: 6, cases: 65, risk: 0.70 },
      { year: 2022, month: 6, cases: 76, risk: 0.74 }
    ]
  },

  // =========================================================================
  // 6. MAHARASHTRA (8 Districts - Godavari, Krishna & Konkan Coast)
  // =========================================================================
  {
    id: 'mumbai_suburban_maharashtra',
    name: 'Mumbai Suburban',
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    riskTier: 'Moderate',
    riskScore: 0.58,
    addProbability: 0.54,
    choleraProbability: 0.63,
    typhoidProbability: 0.55,
    sviScore: 0.42,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.25,
      ndci: 0.21,
      cdom: 1.34,
      ndwi: 0.56,
      awei: 0.12,
      lstCelsius: 31.2
    },
    lags: {
      turbidityLag1: 3.10,
      turbidityLag2: 2.85,
      ndciLag1: 0.19,
      ndciLag2: 0.16,
      lstLag1: 30.8,
      lstLag2: 29.5
    },
    waterProximityKm: 0.4,
    outbreakRecords: 31,
    historicalCases: [
      { year: 2021, month: 7, cases: 88, risk: 0.61 },
      { year: 2021, month: 8, cases: 76, risk: 0.56 },
      { year: 2022, month: 7, cases: 94, risk: 0.64 }
    ]
  },
  {
    id: 'mumbai_city_maharashtra',
    name: 'Mumbai City',
    state: 'Maharashtra',
    lat: 18.9388,
    lng: 72.8354,
    riskTier: 'Moderate',
    riskScore: 0.56,
    addProbability: 0.52,
    choleraProbability: 0.61,
    typhoidProbability: 0.53,
    sviScore: 0.39,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.18,
      ndci: 0.20,
      cdom: 1.30,
      ndwi: 0.58,
      awei: 0.14,
      lstCelsius: 31.0
    },
    lags: {
      turbidityLag1: 3.02,
      turbidityLag2: 2.78,
      ndciLag1: 0.18,
      ndciLag2: 0.15,
      lstLag1: 30.5,
      lstLag2: 29.2
    },
    waterProximityKm: 0.2,
    outbreakRecords: 28,
    historicalCases: [
      { year: 2021, month: 7, cases: 78, risk: 0.58 },
      { year: 2022, month: 7, cases: 84, risk: 0.62 }
    ]
  },
  {
    id: 'pune_maharashtra',
    name: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    riskTier: 'Low',
    riskScore: 0.38,
    addProbability: 0.35,
    choleraProbability: 0.32,
    typhoidProbability: 0.41,
    sviScore: 0.35,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 2.65,
      ndci: 0.18,
      cdom: 1.12,
      ndwi: 0.34,
      awei: -0.15,
      lstCelsius: 32.1
    },
    lags: {
      turbidityLag1: 2.50,
      turbidityLag2: 2.30,
      ndciLag1: 0.16,
      ndciLag2: 0.14,
      lstLag1: 31.5,
      lstLag2: 30.2
    },
    waterProximityKm: 1.8,
    outbreakRecords: 12,
    historicalCases: [
      { year: 2021, month: 6, cases: 32, risk: 0.36 },
      { year: 2022, month: 6, cases: 38, risk: 0.40 }
    ]
  },
  {
    id: 'thane_maharashtra',
    name: 'Thane',
    state: 'Maharashtra',
    lat: 19.2183,
    lng: 72.9781,
    riskTier: 'Moderate',
    riskScore: 0.61,
    addProbability: 0.60,
    choleraProbability: 0.64,
    typhoidProbability: 0.57,
    sviScore: 0.46,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.48,
      ndci: 0.23,
      cdom: 1.42,
      ndwi: 0.50,
      awei: 0.08,
      lstCelsius: 31.8
    },
    lags: {
      turbidityLag1: 3.28,
      turbidityLag2: 2.98,
      ndciLag1: 0.21,
      ndciLag2: 0.18,
      lstLag1: 31.4,
      lstLag2: 30.1
    },
    waterProximityKm: 0.6,
    outbreakRecords: 24,
    historicalCases: [
      { year: 2021, month: 7, cases: 68, risk: 0.62 },
      { year: 2022, month: 7, cases: 77, risk: 0.66 }
    ]
  },
  {
    id: 'nagpur_maharashtra',
    name: 'Nagpur',
    state: 'Maharashtra',
    lat: 21.1458,
    lng: 79.0882,
    riskTier: 'High',
    riskScore: 0.72,
    addProbability: 0.73,
    choleraProbability: 0.68,
    typhoidProbability: 0.69,
    sviScore: 0.59,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.88,
      ndci: 0.27,
      cdom: 1.58,
      ndwi: 0.35,
      awei: -0.11,
      lstCelsius: 38.4
    },
    lags: {
      turbidityLag1: 3.65,
      turbidityLag2: 3.32,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 37.8,
      lstLag2: 36.0
    },
    waterProximityKm: 3.2,
    outbreakRecords: 26,
    historicalCases: [
      { year: 2021, month: 6, cases: 69, risk: 0.70 },
      { year: 2022, month: 6, cases: 81, risk: 0.75 }
    ]
  },
  {
    id: 'nashik_maharashtra',
    name: 'Nashik',
    state: 'Maharashtra',
    lat: 19.9975,
    lng: 73.7898,
    riskTier: 'Moderate',
    riskScore: 0.59,
    addProbability: 0.60,
    choleraProbability: 0.56,
    typhoidProbability: 0.58,
    sviScore: 0.52,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.42,
      ndci: 0.23,
      cdom: 1.44,
      ndwi: 0.38,
      awei: -0.09,
      lstCelsius: 32.6
    },
    lags: {
      turbidityLag1: 3.22,
      turbidityLag2: 2.95,
      ndciLag1: 0.21,
      ndciLag2: 0.18,
      lstLag1: 32.1,
      lstLag2: 30.8
    },
    waterProximityKm: 1.2,
    outbreakRecords: 18,
    historicalCases: [
      { year: 2021, month: 6, cases: 46, risk: 0.57 },
      { year: 2022, month: 6, cases: 54, risk: 0.61 }
    ]
  },
  {
    id: 'kolhapur_maharashtra',
    name: 'Kolhapur',
    state: 'Maharashtra',
    lat: 16.7050,
    lng: 74.2433,
    riskTier: 'High',
    riskScore: 0.69,
    addProbability: 0.70,
    choleraProbability: 0.67,
    typhoidProbability: 0.63,
    sviScore: 0.50,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.95,
      ndci: 0.28,
      cdom: 1.62,
      ndwi: 0.44,
      awei: -0.02,
      lstCelsius: 31.9
    },
    lags: {
      turbidityLag1: 3.72,
      turbidityLag2: 3.38,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 31.5,
      lstLag2: 30.2
    },
    waterProximityKm: 1.0,
    outbreakRecords: 25,
    historicalCases: [
      { year: 2021, month: 7, cases: 66, risk: 0.68 },
      { year: 2022, month: 7, cases: 78, risk: 0.73 }
    ]
  },
  {
    id: 'solapur_maharashtra',
    name: 'Solapur',
    state: 'Maharashtra',
    lat: 17.6599,
    lng: 75.9064,
    riskTier: 'High',
    riskScore: 0.74,
    addProbability: 0.75,
    choleraProbability: 0.71,
    typhoidProbability: 0.69,
    sviScore: 0.63,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.08,
      ndci: 0.29,
      cdom: 1.66,
      ndwi: 0.35,
      awei: -0.10,
      lstCelsius: 37.6
    },
    lags: {
      turbidityLag1: 3.84,
      turbidityLag2: 3.50,
      ndciLag1: 0.26,
      ndciLag2: 0.23,
      lstLag1: 37.0,
      lstLag2: 35.2
    },
    waterProximityKm: 2.7,
    outbreakRecords: 28,
    historicalCases: [
      { year: 2021, month: 6, cases: 72, risk: 0.72 },
      { year: 2022, month: 6, cases: 85, risk: 0.77 }
    ]
  },

  // =========================================================================
  // 7. ASSAM (6 Districts - Brahmaputra Floodplain)
  // =========================================================================
  {
    id: 'kamrup_metropolitan_assam',
    name: 'Kamrup Metropolitan',
    state: 'Assam',
    lat: 26.1445,
    lng: 91.7362,
    riskTier: 'Very High',
    riskScore: 0.84,
    addProbability: 0.85,
    choleraProbability: 0.81,
    typhoidProbability: 0.76,
    sviScore: 0.62,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.65,
      ndci: 0.34,
      cdom: 1.82,
      ndwi: 0.54,
      awei: 0.08,
      lstCelsius: 32.4
    },
    lags: {
      turbidityLag1: 4.35,
      turbidityLag2: 3.98,
      ndciLag1: 0.31,
      ndciLag2: 0.27,
      lstLag1: 31.8,
      lstLag2: 30.5
    },
    waterProximityKm: 0.5,
    outbreakRecords: 38,
    historicalCases: [
      { year: 2021, month: 6, cases: 122, risk: 0.82 },
      { year: 2022, month: 6, cases: 139, risk: 0.87 }
    ]
  },
  {
    id: 'dibrugarh_assam',
    name: 'Dibrugarh',
    state: 'Assam',
    lat: 27.4728,
    lng: 94.9120,
    riskTier: 'Very High',
    riskScore: 0.85,
    addProbability: 0.86,
    choleraProbability: 0.82,
    typhoidProbability: 0.77,
    sviScore: 0.68,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.70,
      ndci: 0.35,
      cdom: 1.85,
      ndwi: 0.56,
      awei: 0.10,
      lstCelsius: 31.8
    },
    lags: {
      turbidityLag1: 4.40,
      turbidityLag2: 4.02,
      ndciLag1: 0.32,
      ndciLag2: 0.28,
      lstLag1: 31.2,
      lstLag2: 30.0
    },
    waterProximityKm: 0.4,
    outbreakRecords: 39,
    historicalCases: [
      { year: 2021, month: 6, cases: 128, risk: 0.83 },
      { year: 2022, month: 6, cases: 145, risk: 0.88 }
    ]
  },
  {
    id: 'cachar_assam',
    name: 'Cachar',
    state: 'Assam',
    lat: 24.8333,
    lng: 92.7789,
    riskTier: 'Very High',
    riskScore: 0.83,
    addProbability: 0.84,
    choleraProbability: 0.80,
    typhoidProbability: 0.75,
    sviScore: 0.71,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.55,
      ndci: 0.33,
      cdom: 1.78,
      ndwi: 0.52,
      awei: 0.06,
      lstCelsius: 32.1
    },
    lags: {
      turbidityLag1: 4.28,
      turbidityLag2: 3.90,
      ndciLag1: 0.30,
      ndciLag2: 0.26,
      lstLag1: 31.6,
      lstLag2: 30.2
    },
    waterProximityKm: 0.6,
    outbreakRecords: 35,
    historicalCases: [
      { year: 2021, month: 6, cases: 114, risk: 0.81 },
      { year: 2022, month: 6, cases: 130, risk: 0.86 }
    ]
  },
  {
    id: 'jorhat_assam',
    name: 'Jorhat',
    state: 'Assam',
    lat: 26.7509,
    lng: 94.2037,
    riskTier: 'High',
    riskScore: 0.78,
    addProbability: 0.79,
    choleraProbability: 0.74,
    typhoidProbability: 0.71,
    sviScore: 0.65,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.22,
      ndci: 0.29,
      cdom: 1.68,
      ndwi: 0.49,
      awei: 0.04,
      lstCelsius: 32.0
    },
    lags: {
      turbidityLag1: 3.96,
      turbidityLag2: 3.60,
      ndciLag1: 0.26,
      ndciLag2: 0.23,
      lstLag1: 31.5,
      lstLag2: 30.1
    },
    waterProximityKm: 0.9,
    outbreakRecords: 29,
    historicalCases: [
      { year: 2021, month: 6, cases: 90, risk: 0.76 },
      { year: 2022, month: 6, cases: 104, risk: 0.81 }
    ]
  },
  {
    id: 'nagaon_assam',
    name: 'Nagaon',
    state: 'Assam',
    lat: 26.3468,
    lng: 92.6840,
    riskTier: 'Very High',
    riskScore: 0.82,
    addProbability: 0.83,
    choleraProbability: 0.78,
    typhoidProbability: 0.74,
    sviScore: 0.72,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.48,
      ndci: 0.32,
      cdom: 1.76,
      ndwi: 0.51,
      awei: 0.05,
      lstCelsius: 32.3
    },
    lags: {
      turbidityLag1: 4.20,
      turbidityLag2: 3.84,
      ndciLag1: 0.29,
      ndciLag2: 0.25,
      lstLag1: 31.7,
      lstLag2: 30.4
    },
    waterProximityKm: 0.7,
    outbreakRecords: 34,
    historicalCases: [
      { year: 2021, month: 6, cases: 108, risk: 0.80 },
      { year: 2022, month: 6, cases: 124, risk: 0.85 }
    ]
  },
  {
    id: 'barpeta_assam',
    name: 'Barpeta',
    state: 'Assam',
    lat: 26.3211,
    lng: 91.0069,
    riskTier: 'Very High',
    riskScore: 0.86,
    addProbability: 0.87,
    choleraProbability: 0.83,
    typhoidProbability: 0.78,
    sviScore: 0.76,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.75,
      ndci: 0.35,
      cdom: 1.86,
      ndwi: 0.55,
      awei: 0.09,
      lstCelsius: 32.1
    },
    lags: {
      turbidityLag1: 4.45,
      turbidityLag2: 4.08,
      ndciLag1: 0.32,
      ndciLag2: 0.28,
      lstLag1: 31.5,
      lstLag2: 30.1
    },
    waterProximityKm: 0.5,
    outbreakRecords: 42,
    historicalCases: [
      { year: 2021, month: 6, cases: 135, risk: 0.84 },
      { year: 2022, month: 6, cases: 154, risk: 0.89 }
    ]
  },

  // =========================================================================
  // 8. ODISHA (6 Districts - Mahanadi Delta & Coastal Belt)
  // =========================================================================
  {
    id: 'cuttack_odisha',
    name: 'Cuttack',
    state: 'Odisha',
    lat: 20.4625,
    lng: 85.8828,
    riskTier: 'High',
    riskScore: 0.76,
    addProbability: 0.77,
    choleraProbability: 0.73,
    typhoidProbability: 0.70,
    sviScore: 0.63,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.15,
      ndci: 0.29,
      cdom: 1.66,
      ndwi: 0.48,
      awei: 0.02,
      lstCelsius: 34.8
    },
    lags: {
      turbidityLag1: 3.90,
      turbidityLag2: 3.55,
      ndciLag1: 0.26,
      ndciLag2: 0.23,
      lstLag1: 34.2,
      lstLag2: 32.8
    },
    waterProximityKm: 0.6,
    outbreakRecords: 30,
    historicalCases: [
      { year: 2021, month: 7, cases: 92, risk: 0.74 },
      { year: 2022, month: 7, cases: 106, risk: 0.79 }
    ]
  },
  {
    id: 'puri_odisha',
    name: 'Puri',
    state: 'Odisha',
    lat: 19.8135,
    lng: 85.8312,
    riskTier: 'High',
    riskScore: 0.77,
    addProbability: 0.78,
    choleraProbability: 0.76,
    typhoidProbability: 0.68,
    sviScore: 0.62,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.22,
      ndci: 0.30,
      cdom: 1.70,
      ndwi: 0.52,
      awei: 0.08,
      lstCelsius: 33.2
    },
    lags: {
      turbidityLag1: 3.95,
      turbidityLag2: 3.60,
      ndciLag1: 0.27,
      ndciLag2: 0.24,
      lstLag1: 32.8,
      lstLag2: 31.5
    },
    waterProximityKm: 0.4,
    outbreakRecords: 32,
    historicalCases: [
      { year: 2021, month: 7, cases: 96, risk: 0.75 },
      { year: 2022, month: 7, cases: 112, risk: 0.80 }
    ]
  },
  {
    id: 'khordha_odisha',
    name: 'Khordha',
    state: 'Odisha',
    lat: 20.1917,
    lng: 85.6267,
    riskTier: 'Moderate',
    riskScore: 0.62,
    addProbability: 0.63,
    choleraProbability: 0.58,
    typhoidProbability: 0.60,
    sviScore: 0.51,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.52,
      ndci: 0.24,
      cdom: 1.48,
      ndwi: 0.41,
      awei: -0.05,
      lstCelsius: 35.1
    },
    lags: {
      turbidityLag1: 3.30,
      turbidityLag2: 3.00,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 34.6,
      lstLag2: 33.2
    },
    waterProximityKm: 1.8,
    outbreakRecords: 20,
    historicalCases: [
      { year: 2021, month: 7, cases: 54, risk: 0.60 },
      { year: 2022, month: 7, cases: 63, risk: 0.65 }
    ]
  },
  {
    id: 'balasore_odisha',
    name: 'Balasore',
    state: 'Odisha',
    lat: 21.4934,
    lng: 86.9135,
    riskTier: 'Very High',
    riskScore: 0.81,
    addProbability: 0.82,
    choleraProbability: 0.78,
    typhoidProbability: 0.74,
    sviScore: 0.71,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.45,
      ndci: 0.32,
      cdom: 1.76,
      ndwi: 0.50,
      awei: 0.05,
      lstCelsius: 33.8
    },
    lags: {
      turbidityLag1: 4.18,
      turbidityLag2: 3.82,
      ndciLag1: 0.29,
      ndciLag2: 0.25,
      lstLag1: 33.2,
      lstLag2: 31.9
    },
    waterProximityKm: 0.7,
    outbreakRecords: 35,
    historicalCases: [
      { year: 2021, month: 7, cases: 110, risk: 0.79 },
      { year: 2022, month: 7, cases: 125, risk: 0.84 }
    ]
  },
  {
    id: 'ganjam_odisha',
    name: 'Ganjam',
    state: 'Odisha',
    lat: 19.3804,
    lng: 85.0594,
    riskTier: 'High',
    riskScore: 0.75,
    addProbability: 0.76,
    choleraProbability: 0.72,
    typhoidProbability: 0.69,
    sviScore: 0.68,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.10,
      ndci: 0.28,
      cdom: 1.64,
      ndwi: 0.46,
      awei: 0.01,
      lstCelsius: 34.2
    },
    lags: {
      turbidityLag1: 3.86,
      turbidityLag2: 3.52,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 33.8,
      lstLag2: 32.4
    },
    waterProximityKm: 0.9,
    outbreakRecords: 29,
    historicalCases: [
      { year: 2021, month: 7, cases: 88, risk: 0.73 },
      { year: 2022, month: 7, cases: 102, risk: 0.78 }
    ]
  },
  {
    id: 'sambalpur_odisha',
    name: 'Sambalpur',
    state: 'Odisha',
    lat: 21.4669,
    lng: 83.9812,
    riskTier: 'High',
    riskScore: 0.72,
    addProbability: 0.73,
    choleraProbability: 0.69,
    typhoidProbability: 0.67,
    sviScore: 0.64,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.92,
      ndci: 0.27,
      cdom: 1.58,
      ndwi: 0.43,
      awei: -0.04,
      lstCelsius: 37.1
    },
    lags: {
      turbidityLag1: 3.68,
      turbidityLag2: 3.35,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 36.5,
      lstLag2: 35.0
    },
    waterProximityKm: 1.2,
    outbreakRecords: 25,
    historicalCases: [
      { year: 2021, month: 6, cases: 74, risk: 0.70 },
      { year: 2022, month: 6, cases: 86, risk: 0.75 }
    ]
  },

  // =========================================================================
  // 9. ANDHRA PRADESH (6 Districts - Godavari & Krishna Delta)
  // =========================================================================
  {
    id: 'visakhapatnam_ap',
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    lat: 17.6868,
    lng: 83.2185,
    riskTier: 'Moderate',
    riskScore: 0.61,
    addProbability: 0.62,
    choleraProbability: 0.59,
    typhoidProbability: 0.58,
    sviScore: 0.47,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.55,
      ndci: 0.24,
      cdom: 1.48,
      ndwi: 0.52,
      awei: 0.08,
      lstCelsius: 33.2
    },
    lags: {
      turbidityLag1: 3.32,
      turbidityLag2: 3.02,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 32.8,
      lstLag2: 31.4
    },
    waterProximityKm: 0.5,
    outbreakRecords: 22,
    historicalCases: [
      { year: 2021, month: 7, cases: 58, risk: 0.59 },
      { year: 2022, month: 7, cases: 67, risk: 0.64 }
    ]
  },
  {
    id: 'krishna_ap',
    name: 'Krishna',
    state: 'Andhra Pradesh',
    lat: 16.5062,
    lng: 80.6480,
    riskTier: 'High',
    riskScore: 0.77,
    addProbability: 0.78,
    choleraProbability: 0.74,
    typhoidProbability: 0.72,
    sviScore: 0.61,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.20,
      ndci: 0.29,
      cdom: 1.68,
      ndwi: 0.48,
      awei: 0.03,
      lstCelsius: 36.4
    },
    lags: {
      turbidityLag1: 3.95,
      turbidityLag2: 3.60,
      ndciLag1: 0.26,
      ndciLag2: 0.23,
      lstLag1: 35.8,
      lstLag2: 34.2
    },
    waterProximityKm: 0.7,
    outbreakRecords: 31,
    historicalCases: [
      { year: 2021, month: 7, cases: 94, risk: 0.75 },
      { year: 2022, month: 7, cases: 108, risk: 0.80 }
    ]
  },
  {
    id: 'guntur_ap',
    name: 'Guntur',
    state: 'Andhra Pradesh',
    lat: 16.3067,
    lng: 80.4365,
    riskTier: 'High',
    riskScore: 0.75,
    addProbability: 0.76,
    choleraProbability: 0.71,
    typhoidProbability: 0.73,
    sviScore: 0.63,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.10,
      ndci: 0.28,
      cdom: 1.64,
      ndwi: 0.42,
      awei: -0.05,
      lstCelsius: 37.0
    },
    lags: {
      turbidityLag1: 3.86,
      turbidityLag2: 3.52,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 36.4,
      lstLag2: 34.8
    },
    waterProximityKm: 1.8,
    outbreakRecords: 28,
    historicalCases: [
      { year: 2021, month: 6, cases: 82, risk: 0.73 },
      { year: 2022, month: 6, cases: 95, risk: 0.77 }
    ]
  },
  {
    id: 'east_godavari_ap',
    name: 'East Godavari',
    state: 'Andhra Pradesh',
    lat: 17.0005,
    lng: 81.8040,
    riskTier: 'Very High',
    riskScore: 0.82,
    addProbability: 0.83,
    choleraProbability: 0.79,
    typhoidProbability: 0.75,
    sviScore: 0.66,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.45,
      ndci: 0.32,
      cdom: 1.76,
      ndwi: 0.52,
      awei: 0.07,
      lstCelsius: 35.6
    },
    lags: {
      turbidityLag1: 4.18,
      turbidityLag2: 3.82,
      ndciLag1: 0.29,
      ndciLag2: 0.25,
      lstLag1: 35.0,
      lstLag2: 33.5
    },
    waterProximityKm: 0.5,
    outbreakRecords: 37,
    historicalCases: [
      { year: 2021, month: 7, cases: 116, risk: 0.80 },
      { year: 2022, month: 7, cases: 132, risk: 0.85 }
    ]
  },
  {
    id: 'kurnool_ap',
    name: 'Kurnool',
    state: 'Andhra Pradesh',
    lat: 15.8281,
    lng: 78.0373,
    riskTier: 'High',
    riskScore: 0.74,
    addProbability: 0.75,
    choleraProbability: 0.70,
    typhoidProbability: 0.72,
    sviScore: 0.67,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.02,
      ndci: 0.28,
      cdom: 1.62,
      ndwi: 0.36,
      awei: -0.09,
      lstCelsius: 38.2
    },
    lags: {
      turbidityLag1: 3.78,
      turbidityLag2: 3.45,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 37.6,
      lstLag2: 36.0
    },
    waterProximityKm: 1.4,
    outbreakRecords: 27,
    historicalCases: [
      { year: 2021, month: 6, cases: 78, risk: 0.72 },
      { year: 2022, month: 6, cases: 90, risk: 0.76 }
    ]
  },
  {
    id: 'tirupati_ap',
    name: 'Tirupati',
    state: 'Andhra Pradesh',
    lat: 13.6288,
    lng: 79.4192,
    riskTier: 'Moderate',
    riskScore: 0.59,
    addProbability: 0.60,
    choleraProbability: 0.56,
    typhoidProbability: 0.58,
    sviScore: 0.52,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.45,
      ndci: 0.23,
      cdom: 1.44,
      ndwi: 0.33,
      awei: -0.11,
      lstCelsius: 35.0
    },
    lags: {
      turbidityLag1: 3.25,
      turbidityLag2: 2.95,
      ndciLag1: 0.21,
      ndciLag2: 0.18,
      lstLag1: 34.5,
      lstLag2: 33.1
    },
    waterProximityKm: 3.4,
    outbreakRecords: 19,
    historicalCases: [
      { year: 2021, month: 6, cases: 49, risk: 0.58 },
      { year: 2022, month: 6, cases: 58, risk: 0.62 }
    ]
  },

  // =========================================================================
  // 10. TAMIL NADU (6 Districts - Cauvery Delta & Coromandel Coast)
  // =========================================================================
  {
    id: 'chennai_tn',
    name: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    riskTier: 'Moderate',
    riskScore: 0.62,
    addProbability: 0.61,
    choleraProbability: 0.64,
    typhoidProbability: 0.60,
    sviScore: 0.44,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.52,
      ndci: 0.24,
      cdom: 1.46,
      ndwi: 0.55,
      awei: 0.11,
      lstCelsius: 34.5
    },
    lags: {
      turbidityLag1: 3.30,
      turbidityLag2: 3.02,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 34.0,
      lstLag2: 32.8
    },
    waterProximityKm: 0.6,
    outbreakRecords: 26,
    historicalCases: [
      { year: 2021, month: 11, cases: 72, risk: 0.60 },
      { year: 2022, month: 11, cases: 84, risk: 0.65 }
    ]
  },
  {
    id: 'coimbatore_tn',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    lat: 11.0168,
    lng: 76.9558,
    riskTier: 'Low',
    riskScore: 0.36,
    addProbability: 0.35,
    choleraProbability: 0.30,
    typhoidProbability: 0.38,
    sviScore: 0.34,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 2.50,
      ndci: 0.16,
      cdom: 1.10,
      ndwi: 0.31,
      awei: -0.16,
      lstCelsius: 31.0
    },
    lags: {
      turbidityLag1: 2.35,
      turbidityLag2: 2.15,
      ndciLag1: 0.15,
      ndciLag2: 0.13,
      lstLag1: 30.5,
      lstLag2: 29.2
    },
    waterProximityKm: 2.5,
    outbreakRecords: 10,
    historicalCases: [
      { year: 2021, month: 10, cases: 28, risk: 0.34 },
      { year: 2022, month: 10, cases: 33, risk: 0.38 }
    ]
  },
  {
    id: 'madurai_tn',
    name: 'Madurai',
    state: 'Tamil Nadu',
    lat: 9.9252,
    lng: 78.1198,
    riskTier: 'High',
    riskScore: 0.68,
    addProbability: 0.69,
    choleraProbability: 0.64,
    typhoidProbability: 0.67,
    sviScore: 0.55,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.82,
      ndci: 0.26,
      cdom: 1.55,
      ndwi: 0.36,
      awei: -0.10,
      lstCelsius: 36.8
    },
    lags: {
      turbidityLag1: 3.60,
      turbidityLag2: 3.28,
      ndciLag1: 0.24,
      ndciLag2: 0.21,
      lstLag1: 36.2,
      lstLag2: 34.6
    },
    waterProximityKm: 1.1,
    outbreakRecords: 24,
    historicalCases: [
      { year: 2021, month: 10, cases: 62, risk: 0.66 },
      { year: 2022, month: 10, cases: 73, risk: 0.71 }
    ]
  },
  {
    id: 'tiruchirappalli_tn',
    name: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    lat: 10.7905,
    lng: 78.7047,
    riskTier: 'High',
    riskScore: 0.70,
    addProbability: 0.71,
    choleraProbability: 0.67,
    typhoidProbability: 0.68,
    sviScore: 0.56,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.92,
      ndci: 0.27,
      cdom: 1.60,
      ndwi: 0.44,
      awei: -0.04,
      lstCelsius: 36.2
    },
    lags: {
      turbidityLag1: 3.70,
      turbidityLag2: 3.36,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 35.8,
      lstLag2: 34.2
    },
    waterProximityKm: 0.8,
    outbreakRecords: 26,
    historicalCases: [
      { year: 2021, month: 11, cases: 69, risk: 0.68 },
      { year: 2022, month: 11, cases: 81, risk: 0.73 }
    ]
  },
  {
    id: 'thanjavur_tn',
    name: 'Thanjavur',
    state: 'Tamil Nadu',
    lat: 10.7870,
    lng: 79.1378,
    riskTier: 'High',
    riskScore: 0.73,
    addProbability: 0.74,
    choleraProbability: 0.71,
    typhoidProbability: 0.70,
    sviScore: 0.58,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.05,
      ndci: 0.28,
      cdom: 1.64,
      ndwi: 0.48,
      awei: 0.01,
      lstCelsius: 35.6
    },
    lags: {
      turbidityLag1: 3.82,
      turbidityLag2: 3.48,
      ndciLag1: 0.26,
      ndciLag2: 0.23,
      lstLag1: 35.1,
      lstLag2: 33.6
    },
    waterProximityKm: 0.6,
    outbreakRecords: 29,
    historicalCases: [
      { year: 2021, month: 11, cases: 78, risk: 0.71 },
      { year: 2022, month: 11, cases: 92, risk: 0.76 }
    ]
  },
  {
    id: 'salem_tn',
    name: 'Salem',
    state: 'Tamil Nadu',
    lat: 11.6643,
    lng: 78.1460,
    riskTier: 'Moderate',
    riskScore: 0.59,
    addProbability: 0.60,
    choleraProbability: 0.55,
    typhoidProbability: 0.58,
    sviScore: 0.51,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.42,
      ndci: 0.23,
      cdom: 1.44,
      ndwi: 0.32,
      awei: -0.13,
      lstCelsius: 35.4
    },
    lags: {
      turbidityLag1: 3.22,
      turbidityLag2: 2.94,
      ndciLag1: 0.21,
      ndciLag2: 0.18,
      lstLag1: 34.8,
      lstLag2: 33.3
    },
    waterProximityKm: 3.2,
    outbreakRecords: 18,
    historicalCases: [
      { year: 2021, month: 10, cases: 46, risk: 0.57 },
      { year: 2022, month: 10, cases: 55, risk: 0.62 }
    ]
  },

  // =========================================================================
  // 11. KERALA (5 Districts - Western Ghats & Vembanad Backwaters)
  // =========================================================================
  {
    id: 'ernakulam_kerala',
    name: 'Ernakulam',
    state: 'Kerala',
    lat: 9.9816,
    lng: 76.2999,
    riskTier: 'Moderate',
    riskScore: 0.57,
    addProbability: 0.56,
    choleraProbability: 0.58,
    typhoidProbability: 0.54,
    sviScore: 0.31,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.45,
      ndci: 0.24,
      cdom: 1.48,
      ndwi: 0.62,
      awei: 0.18,
      lstCelsius: 30.5
    },
    lags: {
      turbidityLag1: 3.25,
      turbidityLag2: 2.95,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 30.0,
      lstLag2: 28.9
    },
    waterProximityKm: 0.3,
    outbreakRecords: 21,
    historicalCases: [
      { year: 2021, month: 8, cases: 52, risk: 0.55 },
      { year: 2022, month: 8, cases: 61, risk: 0.60 }
    ]
  },
  {
    id: 'thiruvananthapuram_kerala',
    name: 'Thiruvananthapuram',
    state: 'Kerala',
    lat: 8.5241,
    lng: 76.9366,
    riskTier: 'Low',
    riskScore: 0.39,
    addProbability: 0.38,
    choleraProbability: 0.37,
    typhoidProbability: 0.41,
    sviScore: 0.29,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 2.70,
      ndci: 0.18,
      cdom: 1.18,
      ndwi: 0.55,
      awei: 0.14,
      lstCelsius: 30.2
    },
    lags: {
      turbidityLag1: 2.52,
      turbidityLag2: 2.28,
      ndciLag1: 0.16,
      ndciLag2: 0.14,
      lstLag1: 29.8,
      lstLag2: 28.6
    },
    waterProximityKm: 0.6,
    outbreakRecords: 13,
    historicalCases: [
      { year: 2021, month: 8, cases: 32, risk: 0.37 },
      { year: 2022, month: 8, cases: 38, risk: 0.41 }
    ]
  },
  {
    id: 'kozhikode_kerala',
    name: 'Kozhikode',
    state: 'Kerala',
    lat: 11.2588,
    lng: 75.7804,
    riskTier: 'Moderate',
    riskScore: 0.58,
    addProbability: 0.59,
    choleraProbability: 0.56,
    typhoidProbability: 0.55,
    sviScore: 0.33,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.50,
      ndci: 0.24,
      cdom: 1.50,
      ndwi: 0.58,
      awei: 0.15,
      lstCelsius: 30.8
    },
    lags: {
      turbidityLag1: 3.28,
      turbidityLag2: 2.98,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 30.2,
      lstLag2: 29.0
    },
    waterProximityKm: 0.5,
    outbreakRecords: 20,
    historicalCases: [
      { year: 2021, month: 8, cases: 50, risk: 0.56 },
      { year: 2022, month: 8, cases: 59, risk: 0.61 }
    ]
  },
  {
    id: 'alappuzha_kerala',
    name: 'Alappuzha',
    state: 'Kerala',
    lat: 9.4981,
    lng: 76.3388,
    riskTier: 'High',
    riskScore: 0.69,
    addProbability: 0.70,
    choleraProbability: 0.72,
    typhoidProbability: 0.62,
    sviScore: 0.35,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.98,
      ndci: 0.28,
      cdom: 1.65,
      ndwi: 0.68,
      awei: 0.24,
      lstCelsius: 30.1
    },
    lags: {
      turbidityLag1: 3.75,
      turbidityLag2: 3.42,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 29.8,
      lstLag2: 28.5
    },
    waterProximityKm: 0.1,
    outbreakRecords: 28,
    historicalCases: [
      { year: 2021, month: 8, cases: 72, risk: 0.68 },
      { year: 2022, month: 8, cases: 84, risk: 0.73 }
    ]
  },
  {
    id: 'thrissur_kerala',
    name: 'Thrissur',
    state: 'Kerala',
    lat: 10.5276,
    lng: 76.2144,
    riskTier: 'Moderate',
    riskScore: 0.54,
    addProbability: 0.55,
    choleraProbability: 0.52,
    typhoidProbability: 0.51,
    sviScore: 0.32,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.25,
      ndci: 0.22,
      cdom: 1.38,
      ndwi: 0.54,
      awei: 0.12,
      lstCelsius: 31.2
    },
    lags: {
      turbidityLag1: 3.05,
      turbidityLag2: 2.80,
      ndciLag1: 0.20,
      ndciLag2: 0.17,
      lstLag1: 30.8,
      lstLag2: 29.5
    },
    waterProximityKm: 1.2,
    outbreakRecords: 17,
    historicalCases: [
      { year: 2021, month: 8, cases: 44, risk: 0.52 },
      { year: 2022, month: 8, cases: 51, risk: 0.56 }
    ]
  },

  // =========================================================================
  // 12. RAJASTHAN (4 Districts - Chambal & Thar Arid Zone)
  // =========================================================================
  {
    id: 'jaipur_rajasthan',
    name: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    riskTier: 'Low',
    riskScore: 0.29,
    addProbability: 0.28,
    choleraProbability: 0.22,
    typhoidProbability: 0.35,
    sviScore: 0.44,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 1.85,
      ndci: 0.12,
      cdom: 0.94,
      ndwi: 0.18,
      awei: -0.22,
      lstCelsius: 38.6
    },
    lags: {
      turbidityLag1: 1.70,
      turbidityLag2: 1.55,
      ndciLag1: 0.11,
      ndciLag2: 0.09,
      lstLag1: 37.8,
      lstLag2: 36.2
    },
    waterProximityKm: 8.5,
    outbreakRecords: 8,
    historicalCases: [
      { year: 2021, month: 5, cases: 18, risk: 0.27 },
      { year: 2022, month: 5, cases: 22, risk: 0.31 }
    ]
  },
  {
    id: 'jodhpur_rajasthan',
    name: 'Jodhpur',
    state: 'Rajasthan',
    lat: 26.2389,
    lng: 73.0243,
    riskTier: 'Low',
    riskScore: 0.26,
    addProbability: 0.25,
    choleraProbability: 0.19,
    typhoidProbability: 0.32,
    sviScore: 0.48,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 1.65,
      ndci: 0.10,
      cdom: 0.86,
      ndwi: 0.14,
      awei: -0.26,
      lstCelsius: 41.2
    },
    lags: {
      turbidityLag1: 1.52,
      turbidityLag2: 1.38,
      ndciLag1: 0.09,
      ndciLag2: 0.08,
      lstLag1: 40.5,
      lstLag2: 38.8
    },
    waterProximityKm: 12.0,
    outbreakRecords: 6,
    historicalCases: [
      { year: 2021, month: 5, cases: 14, risk: 0.24 },
      { year: 2022, month: 5, cases: 17, risk: 0.28 }
    ]
  },
  {
    id: 'kota_rajasthan',
    name: 'Kota',
    state: 'Rajasthan',
    lat: 25.2138,
    lng: 75.8648,
    riskTier: 'Moderate',
    riskScore: 0.58,
    addProbability: 0.59,
    choleraProbability: 0.54,
    typhoidProbability: 0.56,
    sviScore: 0.49,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.48,
      ndci: 0.24,
      cdom: 1.45,
      ndwi: 0.39,
      awei: -0.07,
      lstCelsius: 38.8
    },
    lags: {
      turbidityLag1: 3.25,
      turbidityLag2: 2.95,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 38.2,
      lstLag2: 36.5
    },
    waterProximityKm: 0.8,
    outbreakRecords: 19,
    historicalCases: [
      { year: 2021, month: 6, cases: 46, risk: 0.56 },
      { year: 2022, month: 6, cases: 54, risk: 0.61 }
    ]
  },
  {
    id: 'udaipur_rajasthan',
    name: 'Udaipur',
    state: 'Rajasthan',
    lat: 24.5854,
    lng: 73.7125,
    riskTier: 'Moderate',
    riskScore: 0.48,
    addProbability: 0.49,
    choleraProbability: 0.44,
    typhoidProbability: 0.46,
    sviScore: 0.50,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 2.98,
      ndci: 0.20,
      cdom: 1.28,
      ndwi: 0.36,
      awei: -0.12,
      lstCelsius: 35.6
    },
    lags: {
      turbidityLag1: 2.80,
      turbidityLag2: 2.55,
      ndciLag1: 0.18,
      ndciLag2: 0.16,
      lstLag1: 35.0,
      lstLag2: 33.6
    },
    waterProximityKm: 1.5,
    outbreakRecords: 14,
    historicalCases: [
      { year: 2021, month: 6, cases: 35, risk: 0.46 },
      { year: 2022, month: 6, cases: 41, risk: 0.50 }
    ]
  },

  // =========================================================================
  // 13. GUJARAT (4 Districts - Sabarmati & Narmada Basin)
  // =========================================================================
  {
    id: 'ahmedabad_gujarat',
    name: 'Ahmedabad',
    state: 'Gujarat',
    lat: 23.0225,
    lng: 72.5714,
    riskTier: 'Moderate',
    riskScore: 0.58,
    addProbability: 0.57,
    choleraProbability: 0.53,
    typhoidProbability: 0.60,
    sviScore: 0.43,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.42,
      ndci: 0.23,
      cdom: 1.44,
      ndwi: 0.35,
      awei: -0.11,
      lstCelsius: 37.4
    },
    lags: {
      turbidityLag1: 3.20,
      turbidityLag2: 2.92,
      ndciLag1: 0.21,
      ndciLag2: 0.18,
      lstLag1: 36.8,
      lstLag2: 35.2
    },
    waterProximityKm: 1.0,
    outbreakRecords: 22,
    historicalCases: [
      { year: 2021, month: 7, cases: 58, risk: 0.56 },
      { year: 2022, month: 7, cases: 68, risk: 0.61 }
    ]
  },
  {
    id: 'surat_gujarat',
    name: 'Surat',
    state: 'Gujarat',
    lat: 21.1702,
    lng: 72.8311,
    riskTier: 'High',
    riskScore: 0.69,
    addProbability: 0.70,
    choleraProbability: 0.68,
    typhoidProbability: 0.65,
    sviScore: 0.46,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.96,
      ndci: 0.28,
      cdom: 1.62,
      ndwi: 0.51,
      awei: 0.06,
      lstCelsius: 34.6
    },
    lags: {
      turbidityLag1: 3.72,
      turbidityLag2: 3.38,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 34.1,
      lstLag2: 32.8
    },
    waterProximityKm: 0.6,
    outbreakRecords: 27,
    historicalCases: [
      { year: 2021, month: 7, cases: 74, risk: 0.68 },
      { year: 2022, month: 7, cases: 86, risk: 0.73 }
    ]
  },
  {
    id: 'vadodara_gujarat',
    name: 'Vadodara',
    state: 'Gujarat',
    lat: 22.3072,
    lng: 73.1812,
    riskTier: 'Moderate',
    riskScore: 0.61,
    addProbability: 0.62,
    choleraProbability: 0.59,
    typhoidProbability: 0.58,
    sviScore: 0.45,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.56,
      ndci: 0.24,
      cdom: 1.48,
      ndwi: 0.38,
      awei: -0.08,
      lstCelsius: 36.5
    },
    lags: {
      turbidityLag1: 3.34,
      turbidityLag2: 3.02,
      ndciLag1: 0.22,
      ndciLag2: 0.19,
      lstLag1: 36.0,
      lstLag2: 34.5
    },
    waterProximityKm: 1.3,
    outbreakRecords: 20,
    historicalCases: [
      { year: 2021, month: 7, cases: 54, risk: 0.59 },
      { year: 2022, month: 7, cases: 63, risk: 0.64 }
    ]
  },
  {
    id: 'rajkot_gujarat',
    name: 'Rajkot',
    state: 'Gujarat',
    lat: 22.3039,
    lng: 70.8022,
    riskTier: 'Moderate',
    riskScore: 0.52,
    addProbability: 0.53,
    choleraProbability: 0.47,
    typhoidProbability: 0.51,
    sviScore: 0.44,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 3.12,
      ndci: 0.21,
      cdom: 1.32,
      ndwi: 0.28,
      awei: -0.15,
      lstCelsius: 37.8
    },
    lags: {
      turbidityLag1: 2.92,
      turbidityLag2: 2.68,
      ndciLag1: 0.19,
      ndciLag2: 0.17,
      lstLag1: 37.2,
      lstLag2: 35.6
    },
    waterProximityKm: 4.5,
    outbreakRecords: 15,
    historicalCases: [
      { year: 2021, month: 7, cases: 41, risk: 0.50 },
      { year: 2022, month: 7, cases: 48, risk: 0.54 }
    ]
  },

  // =========================================================================
  // 14. DELHI (1 District - Yamuna Megacity Corridor)
  // =========================================================================
  {
    id: 'new_delhi_delhi',
    name: 'New Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.2090,
    riskTier: 'High',
    riskScore: 0.72,
    addProbability: 0.71,
    choleraProbability: 0.66,
    typhoidProbability: 0.74,
    sviScore: 0.46,
    sviSource: 'NFHS-5',
    satellite: {
      turbidity: 4.10,
      ndci: 0.28,
      cdom: 1.62,
      ndwi: 0.36,
      awei: -0.10,
      lstCelsius: 36.8
    },
    lags: {
      turbidityLag1: 3.86,
      turbidityLag2: 3.52,
      ndciLag1: 0.25,
      ndciLag2: 0.22,
      lstLag1: 36.2,
      lstLag2: 34.6
    },
    waterProximityKm: 1.1,
    outbreakRecords: 32,
    historicalCases: [
      { year: 2021, month: 7, cases: 88, risk: 0.70 },
      { year: 2022, month: 7, cases: 102, risk: 0.75 }
    ]
  }
];
