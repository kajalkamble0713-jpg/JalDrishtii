# JalDrishti — Data Provider Architecture 🏛️

This document describes the modular, provider-based software architecture implemented in JalDrishti to handle heterogeneous environmental, satellite, epidemiological, and IoT sensor streams.

---

## 1. Architectural Philosophy

1. **Independent Provider Isolation**: Each external data feed is encapsulated in its own class implementing the common `IDataProvider<T>` contract.
2. **Explicit Operational Transparency**: Data sources are never presented as "live" unless actively validated by an operational API network response.
3. **Formal Validation Before Feature Store**: Every incoming payload must pass physical boundary, geographical coordinate, and temporal checks before being admitted to the ML feature vector.
4. **Reproducible Lineage**: Every risk prediction logs its source datasets, timestamps, feature weights, and quality scores into an immutable provenance record.

---

## 2. Class Hierarchy & Contract

```typescript
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
```

```
┌────────────────────────────────────────────────────────┐
│                   IDataProvider<T>                     │
└────────────────────────────────────────────────────────┘
                            ▲
                            │ implements
    ┌───────────────────────┼────────────────────────┐
    │                       │                        │
┌───────────────┐   ┌────────────────┐      ┌────────────────┐
│OpenMeteoProvider│ │Sentinel2Provider│    │ ModisProvider  │
└───────────────┘   └────────────────┘      └────────────────┘
    │                       │                        │
┌───────────────┐   ┌────────────────┐      ┌────────────────┐
│HydrologyProvider│ │WaterQualityProvider│  │IoTSensorProvider│
└───────────────┘   └────────────────┘      └────────────────┘
                            │
                    ┌────────────────┐
                    │CensusProvider  │
                    └────────────────┘
```

---

## 3. Data Pipeline Stages

```
[External Sources]
  ├── Open-Meteo REST API ─────────► [OpenMeteoProvider] ──┐
  ├── Copernicus STAC API ─────────► [Sentinel2Provider] ──┤
  ├── NASA Earthdata CMR  ─────────► [ModisProvider]     ──┤
  ├── CWC River Gauges    ─────────► [HydrologyProvider] ──┼──► [Formal Validator]
  ├── CPCB Lab Samples    ─────────► [WaterQualityProvider]─┤          │
  ├── IDSP Surveillance   ─────────► [EpidemiologyProvider]─┤          ▼
  ├── NFHS-5 Survey SVI   ─────────► [CensusProvider]    ──┤   [Quality Scorer]
  └── MQTT IoT Telemetry  ─────────► [IoTSensorProvider] ──┘          │
                                                                       ▼
                                                             [ML Feature Store]
                                                                       │
                                                                       ▼
                                                             [XGBoost Predictor]
                                                                       │
                                                                       ▼
                                                             [Prediction Provenance]
```

1. **Ingestion & Transport**: Fetches data over HTTPS or MQTT with timeout and backoff logic.
2. **Validation**: `DataValidator` checks physical ranges, coordinate envelopes, and timestamp plausibility.
3. **Normalization**: Canonical typing into domain entities (`WeatherObservation`, `Sentinel2Product`, etc.).
4. **Quality Scoring**: `QualityScorer` calculates a 0-100 index (freshness, completeness, validity, reliability).
5. **Feature Store Ingestion**: Normalized values are assembled into an ML vector with full provenance.
6. **Prediction Provenance**: Each output risk score links back to its input feature sources.

---

## 4. Operational Status States

- `LIVE`: Verified active API stream received within the last 60 minutes.
- `RECENT`: Verified observation received within expected cadence (<6 hours for weather, <3 days for satellite).
- `STALE`: Valid data whose timestamp exceeds expected operational revisit frequency.
- `FAILED`: Network, HTTP, or validation failure during the most recent fetch attempt.
- `UNAVAILABLE`: Hardware or connection not present (e.g. no physical IoT nodes).
- `STATIC`: Verified official survey or geographical reference baseline (NFHS-5, river geometries).
- `MODELED`: Biophysical or optical domain model output.
- `NOT_CONFIGURED`: Production provider interface implemented, but environment credentials are missing.
