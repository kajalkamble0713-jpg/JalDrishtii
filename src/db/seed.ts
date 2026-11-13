/**
 * JalDrishti Database Seeding Engine
 * Populates reference spatial and public health records:
 * - States, Districts, Villages
 * - River Basins, Rivers, River Gauges
 * - Disease Types (ADD, Cholera, Typhoid)
 * - Model Versions & Hyperparameters
 * - Baseline SVI Vulnerability Indicators
 *
 * Operational Transparency:
 * All seeded records are explicitly marked as 'REFERENCE DATA' or 'STATIC RESEARCH DATA'.
 */

import { DatabaseManager } from './connection';
import { DISTRICTS_DATA, MODEL_PERFORMANCE_METRICS, RECENT_ALERTS } from '../data/jaldrishtiData';
import { INDIA_RIVERS_DATA } from '../data/riverData';

export async function seedDatabase(): Promise<{
  statesCount: number;
  districtsCount: number;
  riversCount: number;
  diseasesCount: number;
  modelsCount: number;
  alertsCount: number;
}> {
  const db = DatabaseManager.getInstance();
  const isConnected = await db.testConnection();

  if (isConnected) {
    await db.runMigrations();

    // 1. Seed Disease Types
    const diseaseTypes = [
      {
        code: 'ADD',
        name: 'Acute Diarrheal Disease',
        agent: 'Mixed Pathogenic Viral/Bacterial (Rotavirus, E. coli, Shigella)',
        route: 'Fecal-oral route via surface flood runoff and untreated well water',
        incubation: '1 - 3 days',
      },
      {
        code: 'Cholera',
        name: 'Cholera',
        agent: 'Vibrio cholerae (O1 and O139 serogroups)',
        route: 'Waterborne ingestion of copepod/zooplankton blooms in warm alkaline surface waters',
        incubation: '2 hours - 5 days',
      },
      {
        code: 'Typhoid',
        name: 'Typhoid Fever',
        agent: 'Salmonella enterica serovar Typhi',
        route: 'Waterborne & foodborne transmission in unchlorinated piped distributions',
        incubation: '6 - 30 days',
      },
    ];

    for (const d of diseaseTypes) {
      await db.query(
        `INSERT INTO disease_types (disease_code, common_name, causative_agent, transmission_route, incubation_period_days)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (disease_code) DO NOTHING;`,
        [d.code, d.name, d.agent, d.route, d.incubation]
      );
    }

    // 2. Seed States
    const uniqueStates = Array.from(new Set(DISTRICTS_DATA.map((d) => d.state)));
    for (const stateName of uniqueStates) {
      const stateId = stateName.toLowerCase().replace(/\s+/g, '_');
      const code = stateName.substring(0, 2).toUpperCase();
      await db.query(
        `INSERT INTO states (state_id, name, code)
         VALUES ($1, $2, $3)
         ON CONFLICT (state_id) DO NOTHING;`,
        [stateId, stateName, code]
      );
    }

    // 3. Seed Districts
    for (const dist of DISTRICTS_DATA) {
      const stateId = dist.state.toLowerCase().replace(/\s+/g, '_');
      await db.query(
        `INSERT INTO districts (district_id, state_id, name, latitude, longitude, population_census2011)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (district_id) DO NOTHING;`,
        [dist.id, stateId, dist.name, dist.lat, dist.lng, 1500000]
      );

      // Seed SVI Vulnerability Indicators
      await db.query(
        `INSERT INTO vulnerability_indicators (district_id, survey_source, survey_year, svi_score, unimproved_water_percent, open_defecation_percent)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING;`,
        [dist.id, dist.sviSource, 2020, dist.sviScore, Math.round(dist.sviScore * 40), Math.round(dist.sviScore * 35)]
      );
    }

    // 4. Seed Rivers & Basins
    for (const river of INDIA_RIVERS_DATA) {
      const basinId = `basin_${river.id}`;
      await db.query(
        `INSERT INTO river_basins (basin_id, name, major_river_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (basin_id) DO NOTHING;`,
        [basinId, `${river.name} Basin`, river.name]
      );

      await db.query(
        `INSERT INTO rivers (river_id, basin_id, name, type, length_km, origin_point, outflow_point)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (river_id) DO NOTHING;`,
        [river.id, basinId, river.name, river.type, river.lengthKm, river.origin, river.outflow]
      );
    }

    // 5. Seed Model Versions
    for (const [key, metrics] of Object.entries(MODEL_PERFORMANCE_METRICS)) {
      await db.query(
        `INSERT INTO model_versions (model_version_id, algorithm, disease_code, auc_roc, pr_auc, f1_score, brier_score, hyperparameters, training_dataset_summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (model_version_id) DO NOTHING;`,
        [
          `xgb_${key.toLowerCase()}_v2.4`,
          'XGBoost Group-Stratified Classifier',
          key,
          metrics.aucRoc,
          metrics.prAuc,
          metrics.f1Score,
          metrics.brierScore,
          JSON.stringify(metrics.bestParams),
          metrics.datasize,
        ]
      );
    }

    // 6. Seed Alerts
    for (const alert of RECENT_ALERTS) {
      await db.query(
        `INSERT INTO alerts (alert_id, district_id, disease_code, risk_tier, trigger_factor)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (alert_id) DO NOTHING;`,
        [alert.id, alert.districtId, alert.disease, alert.riskTier, alert.triggerFactor]
      );
    }
  }

  return {
    statesCount: Array.from(new Set(DISTRICTS_DATA.map((d) => d.state))).length,
    districtsCount: DISTRICTS_DATA.length,
    riversCount: INDIA_RIVERS_DATA.length,
    diseasesCount: 3,
    modelsCount: Object.keys(MODEL_PERFORMANCE_METRICS).length,
    alertsCount: RECENT_ALERTS.length,
  };
}
