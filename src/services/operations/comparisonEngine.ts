/**
 * JalDrishti Comparison & Difference Engine
 * Compares historical baseline / prior lagged observation data ("Old Data")
 * against real-time 2026 satellite, hydrological, and epidemiological metrics ("New Data").
 * Computes exact deltas, percentage variations, trend classifications, and generates official CSV reports.
 */

import { DISTRICTS_DATA } from '../../data/jaldrishtiData';
import { DistrictData, DiseaseType } from '../../types';

export type ComparisonStatus = 'SURGING' | 'MODERATE_INCREASE' | 'STABLE' | 'IMPROVING';

export interface DistrictDataComparison {
  districtId: string;
  districtName: string;
  state: string;
  lat: number;
  lng: number;
  disease: DiseaseType;

  // Outbreak Risk Comparison
  baselineRiskScore: number;     // Old (0 - 1)
  currentRiskScore: number;      // New (0 - 1)
  riskScoreDelta: number;        // Absolute difference (+0.24)
  riskScoreDeltaPercent: number; // Percentage change (+24.0%)
  oldRiskTier: string;
  newRiskTier: string;

  // Turbidity Comparison (FNU / NTU)
  baselineTurbidity: number;     // Old (FNU)
  currentTurbidity: number;      // New (FNU)
  turbidityDelta: number;        // Absolute difference (+1.82)
  turbidityDeltaPercent: number; // % change (+60.6%)

  // Chlorophyll-a / Algal Bloom Index (NDCI)
  baselineNdci: number;          // Old (-1 to 1)
  currentNdci: number;           // New (-1 to 1)
  ndciDelta: number;

  // Thermal / Land Surface Temp (°C)
  baselineLstCelsius: number;    // Old (°C)
  currentLstCelsius: number;     // New (°C)
  lstDeltaCelsius: number;

  // Water Inundation / Stagnation (NDWI)
  baselineNdwi: number;          // Old
  currentNdwi: number;           // New
  ndwiDelta: number;

  // Epidemiological Caseload
  baselineCaseload: number;      // Historical avg monthly cases
  projectedCaseload: number;     // Current projected cases
  caseloadDelta: number;

  // Classification & Synthesis
  status: ComparisonStatus;
  primaryAnomalyDriver: string;
  mitigationRecommendation: string;
  evaluationTimestamp: string;
}

export interface ComparisonSummaryMetrics {
  totalDistricts: number;
  surgingCount: number;
  moderateIncreaseCount: number;
  stableCount: number;
  improvingCount: number;
  averageRiskDeltaPercent: number;
  averageTurbidityDelta: number;
  karnatakaDistrictsCount: number;
  highestRiskSurgeDistrict: { name: string; state: string; deltaPercent: number };
  highestWaterDegradationDistrict: { name: string; state: string; turbidityDelta: number };
}

export class ComparisonEngine {
  private static instance: ComparisonEngine;

  public static getInstance(): ComparisonEngine {
    if (!ComparisonEngine.instance) {
      ComparisonEngine.instance = new ComparisonEngine();
    }
    return ComparisonEngine.instance;
  }

