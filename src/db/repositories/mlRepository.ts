/**
 * JalDrishti Machine Learning Repository
 * Manages model versions, feature snapshots, inference predictions, and explainability factors.
 */

import { DatabaseManager } from '../connection.js';
import { DiseaseType } from '../../types.js';
import { MODEL_PERFORMANCE_METRICS } from '../../data/jaldrishtiData.js';

export interface ModelVersionRecord {
  modelVersionId: string;
  algorithm: string;
  diseaseCode: string;
  aucRoc: number;
  prAuc: number;
  f1Score: number;
  brierScore: number;
  hyperparameters: Record<string, any>;
  trainingDatasetSummary: string;
  isActive: boolean;
}

export interface PredictionRecord {
  predictionId: string;
  districtId: string;
  diseaseCode: string;
  modelVersionId: string;
  predictedRiskScore: number;
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Very High';
  confidenceIntervalLow: number;
  confidenceIntervalHigh: number;
  forecastStartDate: string;
  forecastEndDate: string;
  predictionTimestamp: string;
  dataQualityCompositeScore: number;
  status: string;
  factors?: PredictionFactorRecord[];
}

export interface PredictionFactorRecord {
  factorId?: string;
  predictionId: string;
  factorName: string;
  contributionWeight: string;
  severity: 'critical' | 'elevated' | 'moderate' | 'protective';
  scientificRationale: string;
}

export class MLRepository {
  private static instance: MLRepository;

  private inMemoryModels: ModelVersionRecord[] = [
    {
      modelVersionId: 'XGB-ADD-V2.4',
      algorithm: 'XGBoost Group-Stratified Classifier',
      diseaseCode: 'ADD',
      aucRoc: MODEL_PERFORMANCE_METRICS.ADD.aucRoc,
      prAuc: MODEL_PERFORMANCE_METRICS.ADD.prAuc,
      f1Score: MODEL_PERFORMANCE_METRICS.ADD.f1Score,
      brierScore: MODEL_PERFORMANCE_METRICS.ADD.brierScore,
      hyperparameters: { max_depth: 6, learning_rate: 0.05, n_estimators: 300, subsample: 0.8 },
      trainingDatasetSummary: 'EpiClim 223-district multi-year historical training corpus',
      isActive: true,
    },
    {
      modelVersionId: 'XGB-CHOLERA-V2.4',
      algorithm: 'XGBoost Group-Stratified Classifier',
      diseaseCode: 'Cholera',
      aucRoc: MODEL_PERFORMANCE_METRICS.Cholera.aucRoc,
      prAuc: MODEL_PERFORMANCE_METRICS.Cholera.prAuc,
      f1Score: MODEL_PERFORMANCE_METRICS.Cholera.f1Score,
      brierScore: MODEL_PERFORMANCE_METRICS.Cholera.brierScore,
      hyperparameters: { max_depth: 5, learning_rate: 0.03, n_estimators: 400, subsample: 0.75 },
      trainingDatasetSummary: 'EpiClim Coastal & Riverine cholera outbreak registry',
      isActive: true,
    },
    {
      modelVersionId: 'XGB-TYPHOID-V2.4',
      algorithm: 'XGBoost Group-Stratified Classifier',
      diseaseCode: 'Typhoid',
      aucRoc: MODEL_PERFORMANCE_METRICS.Typhoid.aucRoc,
      prAuc: MODEL_PERFORMANCE_METRICS.Typhoid.prAuc,
      f1Score: MODEL_PERFORMANCE_METRICS.Typhoid.f1Score,
      brierScore: MODEL_PERFORMANCE_METRICS.Typhoid.brierScore,
      hyperparameters: { max_depth: 6, learning_rate: 0.04, n_estimators: 350, subsample: 0.8 },
      trainingDatasetSummary: 'HMIS Telangana inpatient enteric fever registry (2019)',
      isActive: true,
    },
  ];

  private inMemoryPredictions: PredictionRecord[] = [];

  private constructor() {}

  public static getInstance(): MLRepository {
    if (!MLRepository.instance) {
      MLRepository.instance = new MLRepository();
    }
    return MLRepository.instance;
  }

