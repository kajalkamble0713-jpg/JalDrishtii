# JalDrishti — Data Provenance & Explainability Specification 🔍

This document explains how JalDrishti maintains end-to-end data provenance and explainability for all public health risk predictions.

---

## 1. What is Data Provenance?

Data provenance (lineage) records the origin, inputs, transformations, and custody of every data point used to compute an epidemiological risk score. 

In public health decision-making, municipal health officers and disaster teams cannot rely on black-box algorithms. They require verifiable answers to:
- *What observations triggered this alert?*
- *When were the observations recorded?*
- *Which specific satellite or weather feed supplied the numbers?*
- *Are these numbers from a live API, or a static historical survey?*

---

## 2. Prediction Provenance Record Structure

Every prediction generated in JalDrishti produces an immutable audit record:

```typescript
export interface PredictionProvenanceRecord {
  predictionId: string;             // Unique ID: e.g. PRED_PATNA_BIHAR_ADD_LN8J9
  districtId: string;               // Target district
  districtName: string;
  state: string;
  disease: DiseaseType;             // ADD | Cholera | Typhoid
  predictedRiskScore: number;       // 0.00 to 1.00
  riskCategory: RiskTier;           // Low | Moderate | High | Very High
  confidenceInterval: [number, number]; // 95% bootstrap bounds
  modelVersion: string;             // e.g. jaldrishti_xgb_v2.4_stratified
  modelAlgorithm: string;           // XGBoost Group-Stratified K-Fold
  predictionGeneratedAt: string;    // ISO timestamp
  inputFeatures: Record<string, number>;
  sourceDatasets: Array<{
    sourceName: string;
    provider: string;
    status: DataStatus;             // LIVE, STATIC, MODELED, etc.
    observedAt: string;
    qualityScore: number;           // 0-100
    isFallback: boolean;
  }>;
  whyThisPrediction: Array<{
    factor: string;
    contribution: string;           // e.g. "+28% Risk Contribution"
    severity: 'critical' | 'elevated' | 'moderate' | 'protective';
    scientificRationale: string;
  }>;
}
```

---

## 3. "Why This Prediction?" Feature

In the user interface:
1. When viewing any district in **District Detail Analytics**, users can click the **"Why This Prediction?"** button.
2. A dedicated modal displays:
   - The unique **Prediction ID**.
   - The **95% Bootstrap Confidence Interval**.
   - Key environmental and social risk drivers derived from SHAP attribution (e.g. *Turbidity > 3.5 FNU contributing +28%*).
   - The exact source datasets used (e.g. *Open-Meteo LIVE, Sentinel-2 STATIC, NFHS-5 STATIC*), with their quality scores and observation timestamps.

---

## 4. Scientific Honesty & Traceability Matrix

| Prediction Component | Underlying Input Source | Status | Traceability |
| :--- | :--- | :---: | :--- |
| **Precipitation & Temp** | Open-Meteo API | `LIVE` | Dynamic coordinates query on request |
| **Water Turbidity & NDCI** | Copernicus Sentinel-2 MSI | `STATIC` / `NOT_CONFIGURED` | Traceable to EpiClim validation campaign |
| **Surface Temperature** | NASA MODIS LST (MOD11A1) | `STATIC` / `NOT_CONFIGURED` | Climatological baseline calibrated to 2019–2022 |
| **River Flow & Distance** | CWC Basin Polylines & Gauges | `STATIC` | GIS shapefiles & mid-basin gauge stations |
| **Socioeconomic SVI** | NFHS-5 (2019-2021) Tables | `STATIC` | IIPS state factsheets & PCA eigenvectors |
| **Caseload Benchmarks** | EpiClim & Telangana HMIS | `STATIC` | State surveillance weekly epidemiological records |
