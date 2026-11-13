# JalDrishti — Production REST API Documentation (v1) 🌐

The JalDrishti backend exposes a comprehensive, versioned REST API mounted under `/api/v1/*`. All responses return typed JSON payloads formatted with standard ISO 8601 timestamps and formal status indicators.

---

## Base URL

```
http://localhost:3000/api/v1
```

Interactive OpenAPI documentation is accessible at:
- **Interactive HTML Docs**: `http://localhost:3000/api/v1/docs`
- **OpenAPI 3.0 Specification**: `http://localhost:3000/api/v1/openapi.json`

---

## Endpoints Index

| Group | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/v1/health` | Service health, uptime, and PostgreSQL connectivity |
| **Database** | `GET` | `/api/v1/database/status` | PostgreSQL connection pool and PostGIS extension status |
| | `POST` | `/api/v1/database/migrate` | Execute pending PostGIS schema migrations |
| | `POST` | `/api/v1/database/seed` | Seed reference spatial geometries and public health benchmarks |
| **Geographic** | `GET` | `/api/v1/districts` | Spatial districts with PostGIS centroids, bounds, and SVI |
| | `GET` | `/api/v1/districts/:id` | Single district profile with geospatial attributes |
| | `GET` | `/api/v1/states` | All Indian states with administrative codes |
| | `GET` | `/api/v1/rivers` | Major river courses with LineString geometries |
| | `GET` | `/api/v1/river-basins` | Drainage basins and major outflow coordinates |
| | `GET` | `/api/v1/water-sources` | Drinking water surface intakes and borewells |
| **Data Health** | `GET` | `/api/v1/data-status` | 7-source health status grid, quality scores, and freshness |
| | `GET` | `/api/v1/data-sources` | Full registry of integrated telemetry sources |
| | `GET` | `/api/v1/data-quality` | Numerical quality score breakdown (0-100) |
| **Telemetry** | `GET` | `/api/v1/weather` | Live Open-Meteo numerical weather observations |
| | `GET` | `/api/v1/satellite` | Sentinel-2 spectral indices (NDWI, NDCI) & MODIS LST |
| | `GET` | `/api/v1/hydrology` | CWC river basin stage height and discharge |
| | `GET` | `/api/v1/water-quality` | Physical & bacteriological water quality observations |
| | `GET` | `/api/v1/epidemiology` | EpiClim & IDSP historical outbreak records |
| | `GET` | `/api/v1/vulnerability` | NFHS-5 & Census 2011 Social Vulnerability Index (SVI) |
| **IoT Sensors** | `GET` | `/api/v1/sensors/status` | Edge sensor gateway status & broker connectivity |
| | `GET` | `/api/v1/sensors` | List deployed LoRaWAN / cellular sensor nodes |
| | `GET` | `/api/v1/sensors/readings` | Time-series sensor readings |
| | `POST` | `/api/v1/sensors/register` | Provision new hardware sensor node |
| | `POST` | `/api/v1/sensors/ingest` | Ingest real telemetry reading with validation |
| **ML Engine** | `GET` | `/api/v1/ml/models` | Active XGBoost models and validation metrics |
| | `GET` | `/api/v1/ml/predict/:districtId` | Live risk inference with SHAP factor attribution |
| | `GET` | `/api/v1/predictions/provenance/:districtId` | 5-stream data provenance and 95% confidence bounds |
| **Operations** | `GET` | `/api/v1/operations/alerts` | Active outbreak alerts and priority tiers |
| | `POST` | `/api/v1/operations/alerts/:id/acknowledge` | Acknowledge dispatched alert |
| | `GET` | `/api/v1/operations/interventions` | Prescriptive WASH emergency response protocols |
| | `GET` | `/api/v1/operations/resources` | Emergency chlorine, ORS, and purification barge inventory |
| **Ingestion** | `GET` | `/api/v1/ingestion/jobs` | Scheduled background jobs and audit history |
| | `POST` | `/api/v1/ingestion/run/:jobId` | Manually trigger immediate job run |
| **Governance** | `GET` | `/api/v1/auth/me` | Authenticated session user and RBAC roles |
| | `GET` | `/api/v1/audit/logs` | Immutable audit log trail |

---

## Core Schema Contracts

### 1. System Health Check
`GET /api/v1/health`
```json
{
  "status": "HEALTHY",
  "service": "JalDrishti Waterborne Outbreak Telemetry Observatory",
  "version": "2.5.0",
  "timestamp": "2026-10-06T08:00:00.000Z",
  "uptimeSeconds": 1420,
  "database": {
    "connected": false,
    "postgisInstalled": false,
    "mode": "IN_MEMORY_FALLBACK"
  }
}
```

### 2. Live Weather Ingestion
`GET /api/v1/weather?lat=25.5941&lng=85.1376`
```json
{
  "data": {
    "temperature2m": 29.3,
    "precipitation": 0.0,
    "surfacePressure": 1008.2,
    "relativeHumidity": 68,
    "windSpeed10m": 9.2,
    "observedAt": "2026-10-06T07:45:00.000Z"
  },
  "metadata": {
    "provider": "Open-Meteo Global Meteorological Forecast",
    "status": "LIVE",
    "qualityScore": 100
  },
  "validation": { "isValid": true, "issues": [] }
}
```

### 3. ML Prediction with Explainability
`GET /api/v1/ml/predict/patna_bihar?disease=ADD`
```json
{
  "prediction": {
    "districtId": "patna_bihar",
    "districtName": "Patna",
    "disease": "ADD",
    "riskScore": 0.88,
    "riskTier": "Very High",
    "factors": [
      {
        "factor": "Turbidity Anomaly (4.82 FNU)",
        "contribution": "+28% Risk Contribution",
        "severity": "critical",
        "scientificRationale": "Turbidity exceeds 3.5 FNU threshold indicating severe pathogen particle attachment."
      }
    ],
    "confidenceInterval": [0.79, 0.94]
  }
}
```
