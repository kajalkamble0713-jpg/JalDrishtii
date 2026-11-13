# JalDrishti — Data Quality Scoring Engine (0–100) 📊

JalDrishti computes an objective, numerical **0 to 100 Data Quality Score** for every data provider and observation admitted into the platform.

---

## 1. Quality Score Components

The composite score is broken into four orthogonal 25-point sub-indices:

$$\text{Quality Score} = \text{Freshness (25)} + \text{Completeness (25)} + \text{Validity (25)} + \text{Source Reliability (25)}$$

### 1. Freshness (0 – 25 points)
- **25 points**: `LIVE` stream received within the last 30 minutes.
- **20 points**: `RECENT` observation within expected operational revisit cadence (<6h for weather, <3 days for satellite).
- **14 points**: `MODELED` biophysical model output.
- **12 points**: `STATIC` official demographic or epidemiological baseline.
- **8 points**: `STALE` observation that has exceeded expected revisit time.
- **0 points**: `NOT_CONFIGURED` or `UNAVAILABLE`.

### 2. Completeness (0 – 25 points)
- Ratio of present, non-null mandatory fields multiplied by 25:
  $$\text{Completeness Score} = \text{round}\left(\frac{\text{Present Fields}}{\text{Total Required Fields}} \times 25\right)$$

### 3. Validity (0 – 25 points)
- **25 points**: 100% passed all range, schema, coordinate, and temporal checks.
- **10–20 points**: Minor non-fatal warnings (e.g. slight statistical outliers).
- **0 points**: Critical validation errors (e.g. impossible temperatures or negative precipitation).

### 4. Source Reliability (0 – 25 points)
- **25 points**: Tier-1 verified operational source (Copernicus, Open-Meteo, NFHS-5).
- **16 points**: Validated scientific biophysical model.
- **14 points**: Pre-compiled research fallback.
- **0 points**: Unauthenticated / unconfigured provider.

---

## 2. Sample Scores in Deployment

| Feed | Status | Score | Breakdown (F / C / V / R) | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Open-Meteo Weather** | `LIVE` | **100/100** | 25 + 25 + 25 + 25 | Active live stream passed all checks |
| **NFHS-5 SVI** | `STATIC` | **92/100** | 12 + 25 + 25 + 25 | Verified official government survey |
| **Sentinel-2 MSI** | `NOT_CONFIGURED` | **0/100** | 0 + 0 + 0 + 0 | Provider credentials not configured |
| **MODIS LST** | `NOT_CONFIGURED` | **0/100** | 0 + 0 + 0 + 0 | NASA Earthdata unconfigured |
| **CWC Hydrology** | `STATIC` | **74/100** | 12 + 25 + 25 + 12 | Static river geometry reference |
| **CPCB Water Quality** | `MODELED` | **67/100** | 14 + 25 + 25 + 3 | Calibrated optical model |
| **IoT Sensors** | `UNAVAILABLE` | **0/100** | 0 + 0 + 0 + 0 | No hardware nodes provisioned |
