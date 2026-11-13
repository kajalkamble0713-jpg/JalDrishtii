-- ==============================================================================
-- JalDrishti Migration 003: Field Operations, Water Samples, Laboratory & Feedback
-- Field Tasks, Water Samples, Chain of Custody, Lab Results, and Prediction Outcomes
-- ==============================================================================

-- 1. FIELD TASKS
CREATE TABLE IF NOT EXISTS field_tasks (
    task_id VARCHAR(100) PRIMARY KEY,
    alert_id VARCHAR(100) REFERENCES alerts(alert_id) ON DELETE SET NULL,
    prediction_id VARCHAR(100),
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    water_source_id VARCHAR(100) REFERENCES water_sources(source_id) ON DELETE SET NULL,
    assigned_worker_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    assigned_worker_name VARCHAR(150),
    assigned_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    task_type VARCHAR(100) NOT NULL, -- 'WATER_SOURCE_INVESTIGATION', 'SANITARY_SURVEY', 'RESIDUAL_CHLORINE_CHECK', 'EMERGENCY_SAMPLE_COLLECTION', 'OUTBREAK_VERIFICATION'
    priority VARCHAR(50) NOT NULL DEFAULT 'HIGH', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    deadline DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    checklist_items JSONB DEFAULT '[]'::jsonb,
    required_samples_count INTEGER DEFAULT 1,
    evidence_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 2. FIELD OBSERVATIONS
CREATE TABLE IF NOT EXISTS field_observations (
    observation_id VARCHAR(100) PRIMARY KEY,
    task_id VARCHAR(100) NOT NULL REFERENCES field_tasks(task_id) ON DELETE CASCADE,
    worker_id VARCHAR(100) NOT NULL,
    worker_name VARCHAR(150) NOT NULL,
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_accuracy DOUBLE PRECISION,
    location_verified BOOLEAN DEFAULT FALSE,
    observation_type VARCHAR(100) NOT NULL, -- 'CHECKLIST', 'VISUAL', 'SENSOR_READING', 'FIELD_MEASUREMENT', 'COMMUNITY_REPORT'
    field_name VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    unit VARCHAR(50),
    notes TEXT,
    file_reference VARCHAR(255),
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WATER SAMPLES
CREATE TABLE IF NOT EXISTS water_samples (
    sample_id VARCHAR(100) PRIMARY KEY, -- Format: JD-YYYY-DISTRICT-SEQUENCE
    task_id VARCHAR(100) REFERENCES field_tasks(task_id) ON DELETE SET NULL,
    alert_id VARCHAR(100) REFERENCES alerts(alert_id) ON DELETE SET NULL,
    prediction_id VARCHAR(100),
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    water_source_id VARCHAR(100) REFERENCES water_sources(source_id) ON DELETE SET NULL,
    collector_id VARCHAR(100) NOT NULL,
    collector_name VARCHAR(150) NOT NULL,
    sample_type VARCHAR(100) NOT NULL, -- 'DRINKING_WATER', 'RIVER_WATER', 'GROUNDWATER', 'RESERVOIR_WATER', 'TANK_WATER', 'PIPELINE_WATER', 'EFFLUENT'
    container_type VARCHAR(100) NOT NULL, -- 'STERILE_GLASS', 'STERILE_PET', 'AMBER_BOTTLE', 'CHEMICAL_JUG'
    preservation_method VARCHAR(100) NOT NULL, -- 'ICE_BOX_4C', 'SODIUM_THIOSULFATE', 'ACIDIFIED_HNO3', 'NONE'
    transport_condition VARCHAR(100) NOT NULL DEFAULT 'COLD_CHAIN_MAINTAINED', -- 'COLD_CHAIN_MAINTAINED', 'AMBIENT', 'QUESTIONABLE'
    collection_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_accuracy DOUBLE PRECISION,
    location_verified BOOLEAN DEFAULT FALSE,
    qc_status VARCHAR(50) NOT NULL DEFAULT 'VALID', -- 'VALID', 'QUESTIONABLE', 'REJECTED'
    qc_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'COLLECTED', -- 'COLLECTED', 'SEALED', 'HANDED_OVER', 'TRANSPORTED', 'RECEIVED_BY_LAB', 'TESTING', 'RESULT_AVAILABLE', 'VERIFIED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_sample_id UNIQUE (sample_id)
);

-- 4. CHAIN OF CUSTODY LOG
CREATE TABLE IF NOT EXISTS sample_custody (
    custody_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sample_id VARCHAR(100) NOT NULL REFERENCES water_samples(sample_id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL, -- 'COLLECTED', 'SEALED', 'HANDED_OVER', 'TRANSPORTED', 'RECEIVED_BY_LAB', 'TESTING', 'RESULT_AVAILABLE', 'VERIFIED'
    actor_id VARCHAR(100) NOT NULL,
    actor_name VARCHAR(150) NOT NULL,
    actor_role VARCHAR(100) NOT NULL,
    from_entity VARCHAR(150),
    to_entity VARCHAR(150),
    location VARCHAR(200),
    temperature_celsius DOUBLE PRECISION,
    condition_status VARCHAR(50) DEFAULT 'GOOD',
    notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. LABORATORIES REGISTRY
CREATE TABLE IF NOT EXISTS laboratories (
    lab_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    state_id VARCHAR(50) NOT NULL REFERENCES states(state_id) ON DELETE CASCADE,
    accreditation VARCHAR(100) NOT NULL, -- 'NABL_ACCREDITED', 'STATE_GOVT_RECOGNIZED', 'PHED_DISTRICT_LAB'
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    api_integration_status VARCHAR(50) NOT NULL DEFAULT 'NOT_CONFIGURED', -- 'LIVE', 'NOT_CONFIGURED', 'UNAVAILABLE'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LAB TESTS (Test parameters ordered for sample)
CREATE TABLE IF NOT EXISTS lab_tests (
    test_id VARCHAR(100) PRIMARY KEY,
    sample_id VARCHAR(100) NOT NULL REFERENCES water_samples(sample_id) ON DELETE CASCADE,
    lab_id VARCHAR(100) NOT NULL REFERENCES laboratories(lab_id) ON DELETE CASCADE,
    parameter_name VARCHAR(100) NOT NULL, -- 'pH', 'Turbidity', 'Residual Chlorine', 'E. coli', 'Total Coliform', 'Dissolved Oxygen', 'Conductivity'
    parameter_code VARCHAR(50) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    method VARCHAR(150) NOT NULL,
    reference_range_min DOUBLE PRECISION,
    reference_range_max DOUBLE PRECISION,
    reference_standard VARCHAR(100) DEFAULT 'BIS 10500:2012',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LAB RESULTS
CREATE TABLE IF NOT EXISTS lab_results (
    result_id VARCHAR(100) PRIMARY KEY,
    test_id VARCHAR(100) NOT NULL REFERENCES lab_tests(test_id) ON DELETE CASCADE,
    sample_id VARCHAR(100) NOT NULL REFERENCES water_samples(sample_id) ON DELETE CASCADE,
    parameter_name VARCHAR(100) NOT NULL,
    numeric_value DOUBLE PRECISION,
    qualitative_value VARCHAR(100),
    unit VARCHAR(50) NOT NULL,
    is_exceeded BOOLEAN DEFAULT FALSE,
    tested_by VARCHAR(150) NOT NULL,
    tested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'AMENDED'
    verified_by VARCHAR(150),
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LAB RESULT AMENDMENT HISTORY (Immutable Audit)
CREATE TABLE IF NOT EXISTS lab_result_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id VARCHAR(100) NOT NULL REFERENCES lab_results(result_id) ON DELETE CASCADE,
    amended_by VARCHAR(150) NOT NULL,
    previous_value TEXT NOT NULL,
    new_value TEXT NOT NULL,
    justification TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PREDICTION OUTCOMES (Ground Truth Epidemiology)
CREATE TABLE IF NOT EXISTS prediction_outcomes (
    prediction_outcome_id VARCHAR(100) PRIMARY KEY,
    prediction_id VARCHAR(100) NOT NULL,
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    state_id VARCHAR(50) NOT NULL REFERENCES states(state_id) ON DELETE CASCADE,
    disease VARCHAR(50) NOT NULL,
    prediction_date DATE NOT NULL,
    forecast_period VARCHAR(50) NOT NULL,
    predicted_risk_score DOUBLE PRECISION NOT NULL,
    predicted_risk_tier VARCHAR(50) NOT NULL,
    actual_outcome VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN', -- 'NO_EVENT', 'SUSPECTED_EVENT', 'CONFIRMED_EVENT', 'OUTBREAK_EVENT', 'UNKNOWN'
    confirmation_source VARCHAR(150),
    confirmation_date DATE,
    confirmed_cases_count INTEGER DEFAULT 0,
    related_alert_id VARCHAR(100) REFERENCES alerts(alert_id) ON DELETE SET NULL,
    related_task_id VARCHAR(100) REFERENCES field_tasks(task_id) ON DELETE SET NULL,
    related_sample_id VARCHAR(100) REFERENCES water_samples(sample_id) ON DELETE SET NULL,
    prediction_evidence_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'SUPPORTED', 'NOT_SUPPORTED', 'INCONCLUSIVE', 'PENDING'
    lead_time_days INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PREDICTION FEEDBACK (Model Performance Metrics)
CREATE TABLE IF NOT EXISTS prediction_feedback (
    feedback_id VARCHAR(100) PRIMARY KEY,
    disease VARCHAR(50) NOT NULL,
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE SET NULL,
    evaluation_period_start DATE NOT NULL,
    evaluation_period_end DATE NOT NULL,
    sample_size INTEGER NOT NULL DEFAULT 0,
    true_positives INTEGER NOT NULL DEFAULT 0,
    false_positives INTEGER NOT NULL DEFAULT 0,
    true_negatives INTEGER NOT NULL DEFAULT 0,
    false_negatives INTEGER NOT NULL DEFAULT 0,
    precision DOUBLE PRECISION,
    recall DOUBLE PRECISION,
    f1_score DOUBLE PRECISION,
    specificity DOUBLE PRECISION,
    brier_score DOUBLE PRECISION,
    avg_lead_time_days DOUBLE PRECISION,
    status VARCHAR(50) NOT NULL DEFAULT 'INSUFFICIENT_DATA', -- 'VALID_EVALUATION', 'INSUFFICIENT_DATA'
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. RESPONSE TIMELINES
CREATE TABLE IF NOT EXISTS response_timelines (
    timeline_id VARCHAR(100) PRIMARY KEY,
    prediction_id VARCHAR(100) NOT NULL,
    alert_id VARCHAR(100) REFERENCES alerts(alert_id) ON DELETE SET NULL,
    district_id VARCHAR(100) NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_duration_hours DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_field_tasks_district ON field_tasks(district_id);
CREATE INDEX IF NOT EXISTS idx_field_tasks_worker ON field_tasks(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_field_tasks_status ON field_tasks(status);
CREATE INDEX IF NOT EXISTS idx_water_samples_district ON water_samples(district_id);
CREATE INDEX IF NOT EXISTS idx_water_samples_status ON water_samples(status);
CREATE INDEX IF NOT EXISTS idx_water_samples_task ON water_samples(task_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_sample ON lab_results(sample_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_status ON lab_results(verification_status);
CREATE INDEX IF NOT EXISTS idx_prediction_outcomes_district ON prediction_outcomes(district_id);
CREATE INDEX IF NOT EXISTS idx_prediction_outcomes_disease ON prediction_outcomes(disease);
