-- ====================================================================
-- JalDrishti PostgreSQL + PostGIS Production Spatial Database Schema
-- Migration 001: Initialization of Spatial Geometries & Telemetry Tables
-- ====================================================================

-- 1. Enable PostGIS and UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Administrative Boundaries
CREATE TABLE IF NOT EXISTS states (
    state_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL,
    centroid GEOMETRY(Point, 4326),
    boundary GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS districts (
    district_id VARCHAR(100) PRIMARY KEY,
    state_id VARCHAR(50) REFERENCES states(state_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
    boundary GEOMETRY(MultiPolygon, 4326),
    population_census2011 INTEGER,
    area_sq_km DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS villages (
    village_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    population INTEGER,
    is_flood_prone BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. River Basins and Hydrology
CREATE TABLE IF NOT EXISTS river_basins (
    basin_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    drainage_area_sq_km DOUBLE PRECISION,
    geometry GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rivers (
    river_id VARCHAR(50) PRIMARY KEY,
    basin_id VARCHAR(50) REFERENCES river_basins(basin_id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    length_km DOUBLE PRECISION,
    origin_point VARCHAR(200),
    outflow_point VARCHAR(200),
    path_geometry GEOMETRY(LineString, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_sources (
    source_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    river_id VARCHAR(50) REFERENCES rivers(river_id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- River, Lake, Reservoir, Borewell, Shallow Well
    location GEOMETRY(Point, 4326) NOT NULL,
    is_drinking_source BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Health Facilities
CREATE TABLE IF NOT EXISTS phcs (
    phc_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Sub-Center, PHC, CHC, District Hospital
    location GEOMETRY(Point, 4326) NOT NULL,
    bed_count INTEGER DEFAULT 10,
    has_ors_stockpile BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hospitals (
    hospital_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    tier VARCHAR(50) DEFAULT 'Secondary Care',
    location GEOMETRY(Point, 4326) NOT NULL,
    icu_bed_capacity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Earth Observation & Satellite Data
CREATE TABLE IF NOT EXISTS satellite_observations (
    observation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    satellite_platform VARCHAR(50) NOT NULL, -- Sentinel-2A, Sentinel-2B, Landsat-9, Terra-MODIS
    sensor VARCHAR(50) NOT NULL, -- MSI, TIRS, MODIS
    granule_product_id VARCHAR(255) NOT NULL,
    acquisition_date TIMESTAMPTZ NOT NULL,
    cloud_coverage_percent DOUBLE PRECISION,
    turbidity_proxy DOUBLE PRECISION,
    ndci_chlorophyll DOUBLE PRECISION,
    cdom_organic_matter DOUBLE PRECISION,
    ndwi_water_index DOUBLE PRECISION,
    awei_water_index DOUBLE PRECISION,
    lst_celsius DOUBLE PRECISION,
    qc_passed BOOLEAN DEFAULT TRUE,
    data_status VARCHAR(50) DEFAULT 'STATIC',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Meteorological Observations
CREATE TABLE IF NOT EXISTS weather_observations (
    weather_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL, -- Open-Meteo, IMD
    observed_at TIMESTAMPTZ NOT NULL,
    temperature_2m DOUBLE PRECISION NOT NULL,
    precipitation_mm DOUBLE PRECISION NOT NULL,
    surface_pressure_hpa DOUBLE PRECISION,
    relative_humidity_percent DOUBLE PRECISION,
    wind_speed_kmh DOUBLE PRECISION,
    is_live_stream BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Hydrological River Gauge Observations
CREATE TABLE IF NOT EXISTS hydrological_observations (
    hydro_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    river_id VARCHAR(50) REFERENCES rivers(river_id) ON DELETE CASCADE,
    gauge_id VARCHAR(100) NOT NULL,
    gauge_name VARCHAR(150),
    observed_at TIMESTAMPTZ NOT NULL,
    water_level_meters DOUBLE PRECISION NOT NULL,
    discharge_cusecs DOUBLE PRECISION,
    flow_rate_m3s DOUBLE PRECISION,
    rainfall_past_24h_mm DOUBLE PRECISION,
    flood_condition VARCHAR(50) DEFAULT 'Normal',
    data_status VARCHAR(50) DEFAULT 'STATIC',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Water Quality Laboratory & In-Situ Samples
CREATE TABLE IF NOT EXISTS water_quality_observations (
    sample_id VARCHAR(100) PRIMARY KEY,
    source_id VARCHAR(100) REFERENCES water_sources(source_id) ON DELETE SET NULL,
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    observed_at TIMESTAMPTZ NOT NULL,
    ph DOUBLE PRECISION,
    turbidity_ntu DOUBLE PRECISION,
    dissolved_oxygen_mgl DOUBLE PRECISION,
    conductivity_us_cm DOUBLE PRECISION,
    water_temperature_celsius DOUBLE PRECISION,
    residual_chlorine_mgl DOUBLE PRECISION,
    fecal_coliform_mpn_100ml INTEGER,
    ecoli_present BOOLEAN,
    verification_status VARCHAR(50) DEFAULT 'Modeled Research Benchmark',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Epidemiological Ground Truth & Surveillance
CREATE TABLE IF NOT EXISTS epidemiological_observations (
    surveillance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    disease VARCHAR(50) NOT NULL, -- ADD, Cholera, Typhoid
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    suspected_cases INTEGER DEFAULT 0,
    confirmed_cases INTEGER DEFAULT 0,
    total_hospitalizations INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    reporting_agency VARCHAR(150),
    is_historical_research BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. IoT In-Situ Sensor Nodes & Streams
CREATE TABLE IF NOT EXISTS iot_sensors (
    sensor_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    device_type VARCHAR(100) NOT NULL,
    water_source VARCHAR(150),
    location GEOMETRY(Point, 4326) NOT NULL,
    battery_percent INTEGER,
    firmware_version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'NO_CONNECTION',
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iot_readings (
    reading_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_id VARCHAR(100) REFERENCES iot_sensors(sensor_id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    parameter VARCHAR(50) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(30) NOT NULL,
    is_validated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Socioeconomic Vulnerability Indicators
CREATE TABLE IF NOT EXISTS vulnerability_indicators (
    vulnerability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    survey_source VARCHAR(50) NOT NULL, -- NFHS-5, Census 2011
    survey_year INTEGER NOT NULL,
    svi_score DOUBLE PRECISION NOT NULL,
    unimproved_water_percent DOUBLE PRECISION,
    open_defecation_percent DOUBLE PRECISION,
    illiteracy_percent DOUBLE PRECISION,
    poverty_line_percent DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Predictions, Provenance, Alerts & WASH Interventions
CREATE TABLE IF NOT EXISTS predictions (
    prediction_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    disease VARCHAR(50) NOT NULL,
    predicted_risk_score DOUBLE PRECISION NOT NULL,
    risk_category VARCHAR(50) NOT NULL,
    confidence_interval_low DOUBLE PRECISION,
    confidence_interval_high DOUBLE PRECISION,
    model_version VARCHAR(100) NOT NULL,
    feature_vector JSONB NOT NULL,
    provenance_sources JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
    alert_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    prediction_id VARCHAR(100) REFERENCES predictions(prediction_id) ON DELETE SET NULL,
    disease VARCHAR(50) NOT NULL,
    risk_tier VARCHAR(50) NOT NULL,
    trigger_factor VARCHAR(255) NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    dispatched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interventions (
    intervention_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    alert_id VARCHAR(100) REFERENCES alerts(alert_id) ON DELETE SET NULL,
    wash_protocol_name VARCHAR(150) NOT NULL,
    actions_checklist JSONB NOT NULL,
    ors_kits_deployed INTEGER DEFAULT 0,
    chlorine_tablets_distributed INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'RECOMMENDED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. System Metadata, Jobs & Audit Trails
CREATE TABLE IF NOT EXISTS data_source_metadata (
    source_name VARCHAR(100) PRIMARY KEY,
    provider_name VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL,
    quality_score INTEGER NOT NULL,
    last_successful_fetch TIMESTAMPTZ,
    last_attempt TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingestion_jobs (
    job_id VARCHAR(100) PRIMARY KEY,
    source_type VARCHAR(50) NOT NULL,
    schedule_description VARCHAR(150),
    status VARCHAR(50) DEFAULT 'IDLE',
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    records_ingested INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    last_error_message TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Spatial Indexes for Fast Proximity Queries
CREATE INDEX IF NOT EXISTS idx_districts_location ON districts USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_rivers_path ON rivers USING GIST (path_geometry);
CREATE INDEX IF NOT EXISTS idx_water_sources_location ON water_sources USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_phcs_location ON phcs USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_location ON iot_sensors USING GIST (location);
