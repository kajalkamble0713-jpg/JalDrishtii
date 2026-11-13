# JalDrishti — Data Sources Specification 📡

This document provides a formal inventory of all 8 environmental, satellite, hydrological, clinical, and socioeconomic data sources integrated into the JalDrishti platform.

---

## 1. Meteorological Telemetry (Weather API)

- **Source**: Global Numerical Weather Prediction (ECMWF IFS, GFS, ICON).
- **Provider**: Open-Meteo API (`https://api.open-meteo.com/v1/forecast`).
- **Authentication**: Keyless open operational access.
- **Update Frequency**: Every 15 minutes to 1 hour.
- **Fields Ingested**:
  - `temperature_2m` (°C): Ambient air temperature at 2 meters.
  - `precipitation` (mm): Precipitation rate.
  - `surface_pressure` (hPa): Atmospheric barometric pressure.
  - `relative_humidity_2m` (%): Ambient relative humidity.
  - `wind_speed_10m` (km/h): Surface wind speed.
- **Status in Deployment**: **`LIVE`** (active network requests executed on application launch).
- **Fallback Behavior**: If network connection drops or API times out (>5000ms), system serves verified climatological fallback and sets metadata status to `STALE` with an explicit fallback banner.
- **Limitations**: 11 km grid resolution downscaled via bilinear interpolation.

---

## 2. Copernicus Sentinel-2 MSI (Level-2A)

- **Source**: European Space Agency (ESA) Copernicus Constellation (Sentinel-2A & 2B).
- **Provider**: Copernicus Data Space Ecosystem (CDSE STAC API) / AWS Earth STAC.
- **Authentication**: Bearer Token via `SENTINEL_API_KEY`.
- **Update Frequency**: 5-day revisit cadence over Indian river basins.
- **Fields Processed**:
  - `NDWI`: `(B03 - B08) / (B03 + B08)` [-1.0 to +1.0] (Surface water boundary).
  - `NDCI`: `(B05 - B04) / (B05 + B04)` [-1.0 to +1.0] (Chlorophyll-a / Algal bloom proxy).
  - `AWEI`: `4*(B03 - B12) - (0.25*B08 + 2.75*B11)` (Automated water extraction).
  - `Turbidity Proxy`: Optical backscatter coefficient derived from Band 4 and Band 3.
  - `CDOM Proxy`: Colored Dissolved Organic Matter UV absorption proxy.
- **Status in Deployment**: **`NOT_CONFIGURED`** (Architectural provider implemented; credentials omitted in open repo).
- **Fallback Behavior**: Serves verified static research benchmarks from the EpiClim validation campaign, strictly labeled as `STATIC_RESEARCH_DATA`.
- **Limitations**: Cloud cover (>20%) during peak monsoon requires cloud-masking and multi-temporal compositing.

---

## 3. NASA MODIS Land Surface Temperature (LST)

- **Source**: NASA Terra (MOD11A1) and Aqua (MYD11A1) Radiometers.
- **Provider**: NASA Earthdata / LP DAAC / AppEEARS.
- **Authentication**: HTTP Basic Auth via `NASA_EARTHDATA_USERNAME` & `NASA_EARTHDATA_PASSWORD`.
- **Update Frequency**: Daily overpass (diurnal and nocturnal observations).
- **Fields Ingested**:
  - `lst_day_celsius` (°C): Daytime surface skin temperature.
  - `lst_night_celsius` (°C): Nighttime surface cooling temperature.
  - `qc_flags`: Mandatory cloud contamination & emissivity error flags.
- **Status in Deployment**: **`NOT_CONFIGURED`** (Architectural provider implemented; credentials omitted).
- **Fallback Behavior**: Serves verified research baseline temperatures calibrated from historical Terra overpasses, strictly labeled as `STATIC_RESEARCH_DATA`.
- **Limitations**: 1000m spatial resolution; thermal skin temperature differs slightly from subsurface water temperature.

---

## 4. Hydrological River Basins & Gauges

- **Source**: Central Water Commission (CWC) & India-WRIS Flood Telemetry.
- **Provider**: CWC River Basin Monitoring Division.
- **Authentication**: API Key via `HYDROLOGY_API_KEY` (Government restricted).
- **Update Frequency**: Hourly during monsoon flood alerts; daily during lean season.
- **Fields Ingested**:
  - `water_level_meters` (m ASL): Current stage height.
  - `discharge_cusecs` / `flow_rate_m3s`: Volumetric discharge rate.
  - `flood_condition`: Normal / Alert / Warning / Danger / Extreme.
  - `downstream_propagation_hours`: Hydrodynamic transit time to downstream intake points.