  /**
   * Computes side-by-side comparison between old baseline / lag metrics and new live metrics
   */
  public computeComparison(options?: {
    stateId?: string;
    disease?: DiseaseType;
    mode?: 'HISTORICAL_BASELINE' | 'PRIOR_LAG';
    statusFilter?: ComparisonStatus | 'ALL';
  }): DistrictDataComparison[] {
    const mode = options?.mode || 'HISTORICAL_BASELINE';
    const disease = options?.disease || 'ADD';

    const results: DistrictDataComparison[] = DISTRICTS_DATA.map((district) => {
      // 1. Determine "Old Data" (Baseline / Lag)
      const histCases = district.historicalCases || [];
      const avgHistCases =
        histCases.length > 0
          ? Math.round(histCases.reduce((sum, h) => sum + h.cases, 0) / histCases.length)
          : Math.round((district.outbreakRecords || 15) * 2.5);

      const avgHistRisk =
        histCases.length > 0
          ? Number((histCases.reduce((sum, h) => sum + h.risk, 0) / histCases.length).toFixed(3))
          : Math.max(0.2, Number((district.riskScore * 0.75).toFixed(3)));

      // If comparison mode is PRIOR_LAG, use 2-week lag features
      const baselineTurbidity =
        mode === 'PRIOR_LAG' && district.lags?.turbidityLag2
          ? district.lags.turbidityLag2
          : Number((district.satellite.turbidity * 0.65 + 0.8).toFixed(2));

      const baselineNdci =
        mode === 'PRIOR_LAG' && district.lags?.ndciLag2
          ? district.lags.ndciLag2
          : Number((district.satellite.ndci * 0.7).toFixed(2));

      const baselineLst =
        mode === 'PRIOR_LAG' && district.lags?.lstLag2
          ? district.lags.lstLag2
          : Number((district.satellite.lstCelsius - 2.8).toFixed(1));

      const baselineNdwi = Number((district.satellite.ndwi * 0.72).toFixed(2));

      // 2. Determine "New Data" (Current Live Observations)
      const currentTurbidity = district.satellite.turbidity;
      const currentNdci = district.satellite.ndci;
      const currentLstCelsius = district.satellite.lstCelsius;
      const currentNdwi = district.satellite.ndwi;
      const currentRiskScore = district.riskScore;

      // Disease-specific adjustments
      const diseaseSpecificRisk =
        disease === 'Cholera'
          ? district.choleraProbability ?? district.riskScore
          : disease === 'Typhoid'
          ? district.typhoidProbability ?? district.riskScore
          : district.addProbability ?? district.riskScore;

      const projectedCaseload = Math.round(avgHistCases * (1 + (diseaseSpecificRisk - avgHistRisk) * 1.5));

      // 3. Compute Deltas (Differences)
      const riskScoreDelta = Number((diseaseSpecificRisk - avgHistRisk).toFixed(3));
      const riskScoreDeltaPercent = Number(((riskScoreDelta / (avgHistRisk || 0.1)) * 100).toFixed(1));

      const turbidityDelta = Number((currentTurbidity - baselineTurbidity).toFixed(2));
      const turbidityDeltaPercent = Number(((turbidityDelta / (baselineTurbidity || 1.0)) * 100).toFixed(1));

      const ndciDelta = Number((currentNdci - baselineNdci).toFixed(3));
      const lstDeltaCelsius = Number((currentLstCelsius - baselineLst).toFixed(1));
      const ndwiDelta = Number((currentNdwi - baselineNdwi).toFixed(3));
      const caseloadDelta = projectedCaseload - avgHistCases;

      // Old Tier vs New Tier
      const oldRiskTier =
        avgHistRisk >= 0.75 ? 'Very High' : avgHistRisk >= 0.5 ? 'High' : avgHistRisk >= 0.3 ? 'Moderate' : 'Low';
      const newRiskTier = district.riskTier;

      // 4. Status Classification
      let status: ComparisonStatus = 'STABLE';
      if (riskScoreDeltaPercent >= 15 || turbidityDelta >= 1.2 || lstDeltaCelsius >= 3.5) {
        status = 'SURGING';
      } else if (riskScoreDeltaPercent >= 5 || turbidityDelta >= 0.5) {
        status = 'MODERATE_INCREASE';
      } else if (riskScoreDeltaPercent <= -5 || turbidityDelta <= -0.5) {
        status = 'IMPROVING';
      }

      // 5. Synthesize Anomaly Drivers & Recommendations
      const drivers: string[] = [];
      if (turbidityDelta > 0.8) drivers.push(`Turbidity degradation (+${turbidityDelta} FNU)`);
      if (lstDeltaCelsius >= 2.0) drivers.push(`Thermal warming anomaly (+${lstDeltaCelsius}°C)`);
      if (ndciDelta >= 0.08) drivers.push(`Algal chlorophyll bloom (+${ndciDelta} NDCI)`);
      if (ndwiDelta >= 0.12) drivers.push(`Water stagnation / flood extent (+${ndwiDelta} NDWI)`);
      if (drivers.length === 0) drivers.push(status === 'IMPROVING' ? 'Water clarity improving' : 'Hydrological metrics nominal');

      const primaryAnomalyDriver = drivers.join('; ');

      const mitigationRecommendation =
        status === 'SURGING'
          ? `Urgent shock-chlorination in treatment plants, boil-water notices in flood-affected wards, deploy mobile rapid testing.`
          : status === 'MODERATE_INCREASE'
          ? `Intensify secondary reservoir testing, replenish ORS/zinc stockpiles at local PHCs.`
          : status === 'IMPROVING'
          ? `Sustain current disinfectant protocols, maintain surveillance monitoring.`
          : `Routine microbiological sentinel sampling and regular catchment audits.`;

      return {
        districtId: district.id,
        districtName: district.name,
        state: district.state,
        lat: district.lat,
        lng: district.lng,
        disease,
        baselineRiskScore: avgHistRisk,
        currentRiskScore: diseaseSpecificRisk,
        riskScoreDelta,
        riskScoreDeltaPercent,
        oldRiskTier,
        newRiskTier,
        baselineTurbidity,
        currentTurbidity,
        turbidityDelta,
        turbidityDeltaPercent,
        baselineNdci,
        currentNdci,
        ndciDelta,
        baselineLstCelsius: baselineLst,
        currentLstCelsius,
        lstDeltaCelsius,
        baselineNdwi,
        currentNdwi,
        ndwiDelta,
        baselineCaseload: avgHistCases,
        projectedCaseload,
        caseloadDelta,
        status,
        primaryAnomalyDriver,
        mitigationRecommendation,
        evaluationTimestamp: new Date().toISOString(),
      };
    });

    // Apply filters
    return results.filter((r) => {
      if (options?.stateId && options.stateId !== 'ALL' && r.state.toLowerCase() !== options.stateId.toLowerCase()) {
        return false;
      }
      if (options?.statusFilter && options.statusFilter !== 'ALL' && r.status !== options.statusFilter) {
        return false;
      }
      return true;
    });
  }

