/**
 * JalDrishti Government District Triage & Prioritization Engine
 * Multi-criteria decision analysis (MCDA) scoring for public health resource prioritization.
 * Fully transparent: displays explicit contribution weights and actionable triage recommendations.
 */

import { DISTRICTS_DATA } from '../../data/jaldrishtiData.js';
import { AlertEngine } from './alertEngine.js';
import { ResourceEngine } from './resourceEngine.js';

export interface TriageDistrictScore {
  districtId: string;
  districtName: string;
  state: string;
  triageRank: number;
  compositePriorityScore: number; // 0 - 100
  urgencyTier: 'CRITICAL_INTERVENTION_REQUIRED' | 'HIGH_PRIORITY_MONITORING' | 'WATCHLIST' | 'STABLE';
  populationAtRisk: number;
  activeAlertCount: number;
  resourceShortageCount: number;
  scoringFactors: {
    mlRiskContribution: number; // weight 35%
    socialVulnerabilityContribution: number; // weight 20%
    waterTurbidityContribution: number; // weight 15%
    riverProximityContribution: number; // weight 10%
    activeAlertPressure: number; // weight 10%
    resourceDeficitPressure: number; // weight 10%
  };
  recommendedImmediateAction: string;
}

export class TriageEngine {
  private static instance: TriageEngine;

  private constructor() {}

  public static getInstance(): TriageEngine {
    if (!TriageEngine.instance) {
      TriageEngine.instance = new TriageEngine();
    }
    return TriageEngine.instance;
  }

  public computeDistrictTriage(): TriageDistrictScore[] {
    const alertEngine = AlertEngine.getInstance();
    const resourceEngine = ResourceEngine.getInstance();

    const alerts = alertEngine.getAlerts();
    const shortages = resourceEngine.getShortageAlerts();

    const scored = DISTRICTS_DATA.map((district) => {
      // 1. ML Risk Score (0-100 normalized, weight 35)
      const mlRiskScore = district.riskScore * 100;
      const mlRiskContribution = Math.round(mlRiskScore * 0.35);

      // 2. Social Vulnerability Index (0-100 normalized, weight 20)
      const sviScore = district.sviScore * 100;
      const socialVulnerabilityContribution = Math.round(sviScore * 0.2);

      // 3. Water Turbidity anomaly (normalized against 6 FNU, weight 15)
      const turbidityRatio = Math.min(1.0, district.satellite.turbidity / 5.5);
      const waterTurbidityContribution = Math.round(turbidityRatio * 100 * 0.15);

      // 4. River Distance inverse proximity (<10km = high risk, weight 10)
      const proximityScore = Math.max(0, 100 - district.waterProximityKm * 8);
      const riverProximityContribution = Math.round(proximityScore * 0.1);

      // 5. Active Alert Pressure (weight 10)
      const districtAlerts = alerts.filter(
        (a) => a.districtId === district.id && a.status !== 'CLOSED' && a.status !== 'RESOLVED'
      );
      const alertScore = Math.min(100, districtAlerts.length * 40);
      const activeAlertPressure = Math.round(alertScore * 0.1);

      // 6. Resource Deficit Pressure (weight 10)
      const districtShortages = shortages.filter((s) => s.districtId === district.id);
      const shortageScore = Math.min(100, districtShortages.length * 50);
      const resourceDeficitPressure = Math.round(shortageScore * 0.1);

      const compositePriorityScore = Math.min(
        100,
        mlRiskContribution +
          socialVulnerabilityContribution +
          waterTurbidityContribution +
          riverProximityContribution +
          activeAlertPressure +
          resourceDeficitPressure
      );

      let urgencyTier: TriageDistrictScore['urgencyTier'] = 'STABLE';
      let recommendedImmediateAction = 'Continue routine environmental monitoring and monthly water quality sampling.';

      if (compositePriorityScore >= 75) {
        urgencyTier = 'CRITICAL_INTERVENTION_REQUIRED';
        recommendedImmediateAction =
          'Dispatch emergency WASH mobile chlorination unit, issue boiled-water public notice, and mobilize medical ORS reserves.';
      } else if (compositePriorityScore >= 60) {
        urgencyTier = 'HIGH_PRIORITY_MONITORING';
        recommendedImmediateAction =
          'Increase handpump bacteriological testing frequency to daily and audit PHC emergency diarrhea beds.';
      } else if (compositePriorityScore >= 45) {
        urgencyTier = 'WATCHLIST';
        recommendedImmediateAction =
          'Alert block development officers to inspect overhead tank chlorination records.';
      }

      return {
        districtId: district.id,
        districtName: district.name,
        state: district.state,
        triageRank: 0,
        compositePriorityScore,
        urgencyTier,
        populationAtRisk: Math.round(1500000 * (compositePriorityScore / 100)),
        activeAlertCount: districtAlerts.length,
        resourceShortageCount: districtShortages.length,
        scoringFactors: {
          mlRiskContribution,
          socialVulnerabilityContribution,
          waterTurbidityContribution,
          riverProximityContribution,
          activeAlertPressure,
          resourceDeficitPressure,
        },
        recommendedImmediateAction,
      };
    });

    // Sort descending by priority score and assign ranks
    scored.sort((a, b) => b.compositePriorityScore - a.compositePriorityScore);
    scored.forEach((d, idx) => {
      d.triageRank = idx + 1;
    });

    return scored;
  }

  /**
   * Exports district metrics and multi-criteria triage rankings as an official CSV report
   */
  public exportCsv(scopeFilter?: { stateId?: string; districtId?: string }): string {
    let list = this.computeDistrictTriage();

    if (scopeFilter?.stateId) {
      list = list.filter((d) => d.state.toLowerCase() === scopeFilter.stateId?.toLowerCase());
    }
    if (scopeFilter?.districtId) {
      list = list.filter((d) => d.districtId === scopeFilter.districtId);
    }

    const headers = [
      'Triage Rank',
      'District',
      'District ID',
      'State',
      'Composite Priority Score (0-100)',
      'Urgency Tier',
      'Population At Risk',
      'Active Alerts Count',
      'Resource Shortages Count',
      'ML Risk Weight (35%)',
      'SVI Vulnerability Weight (20%)',
      'Water Turbidity Weight (15%)',
      'River Proximity Weight (10%)',
      'Active Alert Pressure (10%)',
      'Resource Deficit Pressure (10%)',
      'Recommended Immediate Government Action'
    ];

    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = list.map((d) => [
      d.triageRank,
      escapeCsv(d.districtName),
      escapeCsv(d.districtId),
      escapeCsv(d.state),
      d.compositePriorityScore,
      escapeCsv(d.urgencyTier),
      d.populationAtRisk,
      d.activeAlertCount,
      d.resourceShortageCount,
      d.scoringFactors.mlRiskContribution,
      d.scoringFactors.socialVulnerabilityContribution,
      d.scoringFactors.waterTurbidityContribution,
      d.scoringFactors.riverProximityContribution,
      d.scoringFactors.activeAlertPressure,
      d.scoringFactors.resourceDeficitPressure,
      escapeCsv(d.recommendedImmediateAction)
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}
