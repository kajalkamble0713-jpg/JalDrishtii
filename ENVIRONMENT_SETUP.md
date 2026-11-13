# JalDrishti — Environment Setup & Configuration Guide ⚙️

This document explains how to configure environment variables for local development, production server deployment, and external API connectivity.

---

## 1. Quick Start (.env setup)

Copy the configuration template:
```bash
cp .env.example .env
```

Open `.env` and configure your credentials.

---

## 2. Environment Variables Reference

| Variable | Description | Required? | Default / Example |
| :--- | :--- | :---: | :--- |
| `PORT` | Node.js / Express server listening port | Optional | `3000` |
| `NODE_ENV` | Application runtime environment | Optional | `development` |
| `DATABASE_URL` | PostgreSQL + PostGIS connection string | Required for DB | `postgresql://user:pass@localhost:5432/jaldrishti` |
| `OPEN_METEO_URL` | Open-Meteo API endpoint | Optional | `https://api.open-meteo.com/v1/forecast` |
| `SENTINEL_PROVIDER_URL`| Copernicus STAC API search endpoint | Optional | `https://catalogue.dataspace.copernicus.eu/...` |
| `SENTINEL_API_KEY` | Copernicus Data Space OAuth Bearer token | For Live S2 | Empty (defaults to `NOT_CONFIGURED`) |
| `NASA_EARTHDATA_USERNAME`| NASA Earthdata login username | For Live MODIS | Empty (defaults to `NOT_CONFIGURED`) |
| `NASA_EARTHDATA_PASSWORD`| NASA Earthdata login password | For Live MODIS | Empty (defaults to `NOT_CONFIGURED`) |
| `HYDROLOGY_API_URL`| Central Water Commission / India-WRIS URL | Optional | Empty (defaults to static geometry) |
| `WATER_QUALITY_API_URL`| CPCB laboratory monitoring API URL | Optional | Empty (defaults to modeled benchmark) |
| `HEALTH_API_URL` | IDSP / IHIP health surveillance endpoint | Optional | Empty (defaults to historical research) |
| `MQTT_BROKER_URL`| MQTT broker for in-situ IoT sensors | For Live IoT | Empty (defaults to `UNAVAILABLE`) |

---

## 3. How JalDrishti Handles Missing Credentials

JalDrishti adheres to **zero synthetic hallucination**:
- If `SENTINEL_API_KEY` is blank, Sentinel-2 reports:
  `STATUS: NOT_CONFIGURED`
  *(Serves verified static baseline labeled STATIC_RESEARCH_DATA)*
- If `NASA_EARTHDATA_USERNAME` is blank, MODIS reports:
  `STATUS: NOT_CONFIGURED`
- If `MQTT_BROKER_URL` is blank or no sensors are connected, IoT reports:
  `STATUS: UNAVAILABLE` (`NO LIVE SENSOR CONNECTION`)

The application **never crashes** if credentials are missing; it simply operates in verified fallback mode with full disclosure in the Data Health panel.