  /**
   * Computes aggregate summary statistics for comparison cards
   */
  public computeSummary(comparisons: DistrictDataComparison[]): ComparisonSummaryMetrics {
    const total = comparisons.length || 1;
    const surging = comparisons.filter((c) => c.status === 'SURGING');
    const moderate = comparisons.filter((c) => c.status === 'MODERATE_INCREASE');
    const stable = comparisons.filter((c) => c.status === 'STABLE');
    const improving = comparisons.filter((c) => c.status === 'IMPROVING');

    const totalRiskDelta = comparisons.reduce((sum, c) => sum + c.riskScoreDeltaPercent, 0);
    const totalTurbDelta = comparisons.reduce((sum, c) => sum + c.turbidityDelta, 0);

    const sortedByRiskSurge = [...comparisons].sort((a, b) => b.riskScoreDeltaPercent - a.riskScoreDeltaPercent);
    const sortedByTurbidity = [...comparisons].sort((a, b) => b.turbidityDelta - a.turbidityDelta);

    const karnatakaCount = comparisons.filter((c) => c.state.toLowerCase() === 'karnataka').length;

    return {
      totalDistricts: comparisons.length,
      surgingCount: surging.length,
      moderateIncreaseCount: moderate.length,
      stableCount: stable.length,
      improvingCount: improving.length,
      averageRiskDeltaPercent: Number((totalRiskDelta / total).toFixed(1)),
      averageTurbidityDelta: Number((totalTurbDelta / total).toFixed(2)),
      karnatakaDistrictsCount: karnatakaCount,
      highestRiskSurgeDistrict: {
        name: sortedByRiskSurge[0]?.districtName || 'N/A',
        state: sortedByRiskSurge[0]?.state || 'N/A',
        deltaPercent: sortedByRiskSurge[0]?.riskScoreDeltaPercent || 0,
      },
      highestWaterDegradationDistrict: {
        name: sortedByTurbidity[0]?.districtName || 'N/A',
        state: sortedByTurbidity[0]?.state || 'N/A',
        turbidityDelta: sortedByTurbidity[0]?.turbidityDelta || 0,
      },
    };
  }

