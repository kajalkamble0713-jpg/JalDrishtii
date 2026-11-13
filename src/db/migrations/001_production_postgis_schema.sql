-- ==============================================================================
-- JalDrishti PostgreSQL + PostGIS Production Schema Migration 001
-- Complete Normalized Relational & Spatial Database Infrastructure
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ------------------------------------------------------------------------------
-- 1. GEOGRAPHIC TABLES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS states (
    state_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL,
    country VARCHAR(50) DEFAULT 'India',
    centroid GEOMETRY(Point, 4326),
    boundary GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS districts (
    district_id VARCHAR(100) PRIMARY KEY,
    state_id VARCHAR(50) NOT NULL REFERENCES states(state_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90.0 AND latitude <= 90.0),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180.0 AND longitude <= 180.0),
    centroid GEOMETRY(Point, 4326),
    boundary GEOMETRY(MultiPolygon, 4326),
    population_census2011 INTEGER,
    area_sq_km DOUBLE PRECISION,
    headquarters VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS villages (
    village_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    population INTEGER,
    is_flood_prone BOOLEAN DEFAULT FALSE,
    elevation_meters DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS river_basins (
    basin_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    major_river_name VARCHAR(150),
    drainage_area_sq_km DOUBLE PRECISION,
    basin_geometry GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rivers (
    river_id VARCHAR(50) PRIMARY KEY,
    basin_id VARCHAR(50) REFERENCES river_basins(basin_id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'Major River', 'Sub-Basin River', 'Urban Tributary', 'Estuary'
    length_km DOUBLE PRECISION,
    origin_point VARCHAR(200),
    outflow_point VARCHAR(200),
    path_geometry GEOMETRY(LineString, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS river_gauges (
    gauge_id VARCHAR(100) PRIMARY KEY,
    river_id VARCHAR(50) NOT NULL REFERENCES rivers(river_id) ON DELETE CASCADE,
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    warning_level_meters DOUBLE PRECISION,
    danger_level_meters DOUBLE PRECISION,
    highest_flood_level_meters DOUBLE PRECISION,
    operating_agency VARCHAR(100) DEFAULT 'Central Water Commission (CWC)',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS phcs (
    phc_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'Sub-Centre', 'Primary Health Centre (PHC)', 'Community Health Centre (CHC)'
    location GEOMETRY(Point, 4326) NOT NULL,
    bed_count INTEGER DEFAULT 6,
    has_ors_stockpile BOOLEAN DEFAULT TRUE,
    has_cold_chain BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hospitals (
    hospital_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    tier VARCHAR(50) DEFAULT 'Secondary Care Hospital',
    location GEOMETRY(Point, 4326) NOT NULL,
    total_beds INTEGER DEFAULT 50,
    icu_bed_capacity INTEGER DEFAULT 10,
    emergency_diarrhea_ward_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_sources (
    source_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    river_id VARCHAR(50) REFERENCES rivers(river_id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'River Surface Intake', 'Canal Intake', 'Community Borewell', 'Pond/Tank'
    location GEOMETRY(Point, 4326) NOT NULL,
    is_drinking_source BOOLEAN DEFAULT TRUE,
    estimated_serviced_population INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. ENVIRONMENTAL OBSERVATIONS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS weather_observations (
    observation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL DEFAULT 'Open-Meteo ECMWF/GFS Blend',
    source_record_id VARCHAR(150),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    temperature_2m DOUBLE PRECISION NOT NULL CHECK (temperature_2m >= -20.0 AND temperature_2m <= 65.0),
    precipitation_mm DOUBLE PRECISION NOT NULL CHECK (precipitation_mm >= 0.0),
    surface_pressure_hpa DOUBLE PRECISION CHECK (surface_pressure_hpa >= 300.0 AND surface_pressure_hpa <= 1100.0),
    relative_humidity_percent DOUBLE PRECISION CHECK (relative_humidity_percent >= 0.0 AND relative_humidity_percent <= 100.0),
    wind_speed_kmh DOUBLE PRECISION CHECK (wind_speed_kmh >= 0.0),
    observed_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    quality_status VARCHAR(50) DEFAULT 'GOOD',
    validation_status VARCHAR(50) DEFAULT 'VALID',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_weather_district_time UNIQUE (district_id, observed_at, source)
);

CREATE TABLE IF NOT EXISTS satellite_observations (
    observation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    satellite_platform VARCHAR(50) NOT NULL, -- 'Sentinel-2A', 'Sentinel-2B', 'Landsat-9'
    sensor VARCHAR(50) NOT NULL, -- 'MSI', 'OLI-2'
    product_id VARCHAR(255) NOT NULL,
    processing_level VARCHAR(50) DEFAULT 'Level-2A',
    cloud_coverage_percent DOUBLE PRECISION CHECK (cloud_coverage_percent >= 0.0 AND cloud_coverage_percent <= 100.0),
    observation_area GEOMETRY(MultiPolygon, 4326),
    turbidity_proxy DOUBLE PRECISION,
    ndci_chlorophyll DOUBLE PRECISION CHECK (ndci_chlorophyll >= -1.0 AND ndci_chlorophyll <= 1.0),
    cdom_organic_matter DOUBLE PRECISION,
    ndwi_water_index DOUBLE PRECISION CHECK (ndwi_water_index >= -1.0 AND ndwi_water_index <= 1.0),
    awei_water_index DOUBLE PRECISION,
    cloud_mask_applied BOOLEAN DEFAULT TRUE,
    observed_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    quality_status VARCHAR(50) DEFAULT 'GOOD',
    validation_status VARCHAR(50) DEFAULT 'VALID',
    data_classification VARCHAR(50) DEFAULT 'STATIC_RESEARCH_DATA', -- 'LIVE', 'STATIC_RESEARCH_DATA', 'MODELED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_satellite_product UNIQUE (product_id, district_id)
);

CREATE TABLE IF NOT EXISTS land_surface_temperature (
    lst_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    satellite_platform VARCHAR(50) NOT NULL DEFAULT 'Terra/Aqua MODIS',
    product_id VARCHAR(255) NOT NULL,
    lst_day_celsius DOUBLE PRECISION NOT NULL CHECK (lst_day_celsius >= -20.0 AND lst_day_celsius <= 70.0),
    lst_night_celsius DOUBLE PRECISION CHECK (lst_night_celsius >= -30.0 AND lst_night_celsius <= 50.0),
    qc_flags JSONB,
    spatial_resolution_meters INTEGER DEFAULT 1000,
    observed_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    quality_status VARCHAR(50) DEFAULT 'GOOD',
    validation_status VARCHAR(50) DEFAULT 'VALID',
    data_classification VARCHAR(50) DEFAULT 'STATIC_RESEARCH_DATA',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_lst_product UNIQUE (product_id, district_id)
);

CREATE TABLE IF NOT EXISTS hydrological_observations (
    hydro_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    river_id VARCHAR(50) NOT NULL REFERENCES rivers(river_id) ON DELETE CASCADE,
    gauge_id VARCHAR(100) REFERENCES river_gauges(gauge_id) ON DELETE SET NULL,
    gauge_name VARCHAR(150),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    water_level_meters DOUBLE PRECISION NOT NULL,
    discharge_cusecs DOUBLE PRECISION CHECK (discharge_cusecs >= 0.0),
    flow_rate_m3s DOUBLE PRECISION CHECK (flow_rate_m3s >= 0.0),
    rainfall_past_24h_mm DOUBLE PRECISION CHECK (rainfall_past_24h_mm >= 0.0),
    flood_condition VARCHAR(50) DEFAULT 'Normal', -- 'Normal', 'Alert', 'Warning', 'Danger', 'Extreme'
    observed_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    quality_status VARCHAR(50) DEFAULT 'GOOD',
    validation_status VARCHAR(50) DEFAULT 'VALID',
    data_classification VARCHAR(50) DEFAULT 'STATIC RIVER GEOMETRY',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_hydro_gauge_time UNIQUE (river_id, gauge_name, observed_at)
);

CREATE TABLE IF NOT EXISTS water_quality_observations (
    sample_id VARCHAR(100) PRIMARY KEY,
    source_id VARCHAR(100) REFERENCES water_sources(source_id) ON DELETE SET NULL,
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    sample_location_name VARCHAR(200),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    ph DOUBLE PRECISION CHECK (ph >= 0.0 AND ph <= 14.0),
    turbidity_ntu DOUBLE PRECISION CHECK (turbidity_ntu >= 0.0),
    dissolved_oxygen_mgl DOUBLE PRECISION CHECK (dissolved_oxygen_mgl >= 0.0 AND dissolved_oxygen_mgl <= 30.0),
    conductivity_us_cm DOUBLE PRECISION CHECK (conductivity_us_cm >= 0.0),
    water_temperature_celsius DOUBLE PRECISION CHECK (water_temperature_celsius >= 0.0 AND water_temperature_celsius <= 50.0),
    residual_chlorine_mgl DOUBLE PRECISION CHECK (residual_chlorine_mgl >= 0.0),
    fecal_coliform_mpn_100ml INTEGER CHECK (fecal_coliform_mpn_100ml >= 0),
    ecoli_present BOOLEAN,
    observed_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    quality_status VARCHAR(50) DEFAULT 'GOOD',
    validation_status VARCHAR(50) DEFAULT 'VALID',
    verification_status VARCHAR(50) DEFAULT 'MODELED / RESEARCH BENCHMARK',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. HEALTH & EPIDEMIOLOGY
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS disease_types (
    disease_code VARCHAR(20) PRIMARY KEY, -- 'ADD', 'Cholera', 'Typhoid'
    common_name VARCHAR(100) NOT NULL,
    causative_agent VARCHAR(150) NOT NULL,
    transmission_route VARCHAR(200) NOT NULL,
    incubation_period_days VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS epidemiological_observations (
    surveillance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    disease_code VARCHAR(20) NOT NULL REFERENCES disease_types(disease_code) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    suspected_cases INTEGER DEFAULT 0 CHECK (suspected_cases >= 0),
    confirmed_cases INTEGER DEFAULT 0 CHECK (confirmed_cases >= 0),
    total_hospitalizations INTEGER DEFAULT 0 CHECK (total_hospitalizations >= 0),
    deaths INTEGER DEFAULT 0 CHECK (deaths >= 0),
    reporting_agency VARCHAR(150) DEFAULT 'EpiClim / IDSP Historical Registry',
    observed_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    quality_status VARCHAR(50) DEFAULT 'GOOD',
    validation_status VARCHAR(50) DEFAULT 'VALID',
    data_classification VARCHAR(50) DEFAULT 'HISTORICAL RESEARCH DATA',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_epi_district_period UNIQUE (district_id, disease_code, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS disease_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    disease_code VARCHAR(20) NOT NULL REFERENCES disease_types(disease_code) ON DELETE CASCADE,
    event_title VARCHAR(200) NOT NULL,
    outbreak_severity VARCHAR(50) DEFAULT 'Elevated', -- 'Moderate', 'High', 'Severe Epidemic'
    cases_affected INTEGER DEFAULT 0,
    event_start_date DATE NOT NULL,
    event_end_date DATE,
    source_citation VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. IOT WATER SENSOR INFRASTRUCTURE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sensors (
    sensor_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    water_source_id VARCHAR(100) REFERENCES water_sources(source_id) ON DELETE SET NULL,
    device_type VARCHAR(100) NOT NULL, -- 'Multi-Parameter Optical Sonde', 'Turbidity Sensor'
    hardware_model VARCHAR(100),
    firmware_version VARCHAR(50) DEFAULT 'v1.0.0-lora',
    location GEOMETRY(Point, 4326) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'NO_CONNECTION', -- 'ONLINE', 'OFFLINE', 'NO_CONNECTION', 'DEGRADED'
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    reading_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_id VARCHAR(100) NOT NULL REFERENCES sensors(sensor_id) ON DELETE CASCADE,
    parameter VARCHAR(50) NOT NULL, -- 'turbidity', 'ph', 'dissolved_oxygen', 'water_temp'
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(30) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    quality_status VARCHAR(50) DEFAULT 'GOOD',
    validation_status VARCHAR(50) DEFAULT 'VALID',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_sensor_reading_time UNIQUE (sensor_id, parameter, timestamp)
);

CREATE TABLE IF NOT EXISTS sensor_health (
    health_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_id VARCHAR(100) NOT NULL REFERENCES sensors(sensor_id) ON DELETE CASCADE,
    battery_percent INTEGER CHECK (battery_percent >= 0 AND battery_percent <= 100),
    signal_strength_dbm INTEGER,
    packet_loss_rate DOUBLE PRECISION,
    reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. MACHINE LEARNING, FEATURE SNAPSHOTS & PREDICTIONS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS model_versions (
    model_version_id VARCHAR(100) PRIMARY KEY,
    algorithm VARCHAR(100) NOT NULL, -- 'XGBoost Group-Stratified Classifier'
    disease_code VARCHAR(20) NOT NULL REFERENCES disease_types(disease_code) ON DELETE CASCADE,
    auc_roc DOUBLE PRECISION NOT NULL,
    pr_auc DOUBLE PRECISION NOT NULL,
    f1_score DOUBLE PRECISION NOT NULL,
    brier_score DOUBLE PRECISION NOT NULL,
    hyperparameters JSONB NOT NULL,
    training_dataset_summary VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    features JSONB NOT NULL,
    source_observation_ids JSONB NOT NULL,
    snapshot_timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predictions (
    prediction_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    disease_code VARCHAR(20) NOT NULL REFERENCES disease_types(disease_code) ON DELETE CASCADE,
    model_version_id VARCHAR(100) NOT NULL REFERENCES model_versions(model_version_id) ON DELETE CASCADE,
    snapshot_id UUID REFERENCES feature_snapshots(snapshot_id) ON DELETE SET NULL,
    predicted_risk_score DOUBLE PRECISION NOT NULL CHECK (predicted_risk_score >= 0.0 AND predicted_risk_score <= 1.0),
    risk_category VARCHAR(50) NOT NULL, -- 'Low', 'Moderate', 'High', 'Very High'
    confidence_interval_low DOUBLE PRECISION,
    confidence_interval_high DOUBLE PRECISION,
    forecast_start_date DATE NOT NULL,
    forecast_end_date DATE NOT NULL,
    prediction_timestamp TIMESTAMPTZ DEFAULT NOW(),
    data_quality_composite_score INTEGER CHECK (data_quality_composite_score >= 0 AND data_quality_composite_score <= 100),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prediction_factors (
    factor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id VARCHAR(100) NOT NULL REFERENCES predictions(prediction_id) ON DELETE CASCADE,
    factor_name VARCHAR(150) NOT NULL,
    contribution_weight VARCHAR(50) NOT NULL, -- e.g. '+28% Risk Contribution'
    severity VARCHAR(50) NOT NULL, -- 'critical', 'elevated', 'moderate', 'protective'
    scientific_rationale TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. PUBLIC HEALTH OPERATIONS & WASH INTERVENTIONS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS alerts (
    alert_id VARCHAR(100) PRIMARY KEY,
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    prediction_id VARCHAR(100) REFERENCES predictions(prediction_id) ON DELETE SET NULL,
    disease_code VARCHAR(20) NOT NULL REFERENCES disease_types(disease_code) ON DELETE CASCADE,
    risk_tier VARCHAR(50) NOT NULL,
    trigger_factor VARCHAR(255) NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    dispatched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id VARCHAR(100) NOT NULL REFERENCES alerts(alert_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'DISPATCHED', 'ESCALATED', 'ACKNOWLEDGED', 'RESOLVED'
    actor_name VARCHAR(150) DEFAULT 'Automated Telemetry Dispatcher',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interventions (
    intervention_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    alert_id VARCHAR(100) REFERENCES alerts(alert_id) ON DELETE SET NULL,
    wash_protocol_name VARCHAR(150) NOT NULL,
    actions_checklist JSONB NOT NULL,
    target_start_date DATE,
    status VARCHAR(50) DEFAULT 'RECOMMENDED', -- 'RECOMMENDED', 'IN_PROGRESS', 'COMPLETED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intervention_evidence (
    evidence_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intervention_id UUID NOT NULL REFERENCES interventions(intervention_id) ON DELETE CASCADE,
    evidence_type VARCHAR(100) NOT NULL, -- 'Chlorine Residual Test', 'Water Sample Lab Log', 'Field Report'
    metric_name VARCHAR(100) NOT NULL,
    value_recorded DOUBLE PRECISION NOT NULL,
    verified_by VARCHAR(150),
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
    resource_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL, -- 'Halazone Chlorine Dispersal Kits', 'Mobile RO Purification Barge'
    category VARCHAR(100) NOT NULL, -- 'WASH Supply', 'Clinical Diagnostics', 'Purification Equipment'
    unit_of_measure VARCHAR(50) NOT NULL,
    unit_cost_inr DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_allocations (
    allocation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intervention_id UUID NOT NULL REFERENCES interventions(intervention_id) ON DELETE CASCADE,
    resource_id VARCHAR(100) NOT NULL REFERENCES resources(resource_id) ON DELETE CASCADE,
    quantity_allocated INTEGER NOT NULL CHECK (quantity_allocated > 0),
    dispatched_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. DATA MANAGEMENT, FRESHNESS & INGESTION JOBS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS data_sources (
    source_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- 'weather', 'satellite_sentinel2', 'satellite_modis', 'hydrology', 'water_quality', 'epidemiology', 'census_svi', 'iot_sensors'
    provider VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL, -- 'LIVE', 'RECENT', 'STALE', 'STATIC', 'MODELED', 'SIMULATED', 'NOT_CONFIGURED', 'UNAVAILABLE'
    last_successful_fetch TIMESTAMPTZ,
    last_attempt TIMESTAMPTZ,
    next_expected_update TIMESTAMPTZ,
    update_frequency VARCHAR(100),
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    freshness_status VARCHAR(50),
    configuration_status VARCHAR(50) NOT NULL DEFAULT 'CONFIGURED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_ingestion_jobs (
    job_id VARCHAR(100) PRIMARY KEY,
    source_id VARCHAR(100) NOT NULL REFERENCES data_sources(source_id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL, -- 'QUEUED', 'RUNNING', 'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED', 'CANCELLED'
    records_received INTEGER DEFAULT 0,
    records_accepted INTEGER DEFAULT 0,
    records_rejected INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_message TEXT,
    duration_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_quality_scores (
    score_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(100) NOT NULL REFERENCES data_sources(source_id) ON DELETE CASCADE,
    freshness_score INTEGER CHECK (freshness_score >= 0 AND freshness_score <= 25),
    completeness_score INTEGER CHECK (completeness_score >= 0 AND completeness_score <= 25),
    validity_score INTEGER CHECK (validity_score >= 0 AND validity_score <= 25),
    source_reliability_score INTEGER CHECK (source_reliability_score >= 0 AND source_reliability_score <= 25),
    total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
    quality_tier VARCHAR(50) NOT NULL, -- 'EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'UNAVAILABLE'
    notes JSONB,
    scored_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_validation_results (
    validation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(100) NOT NULL REFERENCES data_sources(source_id) ON DELETE CASCADE,
    entity_name VARCHAR(100) NOT NULL,
    record_identifier VARCHAR(150),
    is_valid BOOLEAN NOT NULL,
    issues JSONB,
    validated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_provenance (
    provenance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id VARCHAR(100) NOT NULL REFERENCES predictions(prediction_id) ON DELETE CASCADE,
    source_id VARCHAR(100) NOT NULL REFERENCES data_sources(source_id) ON DELETE CASCADE,
    source_dataset_name VARCHAR(150) NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    quality_score INTEGER,
    is_fallback BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vulnerability_indicators (
    vulnerability_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    survey_source VARCHAR(50) NOT NULL DEFAULT 'NFHS-5 (2019-2021)',
    survey_year INTEGER NOT NULL DEFAULT 2020,
    svi_score DOUBLE PRECISION NOT NULL CHECK (svi_score >= 0.0 AND svi_score <= 1.0),
    unimproved_water_percent DOUBLE PRECISION,
    open_defecation_percent DOUBLE PRECISION,
    illiteracy_percent DOUBLE PRECISION,
    below_poverty_line_percent DOUBLE PRECISION,
    calculation_method VARCHAR(100) DEFAULT 'PCA (Principal Component Analysis)',
    completeness_percent DOUBLE PRECISION DEFAULT 98.5,
    quality_score INTEGER DEFAULT 92,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. SECURITY, RBAC & AUDIT LOGS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    role_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    permission_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    organization VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id VARCHAR(50) NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(150),
    actor_id VARCHAR(100) DEFAULT 'system',
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. SPATIAL & PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------

-- Spatial GiST Indexes
CREATE INDEX IF NOT EXISTS idx_states_boundary ON states USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_districts_centroid ON districts USING GIST (centroid);
CREATE INDEX IF NOT EXISTS idx_districts_boundary ON districts USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_villages_location ON villages USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_rivers_path ON rivers USING GIST (path_geometry);
CREATE INDEX IF NOT EXISTS idx_river_gauges_loc ON river_gauges USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_water_sources_loc ON water_sources USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_phcs_location ON phcs USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_hospitals_location ON hospitals USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_sensors_location ON sensors USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_satellite_obs_area ON satellite_observations USING GIST (observation_area);

-- Temporal & Filtering B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_weather_district_obs ON weather_observations (district_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_district_obs ON satellite_observations (district_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_lst_district_obs ON land_surface_temperature (district_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_hydro_river_obs ON hydrological_observations (river_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_wq_district_obs ON water_quality_observations (district_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_epi_district_disease ON epidemiological_observations (district_id, disease_code, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_readings_sensor_time ON sensor_readings (sensor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_district ON predictions (district_id, prediction_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_disease ON predictions (disease_code, prediction_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_district ON alerts (district_id, dispatched_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs (created_at DESC);
