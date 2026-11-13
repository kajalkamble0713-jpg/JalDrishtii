# JalDrishti — Ingestion Scheduler & Jobs Engine ⏱️

The `IngestionScheduler` manages recurring background pipelines, retry policies, execution history, and manual trigger endpoints.

---

## 1. Managed Jobs Registry

| Job ID | Source Type | Scheduled Cadence | Action |
| :--- | :--- | :--- | :--- |
| `job_weather_sync` | `weather` | Every 15 minutes | Ingests 2m temperature, precipitation, pressure from Open-Meteo |
| `job_sentinel2_stac` | `satellite_sentinel2` | Every 5 days | Queries Copernicus STAC catalog for new Level-2A granules |
| `job_modis_lst` | `satellite_modis` | Daily (06:00 UTC) | Ingests MOD11A1 Land Surface Temperature tiles |
| `job_cwc_hydrology` | `hydrology` | Hourly | Ingests CWC river gauge stage height and discharge |
| `job_cpcb_water_quality` | `water_quality` | Daily | Ingests CPCB station water quality observations |
| `job_idsp_epidemiology` | `epidemiology` | Weekly (Epi-Week) | Ingests IDSP syndromic and laboratory disease case reports |
| `job_iot_telemetry` | `iot_sensors` | Continuous (5 min) | Polls in-situ MQTT sensor nodes |

---

## 2. Retry Policy & Exponential Backoff

When an external provider fails (HTTP 5xx, socket timeout, or rate limiting):
1. **Initial Failure**: Logged with timestamp and error message.
2. **Backoff Formula**:
   $$\text{Delay} = \text{base\_delay} \times 2^{\text{retry\_count}} + \text{jitter}$$
3. **Max Retries**: 3 attempts before marking job status as `FAILED`.
4. **Fallback Activation**: The system activates verified research fallbacks without crashing the frontend.

---

## 3. Manual Job Triggering

Jobs can be executed on-demand via the REST API or the Data Provenance Panel in the UI:

```bash
# Example: Triggering immediate weather ingestion
curl -X POST http://localhost:3000/api/v1/ingestion/run/job_weather_sync
```

Response:
```json
{
  "success": true,
  "message": "SUCCESS",
  "recordsIngested": 1
}
```