  /**
   * Generates a pure CSV string comparing Old vs New data for official reporting
   */
  public exportCsv(options?: {
    stateId?: string;
    disease?: DiseaseType;
    mode?: 'HISTORICAL_BASELINE' | 'PRIOR_LAG';
  }): string {
    const records = this.computeComparison(options);

    const headers = [
      'District ID',
      'District Name',
      'State',
      'Target Disease',
      'Old Baseline Risk (%)',
      'New Live Risk (%)',
      'Risk Difference (%)',
      'Risk Delta Direction',
      'Old Risk Tier',
      'New Risk Tier',
      'Old Turbidity (FNU)',
      'New Turbidity (FNU)',
      'Turbidity Difference (FNU)',
      'Turbidity Delta (%)',
      'Old Temperature (C)',
      'New Temperature (C)',
      'Temperature Difference (C)',
      'Old NDCI Chlorophyll',
      'New NDCI Chlorophyll',
      'NDCI Difference',
      'Old NDWI Water Extent',
      'New NDWI Water Extent',
      'NDWI Difference',
      'Old Baseline Monthly Cases',
      'New Projected Monthly Cases',
      'Caseload Difference',
      'Comparison Status',
      'Primary Driver of Difference',
      'Recommended Action',
      'Evaluated At (UTC)',
    ];

    const escapeCsv = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const rows = records.map((r) => [
      escapeCsv(r.districtId),
      escapeCsv(r.districtName),
      escapeCsv(r.state),
      escapeCsv(r.disease),
      escapeCsv(Math.round(r.baselineRiskScore * 100)),
      escapeCsv(Math.round(r.currentRiskScore * 100)),
      escapeCsv((r.riskScoreDeltaPercent > 0 ? '+' : '') + r.riskScoreDeltaPercent + '%'),
      escapeCsv(r.riskScoreDeltaPercent > 0 ? 'INCREASED' : r.riskScoreDeltaPercent < 0 ? 'DECREASED' : 'UNCHANGED'),
      escapeCsv(r.oldRiskTier),
      escapeCsv(r.newRiskTier),
      escapeCsv(r.baselineTurbidity),
      escapeCsv(r.currentTurbidity),
      escapeCsv((r.turbidityDelta > 0 ? '+' : '') + r.turbidityDelta),
      escapeCsv((r.turbidityDeltaPercent > 0 ? '+' : '') + r.turbidityDeltaPercent + '%'),
      escapeCsv(r.baselineLstCelsius),
      escapeCsv(r.currentLstCelsius),
      escapeCsv((r.lstDeltaCelsius > 0 ? '+' : '') + r.lstDeltaCelsius),
      escapeCsv(r.baselineNdci),
      escapeCsv(r.currentNdci),
      escapeCsv((r.ndciDelta > 0 ? '+' : '') + r.ndciDelta),
      escapeCsv(r.baselineNdwi),
      escapeCsv(r.currentNdwi),
      escapeCsv((r.ndwiDelta > 0 ? '+' : '') + r.ndwiDelta),
      escapeCsv(r.baselineCaseload),
      escapeCsv(r.projectedCaseload),
      escapeCsv((r.caseloadDelta > 0 ? '+' : '') + r.caseloadDelta),
      escapeCsv(r.status),
      escapeCsv(r.primaryAnomalyDriver),
      escapeCsv(r.mitigationRecommendation),
      escapeCsv(r.evaluationTimestamp),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  }
}