- **Status in Deployment**: **`STATIC`** (River polylines and gauge networks are curated GIS reference data).
- **Fallback Behavior**: Displays verified GIS river geometries for the Ganges, Yamuna, Godavari, Krishna, and Brahmaputra, labeled as `STATIC RIVER GEOMETRY`.

---

## 5. Surface Water Quality Ingestion

- **Source**: Central Pollution Control Board (CPCB) National Water Quality Monitoring Programme.
- **Provider**: CPCB Environmental Information System (ENVIS) & JalDrishti Optical Models.
- **Authentication**: `WATER_QUALITY_API_KEY`.
- **Update Frequency**: Monthly lab samples / Real-time automatic water quality monitoring stations (AWQMS).
- **Fields Ingested**:
  - `pH` [0.0 - 14.0]: Acidity/alkalinity balance.
  - `turbidity_ntu` (NTU / FNU): Suspended solids and water clarity.
  - `dissolved_oxygen_mgl` (mg/L): Biological oxygen demand indicator.
  - `water_temp_celsius` (°C): In-situ water temperature.
  - `fecal_coliform_mpn` (MPN / 100 mL): Bacterial contamination.
- **Status in Deployment**: **`MODELED`** (Biophysical optical model calibrated on historical baseline data).
- **Fallback Behavior**: Strictly labeled as `MODELED / RESEARCH BENCHMARK`; never shown as real live sensor readings without lab verification.

---

## 6. Epidemiological Outbreak Surveillance

- **Source**: Integrated Disease Surveillance Programme (IDSP / IHIP) & EpiClim Outbreak Repository.
- **Provider**: Ministry of Health and Family Welfare (MoHFW) / State Health Departments.
- **Authentication**: `HEALTH_API_KEY` (Restricted government health access).
- **Update Frequency**: Weekly epidemiological reporting week (Epi-Week).
- **Fields Ingested**:
  - `suspected_cases`: Syndromic outpatient clinic registrations.
  - `confirmed_cases`: Lab-verified culture or rapid diagnostic test positives.
  - `hospitalizations`: Inpatient admissions for ADD, Cholera, or Typhoid.
  - `deaths`: Mortality attributable to acute waterborne dehydration.
- **Status in Deployment**: **`STATIC`** (Curated historical training benchmarks from EpiClim 2019-2022 and Telangana HMIS 2019).
- **Fallback Behavior**: Strictly labeled as `HISTORICAL RESEARCH DATA`. No synthetic patient numbers are fabricated.

---

## 7. Census & Social Vulnerability Index (SVI)

- **Source**: National Family Health Survey (NFHS-5, 2019–2021) & Census of India (2011).
- **Provider**: Ministry of Health and Family Welfare (MoHFW) / IIPS Mumbai / ORGI.
- **Authentication**: Open access official government publication tables.
- **Update Frequency**: Multi-year decennial / 5-year survey cycles.
- **Fields Ingested**:
  - `svi_score` [0.00 - 1.00]: PCA composite social vulnerability index.
  - `unimproved_water_access_percent`: Households lacking treated piped drinking water.
  - `open_defecation_percent`: Households without individual household latrines (IHHL).
  - `illiteracy_percent`: Female adult illiteracy rate.
  - `poverty_line_percent`: Below Poverty Line (BPL) ration coverage.
- **Status in Deployment**: **`STATIC`** (High-quality official demographic baseline).
- **Fallback Behavior**: Labeled strictly as `STATIC OFFICIAL DATA`.

---

## 8. IoT Edge Water Sensor Gateway

- **Source**: In-situ optical turbidity meters, multi-parameter water sondes, telemetry buoys.
- **Provider**: JalDrishti Edge LoRaWAN / Cellular MQTT Broker.
- **Authentication**: TLS 1.3 + MQTT Username & Password (`MQTT_BROKER_URL`).
- **Update Frequency**: Event-driven / 5-minute telemetry heartbeat.
- **Fields Ingested**:
  - `sensor_id`, `battery_percent`, `firmware_version`.
  - `parameter`, `value`, `unit`, `signal_dbm`.
- **Status in Deployment**: **`UNAVAILABLE`** (Gateway architecture ready, awaiting hardware pairing).
- **Fallback Behavior**: UI explicitly displays: `NO LIVE SENSOR CONNECTION`. Zero simulated readings are injected.