  public async getModelVersions(diseaseCode?: DiseaseType | string): Promise<ModelVersionRecord[]> {
    const db = DatabaseManager.getInstance();
    let sql = `
      SELECT model_version_id, algorithm, disease_code, auc_roc, pr_auc, f1_score,
             brier_score, hyperparameters, training_dataset_summary, is_active
      FROM model_versions
      WHERE is_active = TRUE
    `;
    const values: any[] = [];
    if (diseaseCode) {
      sql += ` AND disease_code = $1`;
      values.push(diseaseCode);
    }
    sql += ` ORDER BY created_at DESC;`;

    const res = await db.query<any>(sql, values);
    if (res && res.rows.length > 0) {
      return res.rows.map((r) => ({
        modelVersionId: r.model_version_id,
        algorithm: r.algorithm,
        diseaseCode: r.disease_code,
        aucRoc: r.auc_roc,
        prAuc: r.pr_auc,
        f1Score: r.f1_score,
        brierScore: r.brier_score,
        hyperparameters: r.hyperparameters,
        trainingDatasetSummary: r.training_dataset_summary,
        isActive: r.is_active,
      }));
    }

    return diseaseCode
      ? this.inMemoryModels.filter((m) => m.diseaseCode === diseaseCode)
      : this.inMemoryModels;
  }

  public async savePrediction(prediction: PredictionRecord, factors: PredictionFactorRecord[]): Promise<void> {
    const db = DatabaseManager.getInstance();
    await db.query(
      `INSERT INTO predictions (
        prediction_id, district_id, disease_code, model_version_id, predicted_risk_score,
        risk_category, confidence_interval_low, confidence_interval_high, forecast_start_date,
        forecast_end_date, prediction_timestamp, data_quality_composite_score, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (prediction_id) DO UPDATE SET
        predicted_risk_score = EXCLUDED.predicted_risk_score,
        risk_category = EXCLUDED.risk_category;`,
      [
        prediction.predictionId,
        prediction.districtId,
        prediction.diseaseCode,
        prediction.modelVersionId,
        prediction.predictedRiskScore,
        prediction.riskCategory,
        prediction.confidenceIntervalLow,
        prediction.confidenceIntervalHigh,
        prediction.forecastStartDate,
        prediction.forecastEndDate,
        prediction.predictionTimestamp,
        prediction.dataQualityCompositeScore,
        prediction.status,
      ]
    );

    for (const factor of factors) {
      await db.query(
        `INSERT INTO prediction_factors (prediction_id, factor_name, contribution_weight, severity, scientific_rationale)
         VALUES ($1, $2, $3, $4, $5);`,
        [prediction.predictionId, factor.factorName, factor.contributionWeight, factor.severity, factor.scientificRationale]
      );
    }

    const fullRecord = { ...prediction, factors };
    this.inMemoryPredictions.unshift(fullRecord);
  }

  public async getLatestPrediction(districtId: string, diseaseCode: string): Promise<PredictionRecord | null> {
    const db = DatabaseManager.getInstance();
    const res = await db.query<any>(
      `SELECT prediction_id, district_id, disease_code, model_version_id, predicted_risk_score,
              risk_category, confidence_interval_low, confidence_interval_high, forecast_start_date,
              forecast_end_date, prediction_timestamp, data_quality_composite_score, status
       FROM predictions
       WHERE district_id = $1 AND disease_code = $2
       ORDER BY prediction_timestamp DESC
       LIMIT 1;`,
      [districtId, diseaseCode]
    );

    if (res && res.rows.length > 0) {
      const r = res.rows[0];
      const factorRes = await db.query<any>(
        `SELECT factor_name, contribution_weight, severity, scientific_rationale
         FROM prediction_factors
         WHERE prediction_id = $1;`,
        [r.prediction_id]
      );

      return {
        predictionId: r.prediction_id,
        districtId: r.district_id,
        diseaseCode: r.disease_code,
        modelVersionId: r.model_version_id,
        predictedRiskScore: r.predicted_risk_score,
        riskCategory: r.risk_category,
        confidenceIntervalLow: r.confidence_interval_low,
        confidenceIntervalHigh: r.confidence_interval_high,
        forecastStartDate: r.forecast_start_date,
        forecastEndDate: r.forecast_end_date,
        predictionTimestamp: r.prediction_timestamp,
        dataQualityCompositeScore: r.data_quality_composite_score,
        status: r.status,
        factors: factorRes?.rows.map((f) => ({
          predictionId: r.prediction_id,
          factorName: f.factor_name,
          contributionWeight: f.contribution_weight,
          severity: f.severity,
          scientificRationale: f.scientific_rationale,
        })),
      };
    }

    const found = this.inMemoryPredictions.find(
      (p) => p.districtId === districtId && p.diseaseCode === diseaseCode
    );
    return found || null;
  }
}
