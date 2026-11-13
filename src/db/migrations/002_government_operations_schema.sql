-- ==============================================================================
-- JalDrishti Migration 002: Government Operations and Response Management Layer
-- Roles, Geographic Authorization, Alerts Lifecycle, Interventions & Resources
-- ==============================================================================

-- 1. GOVERNMENT ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(50) NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id VARCHAR(50) NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- 2. GEOGRAPHIC ACCESS CONTROL
CREATE TABLE IF NOT EXISTS geographic_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    scope_type VARCHAR(50) NOT NULL, -- 'NATIONAL', 'STATE', 'DISTRICT', 'PHC'
    state_id VARCHAR(50) REFERENCES states(state_id) ON DELETE CASCADE,
    district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE,
    phc_id VARCHAR(100) REFERENCES phcs(phc_id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_user_geographic_assignment UNIQUE (user_id, scope_type, state_id, district_id, phc_id)
);

-- 3. ENHANCED ALERTS & ALERT LIFECYCLE
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS severity VARCHAR(50) DEFAULT 'HIGH';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'NEW';
-- 'NEW', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED', 'DISMISSED', 'EXPIRED'
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS risk_score DOUBLE PRECISION DEFAULT 0.75;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION DEFAULT 0.88;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS acknowledged_by UUID REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS closure_reason TEXT;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 1;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS data_quality_score INTEGER DEFAULT 85;

CREATE TABLE IF NOT EXISTS alert_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id VARCHAR(100) NOT NULL REFERENCES alerts(alert_id) ON DELETE CASCADE,
    from_status VARCHAR(50) NOT NULL,
    to_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    actor_name VARCHAR(150) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NOTIFICATIONS LOG
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id VARCHAR(100) REFERENCES alerts(alert_id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    recipient_email VARCHAR(255),
    channel VARCHAR(50) NOT NULL, -- 'IN_APP', 'EMAIL_STUB', 'SMS_STUB', 'WHATSAPP_STUB'
    status VARCHAR(50) DEFAULT 'DELIVERED', -- 'QUEUED', 'DELIVERED', 'FAILED'
    message TEXT NOT NULL,
    failure_reason TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENHANCED INTERVENTIONS
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'Water Testing & Source Inspection';
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'HIGH'; -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS assigned_department VARCHAR(100) DEFAULT 'Public Health Engineering Department';
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS assigned_officer_id UUID REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS location VARCHAR(200);
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS supervisor_notes TEXT;

-- 6. INTERVENTION EVIDENCE VERIFICATION
ALTER TABLE intervention_evidence ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE intervention_evidence ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE intervention_evidence ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE intervention_evidence ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE intervention_evidence ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 7. ENHANCED RESOURCES & LOGISTICS
ALTER TABLE resources ADD COLUMN IF NOT EXISTS district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE SET NULL;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS available_quantity INTEGER DEFAULT 100;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER DEFAULT 0;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS minimum_stock INTEGER DEFAULT 20;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS last_audited_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE resource_allocations ADD COLUMN IF NOT EXISTS district_id VARCHAR(100) REFERENCES districts(district_id) ON DELETE CASCADE;
ALTER TABLE resource_allocations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'RECOMMENDED'; -- 'RECOMMENDED', 'APPROVED', 'DISPATCHED', 'DELIVERED'
ALTER TABLE resource_allocations ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE resource_allocations ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- 8. INDEXES FOR OPERATIONAL PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_geo_assignments_user ON geographic_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_geo_assignments_district ON geographic_assignments(district_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alert_history_alert ON alert_history(alert_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions(status);
CREATE INDEX IF NOT EXISTS idx_interventions_district ON interventions(district_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(recipient_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_district ON resources(district_id);
