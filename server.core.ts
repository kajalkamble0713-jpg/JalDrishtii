/**
 * JalDrishti Full-Stack Application Server
 * Serves complete versioned REST APIs (/api/v1/*), PostgreSQL/PostGIS integration,
 * Government Operations & Response Management Layer (RBAC, Alerts, Interventions, Resources, Audit),
 * OpenAPI documentation, and mounts Vite development middleware on port 3000.
 */

import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Spatial Database & Repositories
import { DatabaseManager } from './src/db/connection.js';
import { seedDatabase } from './src/db/seed.js';
import { GeographicRepository } from './src/db/repositories/geographicRepository.js';
import { EnvironmentalRepository } from './src/db/repositories/environmentalRepository.js';
import { HealthRepository } from './src/db/repositories/healthRepository.js';
import { IoTRepository } from './src/db/repositories/iotRepository.js';
import { MLRepository } from './src/db/repositories/mlRepository.js';
import { OperationsRepository } from './src/db/repositories/operationsRepository.js';
import { DataManagementRepository } from './src/db/repositories/dataManagementRepository.js';
import { SecurityRepository } from './src/db/repositories/securityRepository.js';

// Government Operations Engines
import { RbacEngine, DEMO_GOVERNMENT_OFFICERS, ROLE_PERMISSIONS, Permission } from './src/services/auth/rbacEngine.js';
import { AlertEngine, AlertStatus, AlertSeverity } from './src/services/operations/alertEngine.js';
import { InterventionEngine, InterventionStatus, InterventionPriority, InterventionType } from './src/services/operations/interventionEngine.js';
import { ResourceEngine } from './src/services/operations/resourceEngine.js';
import { AuditEngine } from './src/services/operations/auditEngine.js';
import { TriageEngine } from './src/services/operations/triageEngine.js';
import { FieldOperationsEngine } from './src/services/operations/fieldOperationsEngine.js';
import { WaterSampleEngine } from './src/services/operations/waterSampleEngine.js';
import { LabVerificationEngine } from './src/services/operations/labVerificationEngine.js';
import { PredictionOutcomeEngine } from './src/services/operations/predictionOutcomeEngine.js';
import { ComparisonEngine } from './src/services/operations/comparisonEngine.js';
import { FieldLabRepository } from './src/db/repositories/fieldLabRepository.js';

// Telemetry & Scheduler Singletons
import { DataProviderRegistry } from './src/services/data/registry.js';
import { IngestionScheduler } from './src/services/data/scheduler/IngestionScheduler.js';
import { MLFeatureStore } from './src/services/data/ml/FeatureStore.js';
import { DISTRICTS_DATA } from './src/data/jaldrishtiData.js';
import { DiseaseType } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Singletons & Repositories
const dbManager = DatabaseManager.getInstance();
const registry = DataProviderRegistry.getInstance();
const scheduler = IngestionScheduler.getInstance();
const featureStore = MLFeatureStore.getInstance();

const geoRepo = GeographicRepository.getInstance();
const envRepo = EnvironmentalRepository.getInstance();
const healthRepo = HealthRepository.getInstance();
const iotRepo = IoTRepository.getInstance();
const mlRepo = MLRepository.getInstance();
const opsRepo = OperationsRepository.getInstance();
const dataMgmtRepo = DataManagementRepository.getInstance();
const secRepo = SecurityRepository.getInstance();
const fieldLabRepo = FieldLabRepository.getInstance();

// Government Operations Singletons
const rbac = RbacEngine.getInstance();
const alertEngine = AlertEngine.getInstance();
const intEngine = InterventionEngine.getInstance();
const resourceEngine = ResourceEngine.getInstance();
const auditEngine = AuditEngine.getInstance();
const triageEngine = TriageEngine.getInstance();
const fieldEngine = FieldOperationsEngine.getInstance();
const sampleEngine = WaterSampleEngine.getInstance();
const labEngine = LabVerificationEngine.getInstance();
const outcomeEngine = PredictionOutcomeEngine.getInstance();
const comparisonEngine = ComparisonEngine.getInstance();

// Auto-test DB connection asynchronously on server boot
(async () => {
  try {
    const isConnected = await dbManager.testConnection();
    if (isConnected) {
      console.info('[Server] Connected to PostgreSQL. Verifying PostGIS and running migrations...');
      await dbManager.runMigrations();
      await seedDatabase();
      console.info('[Server] PostgreSQL + PostGIS database migrations and reference seeding complete.');
    } else {
      console.info('[Server] Operating in High-Performance In-Memory Repository mode (DATABASE_URL pending/offline).');
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Server] DB initialization notice:', msg);
  }
})();

// ====================================================================
// REST API v1 Routes
// ====================================================================

// 1. System Health
app.get('/api/v1/health', (_req: Request, res: Response) => {
  const dbStatus = dbManager.getStatus();
  res.json({
    status: 'HEALTHY',
    service: 'JalDrishti Waterborne Outbreak Telemetry Observatory',
    version: '2.6.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database: {
      connected: dbStatus.isConnected,
      postgisInstalled: dbStatus.postgisInstalled,
      mode: dbStatus.isConnected ? 'POSTGRESQL_POSTGIS' : 'IN_MEMORY_FALLBACK',
    },
    governmentOperations: {
      status: 'OPERATIONAL',
      activeOfficer: rbac.getCurrentUser().fullName,
      jurisdiction: rbac.getCurrentUser().assignment.jurisdictionName,
    },
  });
});

// 2. Database Status & Management
app.get('/api/v1/database/status', (_req: Request, res: Response) => {
  res.json(dbManager.getStatus());
});

app.post('/api/v1/database/migrate', async (_req: Request, res: Response) => {
  const isConnected = await dbManager.testConnection();
  if (!isConnected) {
    res.status(503).json({
      success: false,
      message: 'PostgreSQL is not connected. Configure DATABASE_URL in environment.',
      status: dbManager.getStatus(),
    });
    return;
  }
  const executed = await dbManager.runMigrations();
  res.json({ success: true, migrationsExecuted: executed });
});

app.post('/api/v1/database/seed', async (_req: Request, res: Response) => {
  const result = await seedDatabase();
  res.json({ success: true, seededCounts: result });
});

// 3. Government RBAC, Officers & Session Management
app.get('/api/v1/auth/session', (_req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  res.json({
    user,
    permissions,
    activeJurisdiction: user.assignment,
  });
});

app.post('/api/v1/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'Missing userId parameter' });
    return;
  }
  const prevUser = rbac.getCurrentUser();
  const newUser = rbac.setCurrentUserById(userId);

  auditEngine.record({
    user: newUser,
    action: 'DEMO_OFFICER_SWITCH',
    entityType: 'SESSION_AUTH',
    beforeValue: { userId: prevUser.userId, role: prevUser.role },
    afterValue: { userId: newUser.userId, role: newUser.role },
    details: { switchedAt: new Date().toISOString() },
  });

  res.json({
    message: 'Active officer profile switched successfully',
    user: newUser,
    permissions: ROLE_PERMISSIONS[newUser.role] || [],
  });
});

app.get('/api/v1/auth/officers', (_req: Request, res: Response) => {
  res.json({ officers: DEMO_GOVERNMENT_OFFICERS });
});

app.get('/api/v1/roles', (_req: Request, res: Response) => {
  res.json({ roles: Object.keys(ROLE_PERMISSIONS), rolePermissions: ROLE_PERMISSIONS });
});

app.get('/api/v1/permissions', (_req: Request, res: Response) => {
  const allPermissions: Permission[] = [
    'VIEW_RISK',
    'VIEW_PREDICTIONS',
    'VIEW_ALERTS',
    'CREATE_ALERT',
    'ACKNOWLEDGE_ALERT',
    'ASSIGN_INTERVENTION',
    'MANAGE_INTERVENTION',
    'MANAGE_RESOURCES',
    'UPLOAD_SAMPLE',
    'VIEW_LAB_RESULTS',
    'MANAGE_USERS',
    'VIEW_AUDIT_LOGS',
    'EXPORT_REPORTS',
    'MANAGE_MODELS',
    'MANAGE_DATA_SOURCES',
    'SYSTEM_ADMIN',
  ];
  res.json({ permissions: allPermissions });
});

// 4. Geographic Resources (Districts, States, Rivers, Water Sources)
app.get('/api/v1/districts', async (req: Request, res: Response) => {
  const result = await geoRepo.getDistricts({
    state: req.query.state as string,
    search: req.query.search as string,
  });
  res.json({ count: result.total, districts: result.districts });
});

app.get('/api/v1/districts/:id', async (req: Request, res: Response) => {
  const district = await geoRepo.getDistrictById(req.params.id);
  if (!district) {
    res.status(404).json({ error: 'District not found' });
    return;
  }
  res.json(district);
});

app.get('/api/v1/states', async (_req: Request, res: Response) => {
  const states = await geoRepo.getStates();
  res.json({ count: states.length, states });
});

app.get('/api/v1/villages', async (req: Request, res: Response) => {
  const districtId = req.query.districtId as string | undefined;
  const villages = await geoRepo.getVillages(districtId);
  res.json({ count: villages.length, villages });
});

app.get('/api/v1/rivers', async (_req: Request, res: Response) => {
  const rivers = await geoRepo.getRivers();
  res.json({ count: rivers.length, rivers });
});

app.get('/api/v1/river-basins', async (_req: Request, res: Response) => {
  const basins = await geoRepo.getRiverBasins();
  res.json({ count: basins.length, basins });
});

app.get('/api/v1/water-sources', async (req: Request, res: Response) => {
  const districtId = req.query.districtId as string | undefined;
  const sources = await geoRepo.getWaterSources(districtId);
  res.json({ count: sources.length, sources });
});

// 5. Government Alerts & Lifecycle Endpoints
app.get('/api/v1/alerts', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const districtId = req.query.districtId as string | undefined;
  const stateId = req.query.stateId as string | undefined;
  const status = req.query.status as AlertStatus | undefined;
  const severity = req.query.severity as AlertSeverity | undefined;
  const disease = req.query.disease as DiseaseType | undefined;

  let alerts = alertEngine.getAlerts({ districtId, stateId, status, severity, disease });

  // Enforce Geographic Access:
  if (user.assignment.scopeType === 'STATE' && user.assignment.stateId) {
    alerts = alerts.filter((a) => a.state.toLowerCase() === user.assignment.stateId?.toLowerCase());
  } else if (
    (user.assignment.scopeType === 'DISTRICT' || user.assignment.scopeType === 'PHC') &&
    user.assignment.districtId
  ) {
    alerts = alerts.filter((a) => a.districtId === user.assignment.districtId);
  }

  res.json({ count: alerts.length, alerts });
});

// Alert CSV Export for Official Reporting
app.get('/api/v1/alerts/export', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'EXPORT_REPORTS' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const districtId = req.query.districtId as string | undefined;
  const stateId = req.query.stateId as string | undefined;
  const status = req.query.status as AlertStatus | undefined;
  const severity = req.query.severity as AlertSeverity | undefined;
  const disease = req.query.disease as DiseaseType | undefined;

  let effectiveDistrictId = districtId;
  let effectiveStateId = stateId;

  // Enforce Geographic Scoping:
  if (user.assignment.scopeType === 'STATE' && user.assignment.stateId) {
    effectiveStateId = user.assignment.stateId;
  } else if (
    (user.assignment.scopeType === 'DISTRICT' || user.assignment.scopeType === 'PHC') &&
    user.assignment.districtId
  ) {
    effectiveDistrictId = user.assignment.districtId;
  }

  const csv = alertEngine.exportCsv({
    districtId: effectiveDistrictId,
    stateId: effectiveStateId,
    status,
    severity,
    disease,
  });

  auditEngine.record({
    user,
    action: 'EXPORT_REPORTS',
    entityType: 'ALERT_REPORT_CSV',
    entityId: effectiveDistrictId || effectiveStateId || 'ALL_INDIA',
    details: { format: 'CSV', reportType: 'OFFICIAL_ALERT_DATA', districtId: effectiveDistrictId, stateId: effectiveStateId },
  });

  res.header('Content-Type', 'text/csv');
  res.attachment(`jaldrishti_alerts_report_${effectiveDistrictId || effectiveStateId || 'national'}_${Date.now()}.csv`);
  res.send(csv);
});

app.get('/api/v1/alerts/:id', (req: Request, res: Response) => {
  const alert = alertEngine.getAlertById(req.params.id);
  if (!alert) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }
  res.json(alert);
});

app.post('/api/v1/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const alert = alertEngine.getAlertById(req.params.id);
  if (!alert) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }

  const auth = rbac.authorizeAction({
    permission: 'ACKNOWLEDGE_ALERT',
    targetDistrictId: alert.districtId,
    targetStateId: alert.state,
  });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const notes = req.body?.notes as string | undefined;
  const result = alertEngine.acknowledgeAlert(req.params.id, user, notes);

  if (result.success && result.alert) {
    auditEngine.record({
      user,
      action: 'ALERT_ACKNOWLEDGED',
      entityType: 'GOVERNMENT_ALERT',
      entityId: alert.alertId,
      details: { district: alert.districtName, severity: alert.severity, notes },
    });
  }

  res.json(result);
});

app.post('/api/v1/alerts/:id/assign', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const alert = alertEngine.getAlertById(req.params.id);
  if (!alert) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }

  const auth = rbac.authorizeAction({
    permission: 'ASSIGN_INTERVENTION',
    targetDistrictId: alert.districtId,
    targetStateId: alert.state,
  });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const { assigneeName, assigneeId, notes } = req.body;
  if (!assigneeName) {
    res.status(400).json({ error: 'Missing assigneeName' });
    return;
  }

  const result = alertEngine.assignAlert(req.params.id, user, assigneeName, assigneeId, notes);
  if (result.success && result.alert) {
    auditEngine.record({
      user,
      action: 'ALERT_ASSIGNED',
      entityType: 'GOVERNMENT_ALERT',
      entityId: alert.alertId,
      details: { assigneeName, notes },
    });
  }

  res.json(result);
});

app.post('/api/v1/alerts/:id/escalate', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const alert = alertEngine.getAlertById(req.params.id);
  if (!alert) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }

  const auth = rbac.authorizeAction({
    permission: 'ACKNOWLEDGE_ALERT',
    targetDistrictId: alert.districtId,
    targetStateId: alert.state,
  });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const escalateToTier = req.body?.escalateToTier ? parseInt(req.body.escalateToTier, 10) : 2;
  const reason = (req.body?.reason as string) || 'Condition elevated per officer assessment';

  const result = alertEngine.escalateAlert(req.params.id, user, escalateToTier, reason);
  if (result.success && result.alert) {
    auditEngine.record({
      user,
      action: 'ALERT_ESCALATED',
      entityType: 'GOVERNMENT_ALERT',
      entityId: alert.alertId,
      details: { escalateToTier, reason },
    });
  }

  res.json(result);
});

app.post('/api/v1/alerts/:id/close', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const alert = alertEngine.getAlertById(req.params.id);
  if (!alert) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }

  const auth = rbac.authorizeAction({
    permission: 'MANAGE_INTERVENTION',
    targetDistrictId: alert.districtId,
    targetStateId: alert.state,
  });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const reason = req.body?.reason as string;
  if (!reason || reason.trim().length === 0) {
    res.status(400).json({ error: 'Mandatory closureReason justification required to close alert' });
    return;
  }

  const targetStatus = (req.body?.status as 'RESOLVED' | 'CLOSED' | 'DISMISSED') || 'RESOLVED';
  const result = alertEngine.closeAlert(req.params.id, user, reason, targetStatus);

  if (result.success && result.alert) {
    auditEngine.record({
      user,
      action: 'ALERT_CLOSED',
      entityType: 'GOVERNMENT_ALERT',
      entityId: alert.alertId,
      details: { targetStatus, reason },
    });
  }

  res.json(result);
});

// 6. Interventions & Field Task Management
app.get('/api/v1/interventions', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const districtId = req.query.districtId as string | undefined;
  const status = req.query.status as InterventionStatus | undefined;
  const priority = req.query.priority as InterventionPriority | undefined;

  let items = intEngine.getInterventions({ districtId, status, priority });

  // Geographic filtering
  if (user.assignment.scopeType === 'STATE' && user.assignment.stateId) {
    items = items.filter((i) => i.districtId.toLowerCase().includes(user.assignment.stateId!.toLowerCase()));
  } else if (
    (user.assignment.scopeType === 'DISTRICT' || user.assignment.scopeType === 'PHC') &&
    user.assignment.districtId
  ) {
    items = items.filter((i) => i.districtId === user.assignment.districtId);
  }

  res.json({ count: items.length, interventions: items });
});

app.get('/api/v1/interventions/:id', (req: Request, res: Response) => {
  const item = intEngine.getInterventionById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Intervention not found' });
    return;
  }
  res.json(item);
});

app.post('/api/v1/interventions', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const { alertId, districtId, districtName, type, description, priority, assignedDepartment, assignedOfficerName, location, deadline } = req.body;

  if (!districtId || !type || !description) {
    res.status(400).json({ error: 'Missing required intervention fields' });
    return;
  }

  const auth = rbac.authorizeAction({
    permission: 'ASSIGN_INTERVENTION',
    targetDistrictId: districtId,
  });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const created = intEngine.createIntervention({
    alertId,
    districtId,
    districtName: districtName || 'Patna',
    type: type as InterventionType,
    description,
    priority: (priority as InterventionPriority) || 'HIGH',
    assignedDepartment: assignedDepartment || 'Public Health Engineering Department',
    assignedOfficerName: assignedOfficerName || user.fullName,
    location: location || 'District Water Supply Node',
    deadline: deadline || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
  });

  auditEngine.record({
    user,
    action: 'INTERVENTION_CREATED',
    entityType: 'GOVERNMENT_INTERVENTION',
    entityId: created.interventionId,
    details: { type: created.type, districtId: created.districtId, priority: created.priority },
  });

  res.status(201).json(created);
});

app.post('/api/v1/interventions/:id/status', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const item = intEngine.getInterventionById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Intervention not found' });
    return;
  }

  const auth = rbac.authorizeAction({
    permission: 'MANAGE_INTERVENTION',
    targetDistrictId: item.districtId,
  });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const { status, notes } = req.body;
  const result = intEngine.updateStatus(req.params.id, status as InterventionStatus, user, notes);

  if (result.success && result.intervention) {
    auditEngine.record({
      user,
      action: 'INTERVENTION_STATUS_UPDATE',
      entityType: 'GOVERNMENT_INTERVENTION',
      entityId: item.interventionId,
      details: { newStatus: status, notes },
    });
  }

  res.json(result);
});

app.post('/api/v1/interventions/:id/evidence', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const item = intEngine.getInterventionById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Intervention not found' });
    return;
  }

  const auth = rbac.authorizeAction({
    permission: 'UPLOAD_SAMPLE',
    targetDistrictId: item.districtId,
  });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const { location, fileType, fileReference, description } = req.body;
  if (!fileType || !description) {
    res.status(400).json({ error: 'Missing fileType or description' });
    return;
  }

  const result = intEngine.uploadEvidence({
    interventionId: req.params.id,
    uploadedBy: user,
    location: location || item.location,
    fileType,
    fileReference: fileReference || `FILE_${Date.now()}.pdf`,
    description,
  });

  if (result.success && result.evidence) {
    auditEngine.record({
      user,
      action: 'EVIDENCE_UPLOADED',
      entityType: 'INTERVENTION_EVIDENCE',
      entityId: result.evidence.evidenceId,
      details: { interventionId: item.interventionId, fileType, description },
    });
  }

  res.status(201).json(result);
});

app.post('/api/v1/interventions/:id/verify', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const item = intEngine.getInterventionById(req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Intervention not found' });
    return;
  }

  const auth = rbac.authorizeAction({
    permission: 'MANAGE_INTERVENTION',
    targetDistrictId: item.districtId,
  });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const { evidenceId, isApproved, notes } = req.body;
  if (!evidenceId) {
    res.status(400).json({ error: 'Missing evidenceId' });
    return;
  }

  const result = intEngine.verifyEvidence({
    interventionId: req.params.id,
    evidenceId,
    supervisor: user,
    isApproved: Boolean(isApproved),
    notes: notes || 'Supervisor verified against photographic and lab audit benchmarks.',
  });

  if (result.success && result.intervention) {
    auditEngine.record({
      user,
      action: isApproved ? 'EVIDENCE_VERIFIED_APPROVED' : 'EVIDENCE_VERIFIED_REJECTED',
      entityType: 'INTERVENTION_EVIDENCE',
      entityId: evidenceId,
      details: { interventionId: item.interventionId, isApproved, notes },
    });
  }

  res.json(result);
});

// 7. Resource Logistics & Prioritized Allocation
app.get('/api/v1/resources', (req: Request, res: Response) => {
  const districtId = req.query.districtId as string | undefined;
  const items = resourceEngine.getInventory(districtId);
  res.json({ count: items.length, resources: items });
});

app.get('/api/v1/resources/shortages', (_req: Request, res: Response) => {
  const shortages = resourceEngine.getShortageAlerts();
  res.json({ count: shortages.length, shortages });
});

app.get('/api/v1/resources/allocations', (_req: Request, res: Response) => {
  const list = resourceEngine.getAllocations();
  res.json({ count: list.length, allocations: list });
});

app.post('/api/v1/resources/allocations/:id/approve', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'MANAGE_RESOURCES' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const result = resourceEngine.approveAllocation(req.params.id, user);
  if (result.success && result.allocation) {
    auditEngine.record({
      user,
      action: 'RESOURCE_ALLOCATION_APPROVED',
      entityType: 'RESOURCE_ALLOCATION',
      entityId: req.params.id,
      details: { quantity: result.allocation.allocatedQuantity, district: result.allocation.districtName },
    });
  }

  res.json(result);
});

// 8. Triage & Multi-Criteria District Prioritization
app.get('/api/v1/triage', (_req: Request, res: Response) => {
  const triage = triageEngine.computeDistrictTriage();
  res.json({ count: triage.length, triage });
});

// District Triage & Metrics CSV Export for Official Reporting
app.get('/api/v1/triage/export', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'EXPORT_REPORTS' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  let effectiveDistrictId = req.query.districtId as string | undefined;
  let effectiveStateId = req.query.stateId as string | undefined;

  // Enforce Geographic Scoping:
  if (user.assignment.scopeType === 'STATE' && user.assignment.stateId) {
    effectiveStateId = user.assignment.stateId;
  } else if (
    (user.assignment.scopeType === 'DISTRICT' || user.assignment.scopeType === 'PHC') &&
    user.assignment.districtId
  ) {
    effectiveDistrictId = user.assignment.districtId;
  }

  const csv = triageEngine.exportCsv({
    stateId: effectiveStateId,
    districtId: effectiveDistrictId,
  });

  auditEngine.record({
    user,
    action: 'EXPORT_REPORTS',
    entityType: 'DISTRICT_METRICS_REPORT_CSV',
    entityId: effectiveDistrictId || effectiveStateId || 'ALL_INDIA',
    details: { format: 'CSV', reportType: 'OFFICIAL_DISTRICT_METRICS', districtId: effectiveDistrictId, stateId: effectiveStateId },
  });

  res.header('Content-Type', 'text/csv');
  res.attachment(`jaldrishti_district_metrics_${effectiveDistrictId || effectiveStateId || 'all_districts'}_${Date.now()}.csv`);
  res.send(csv);
});

// 9. In-App Notifications
app.get('/api/v1/notifications', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const notifs = alertEngine.getNotifications(limit);
  res.json({ count: notifs.length, notifications: notifs });
});

// 10. Audit Logging & Export
app.get('/api/v1/audit/logs', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'VIEW_AUDIT_LOGS' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const action = req.query.action as string | undefined;
  const entityType = req.query.entityType as string | undefined;
  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;

  const logs = auditEngine.getLogs({ action, entityType, startDate, endDate });
  res.json({ count: logs.length, logs });
});

app.get('/api/v1/audit/export', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'EXPORT_REPORTS' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const csv = auditEngine.exportCsv();
  res.header('Content-Type', 'text/csv');
  res.attachment(`jaldrishti_audit_trail_${Date.now()}.csv`);
  res.send(csv);
});

// 10B. Historical Baseline vs Real-Time Observations Comparison & Difference API
app.get('/api/v1/comparison', (req: Request, res: Response) => {
  const disease = req.query.disease as DiseaseType | undefined;
  const mode = req.query.mode as any;
  const stateId = req.query.stateId as string | undefined;
  const statusFilter = req.query.status as any;

  const comparisons = comparisonEngine.computeComparison({
    disease,
    mode,
    stateId,
    statusFilter,
  });
  const summary = comparisonEngine.computeSummary(comparisons);

  res.json({
    count: comparisons.length,
    summary,
    comparisons,
  });
});

app.get('/api/v1/comparison/export', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'EXPORT_REPORTS' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const disease = req.query.disease as DiseaseType | undefined;
  const mode = req.query.mode as any;
  let stateId = req.query.stateId as string | undefined;

  // Enforce Geographic Scoping:
  if (user.assignment.scopeType === 'STATE' && user.assignment.stateId) {
    stateId = user.assignment.stateId;
  }

  const csv = comparisonEngine.exportCsv({
    disease,
    mode,
    stateId: stateId === 'ALL' ? undefined : stateId,
  });

  auditEngine.record({
    user,
    action: 'EXPORT_REPORTS',
    entityType: 'COMPARISON_DIFF_REPORT_CSV',
    entityId: stateId || 'ALL_INDIA',
    details: { format: 'CSV', reportType: 'OLD_VS_NEW_COMPARISON', stateId, disease, mode },
  });

  res.header('Content-Type', 'text/csv');
  res.attachment(`jaldrishti_comparison_diff_${stateId || 'all_districts'}_${Date.now()}.csv`);
  res.send(csv);
});

// 10A. Field Operations & Investigation Tasks API
app.get('/api/v1/field/tasks', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const workerId = req.query.workerId as string | undefined;
  const districtId = req.query.districtId as string | undefined;
  const status = req.query.status as any;
  const priority = req.query.priority as any;

  let tasks = fieldEngine.getTasks({ workerId, districtId, status, priority });

  // Geographic and Role Scoping:
  if (user.role === 'FIELD_WORKER') {
    tasks = tasks.filter((t) => t.assignedWorkerId === user.userId);
  } else if (user.assignment.scopeType === 'DISTRICT' && user.assignment.districtId) {
    tasks = tasks.filter((t) => t.districtId === user.assignment.districtId);
  } else if (user.assignment.scopeType === 'STATE' && user.assignment.stateId) {
    tasks = tasks.filter((t) => t.state.toLowerCase() === user.assignment.stateId?.toLowerCase());
  }

  res.json({ count: tasks.length, tasks });
});

app.get('/api/v1/field/tasks/:id', (req: Request, res: Response) => {
  const task = fieldEngine.getTaskById(req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Field task not found' });
    return;
  }
  res.json(task);
});

app.post('/api/v1/field/tasks', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'MANAGE_FIELD_TASKS' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const {
    alertId,
    predictionId,
    districtId,
    districtName,
    state,
    waterSourceId,
    waterSourceName,
    assignedWorkerId,
    assignedWorkerName,
    title,
    description,
    taskType,
    priority,
    deadline,
    requiredSamplesCount,
    evidenceRequirements,
  } = req.body;

  if (!districtId || !title || !description || !taskType) {
    res.status(400).json({ error: 'Missing required field task parameters' });
    return;
  }

  const task = fieldEngine.createTask({
    alertId,
    predictionId,
    districtId,
    districtName: districtName || 'District',
    state: state || 'Bihar',
    waterSourceId,
    waterSourceName,
    assignedWorkerId: assignedWorkerId || user.userId,
    assignedWorkerName: assignedWorkerName || user.fullName,
    assignedBy: `${user.fullName} (${user.designation})`,
    title,
    description,
    taskType,
    priority: priority || 'HIGH',
    deadline: deadline || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    requiredSamplesCount,
    evidenceRequirements,
  });

  auditEngine.record({
    user,
    action: 'FIELD_TASK_DISPATCHED',
    entityType: 'FIELD_TASK',
    entityId: task.taskId,
    details: { title: task.title, districtId: task.districtId, assignedWorkerName: task.assignedWorkerName },
  });

  res.status(201).json(task);
});

app.patch('/api/v1/field/tasks/:id/checklist', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const { checklistItems, notes } = req.body;

  if (!Array.isArray(checklistItems)) {
    res.status(400).json({ error: 'checklistItems must be an array' });
    return;
  }

  const result = fieldEngine.updateTaskChecklist(req.params.id, checklistItems, notes);
  if (!result.success) {
    res.status(404).json({ error: result.error });
    return;
  }

  auditEngine.record({
    user,
    action: 'FIELD_CHECKLIST_SUBMITTED',
    entityType: 'FIELD_TASK',
    entityId: req.params.id,
    details: { completedItemsCount: checklistItems.filter((c: any) => c.completed).length, notes },
  });

  res.json(result);
});

app.patch('/api/v1/field/tasks/:id/status', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ error: 'Missing status parameter' });
    return;
  }

  const result = fieldEngine.updateTaskStatus(req.params.id, status);
  if (!result.success) {
    res.status(404).json({ error: result.error });
    return;
  }

  auditEngine.record({
    user,
    action: 'FIELD_TASK_STATUS_UPDATED',
    entityType: 'FIELD_TASK',
    entityId: req.params.id,
    details: { newStatus: status },
  });

  res.json(result);
});

app.get('/api/v1/field/observations', (req: Request, res: Response) => {
  const taskId = req.query.taskId as string | undefined;
  const observations = fieldEngine.getObservations(taskId);
  res.json({ count: observations.length, observations });
});

app.post('/api/v1/field/observations', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'SUBMIT_FIELD_OBSERVATIONS' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const { taskId, latitude, longitude, locationAccuracy, observationType, fieldName, value, unit, notes, fileReference } = req.body;

  if (!taskId || !fieldName || value === undefined) {
    res.status(400).json({ error: 'Missing taskId, fieldName, or value' });
    return;
  }

  const observation = fieldEngine.recordObservation({
    taskId,
    worker: user,
    latitude: latitude !== undefined ? parseFloat(latitude) : null,
    longitude: longitude !== undefined ? parseFloat(longitude) : null,
    locationAccuracy: locationAccuracy !== undefined ? parseFloat(locationAccuracy) : null,
    observationType: observationType || 'FIELD_MEASUREMENT',
    fieldName,
    value: String(value),
    unit,
    notes,
    fileReference,
  });

  auditEngine.record({
    user,
    action: 'FIELD_OBSERVATION_RECORDED',
    entityType: 'FIELD_OBSERVATION',
    entityId: observation.observationId,
    details: {
      taskId,
      fieldName,
      value,
      locationVerified: observation.locationVerified,
      locationAccuracy: observation.locationAccuracy,
    },
  });

  res.status(201).json(observation);
});

app.post('/api/v1/field/sync', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const result = fieldEngine.processOfflineSync(req.body);

  if (result.processedCount > 0) {
    auditEngine.record({
      user,
      action: 'OFFLINE_DATA_SYNCED',
      entityType: 'OFFLINE_SYNC_BATCH',
      entityId: result.syncId,
      details: { processedCount: result.processedCount, duplicateCount: result.duplicateCount },
    });
  }

  res.json(result);
});

// 10B. Water Sample Management & Chain of Custody API
app.get('/api/v1/samples', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const districtId = req.query.districtId as string | undefined;
  const status = req.query.status as any;
  const sampleType = req.query.sampleType as any;
  const qcStatus = req.query.qcStatus as any;

  let samples = sampleEngine.getSamples({ districtId, status, sampleType, qcStatus });

  // Geographic Scoping:
  if (user.assignment.scopeType === 'DISTRICT' && user.assignment.districtId) {
    samples = samples.filter((s) => s.districtId === user.assignment.districtId);
  }

  res.json({ count: samples.length, samples });
});

app.get('/api/v1/samples/:id', (req: Request, res: Response) => {
  const sample = sampleEngine.getSampleById(req.params.id);
  if (!sample) {
    res.status(404).json({ error: 'Water sample not found' });
    return;
  }
  res.json(sample);
});

app.post('/api/v1/samples', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'COLLECT_SAMPLES' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const {
    taskId,
    alertId,
    predictionId,
    districtId,
    districtName,
    waterSourceId,
    waterSourceName,
    sampleType,
    containerType,
    preservationMethod,
    latitude,
    longitude,
    locationAccuracy,
    transportCondition,
    initialNotes,
  } = req.body;

  if (!districtId || !waterSourceId || !sampleType || !containerType) {
    res.status(400).json({ error: 'Missing required sample collection fields' });
    return;
  }

  const sample = sampleEngine.registerSample({
    collector: user,
    taskId,
    alertId,
    predictionId,
    districtId,
    districtName: districtName || 'Patna',
    waterSourceId,
    waterSourceName: waterSourceName || 'Community Drinking Water Source',
    sampleType,
    containerType,
    preservationMethod: preservationMethod || 'ICE_BOX_4C',
    latitude: latitude !== undefined ? parseFloat(latitude) : null,
    longitude: longitude !== undefined ? parseFloat(longitude) : null,
    locationAccuracy: locationAccuracy !== undefined ? parseFloat(locationAccuracy) : null,
    transportCondition,
    initialNotes,
  });

  auditEngine.record({
    user,
    action: 'SAMPLE_COLLECTED_REGISTERED',
    entityType: 'WATER_SAMPLE',
    entityId: sample.sampleId,
    details: {
      districtId: sample.districtId,
      sampleType: sample.sampleType,
      containerType: sample.containerType,
      locationVerified: sample.locationVerified,
    },
  });

  res.status(201).json(sample);
});

app.post('/api/v1/samples/:id/custody', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'UPDATE_CHAIN_OF_CUSTODY' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const { stage, fromEntity, toEntity, location, temperatureCelsius, conditionStatus, notes } = req.body;
  if (!stage || !location) {
    res.status(400).json({ error: 'stage and location are required for custody transition' });
    return;
  }

  const result = sampleEngine.recordCustodyTransition({
    sampleId: req.params.id,
    actor: user,
    stage,
    fromEntity,
    toEntity,
    location,
    temperatureCelsius: temperatureCelsius !== undefined ? parseFloat(temperatureCelsius) : undefined,
    conditionStatus: conditionStatus || 'SEAL_INTACT',
    notes: notes || `Chain of custody transitioned to ${stage}`,
  });

  if (!result.success) {
    res.status(404).json({ error: result.error });
    return;
  }

  auditEngine.record({
    user,
    action: 'CUSTODY_STAGE_TRANSITION',
    entityType: 'WATER_SAMPLE',
    entityId: req.params.id,
    details: {
      newStage: stage,
      location,
      conditionStatus,
      temperatureCelsius,
      qcStatus: result.sample?.qcStatus,
    },
  });

  res.json(result);
});

app.get('/api/v1/samples/:id/tests', (req: Request, res: Response) => {
  const tests = labEngine.getResults(req.params.id);
  res.json({ count: tests.length, tests });
});

// 10C. Laboratory Verification & Test Results API
app.get('/api/v1/labs', (_req: Request, res: Response) => {
  const labs = labEngine.getLaboratories();
  res.json({
    count: labs.length,
    laboratories: labs,
    integrationNotice: 'LAB INTEGRATION: NOT CONFIGURED (Operating in validated Standalone Laboratory Protocol Mode)',
  });
});

app.get('/api/v1/labs/samples', (req: Request, res: Response) => {
  const samples = sampleEngine.getSamples().filter(
    (s) => s.status === 'RECEIVED_BY_LAB' || s.status === 'TESTING' || s.status === 'RESULT_AVAILABLE' || s.status === 'VERIFIED'
  );
  res.json({ count: samples.length, samples });
});

app.get('/api/v1/lab-results', (req: Request, res: Response) => {
  const sampleId = req.query.sampleId as string | undefined;
  const results = labEngine.getResults(sampleId);
  res.json({ count: results.length, results });
});

app.post('/api/v1/lab-results', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'ENTER_LAB_RESULTS' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const { sampleId, labId, parameterCode, numericValue, qualitativeValue, notes } = req.body;
  if (!sampleId || !parameterCode || numericValue === undefined) {
    res.status(400).json({ error: 'Missing sampleId, parameterCode, or numericValue' });
    return;
  }

  const result = labEngine.submitTestResult({
    sampleId,
    labId: labId || 'LAB_PATNA_01',
    parameterCode,
    numericValue: parseFloat(numericValue),
    testedBy: `${user.fullName} (${user.designation})`,
    qualitativeValue,
    notes,
  });

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  auditEngine.record({
    user,
    action: 'LAB_RESULT_SUBMITTED',
    entityType: 'LAB_RESULT',
    entityId: result.result?.resultId,
    details: {
      sampleId,
      parameterCode,
      numericValue,
      isExceeded: result.result?.isExceeded,
    },
  });

  res.status(201).json(result);
});

app.post('/api/v1/lab-results/:id/verify', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'VERIFY_LAB_RESULTS' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const { isApproved, verificationNotes } = req.body;
  const result = labEngine.verifyResult({
    resultId: req.params.id,
    verifier: user,
    isApproved: Boolean(isApproved),
    verificationNotes: verificationNotes || 'Microbiologist verified against BIS 10500:2012 benchmark standards.',
  });

  if (!result.success) {
    res.status(404).json({ error: result.error });
    return;
  }

  auditEngine.record({
    user,
    action: isApproved ? 'LAB_RESULT_VERIFIED' : 'LAB_RESULT_REJECTED',
    entityType: 'LAB_RESULT',
    entityId: req.params.id,
    details: { isApproved, verificationNotes },
  });

  res.json(result);
});

app.post('/api/v1/lab-results/:id/amend', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'VERIFY_LAB_RESULTS' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const { newValue, justification } = req.body;
  if (newValue === undefined || !justification) {
    res.status(400).json({ error: 'newValue and mandatory justification required for amendment' });
    return;
  }

  const result = labEngine.amendResult({
    resultId: req.params.id,
    amender: user,
    newValue: parseFloat(newValue),
    justification,
  });

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  auditEngine.record({
    user,
    action: 'LAB_RESULT_AMENDED',
    entityType: 'LAB_RESULT',
    entityId: req.params.id,
    details: { newValue, justification },
  });

  res.json(result);
});

// 10D. Prediction-to-Outcome Feedback & Evaluation API
app.get('/api/v1/prediction-outcomes', (req: Request, res: Response) => {
  const districtId = req.query.districtId as string | undefined;
  const disease = req.query.disease as any;
  const actualOutcome = req.query.actualOutcome as any;

  const outcomes = outcomeEngine.getOutcomes({ districtId, disease, actualOutcome });
  res.json({ count: outcomes.length, outcomes });
});

app.post('/api/v1/prediction-outcomes/:id', (req: Request, res: Response) => {
  const user = rbac.getCurrentUser();
  const auth = rbac.authorizeAction({ permission: 'RECORD_HEALTH_OUTCOMES' });
  if (!auth.allowed) {
    res.status(403).json({ error: auth.reason });
    return;
  }

  const { actualOutcome, confirmationSource, confirmationDate, confirmedCasesCount, labEvidenceStatus, labFindingSummary, notes } = req.body;

  if (!actualOutcome || !confirmationSource || !confirmationDate) {
    res.status(400).json({ error: 'Missing actualOutcome, confirmationSource, or confirmationDate' });
    return;
  }

  const result = outcomeEngine.recordActualOutcome({
    outcomeId: req.params.id,
    actor: user,
    actualOutcome,
    confirmationSource,
    confirmationDate,
    confirmedCasesCount: confirmedCasesCount ? parseInt(confirmedCasesCount, 10) : 0,
    labEvidenceStatus,
    labFindingSummary,
    notes,
  });

  if (!result.success) {
    res.status(404).json({ error: result.error });
    return;
  }

  auditEngine.record({
    user,
    action: 'EPIDEMIOLOGICAL_OUTCOME_RECORDED',
    entityType: 'PREDICTION_OUTCOME',
    entityId: req.params.id,
    details: {
      actualOutcome,
      confirmationSource,
      leadTimeDays: result.record?.leadTimeDays,
      evaluationClassification: result.record?.evaluationClassification,
    },
  });

  res.json(result);
});

app.get('/api/v1/prediction-feedback', (req: Request, res: Response) => {
  const disease = ((req.query.disease as string) || 'ADD') as DiseaseType;
  const feedback = outcomeEngine.evaluateModelPerformance(disease);
  res.json(feedback);
});

app.get('/api/v1/alert-effectiveness', (_req: Request, res: Response) => {
  const effectiveness = outcomeEngine.getAlertEffectiveness();
  res.json(effectiveness);
});

app.get('/api/v1/response-timeline/:id', (req: Request, res: Response) => {
  const timeline = outcomeEngine.getEvidenceTimeline(req.params.id);
  res.json({ id: req.params.id, steps: timeline });
});

// 11. Data Health, Sources Status & Quality Scores
app.get('/api/v1/data-status', (_req: Request, res: Response) => {
  const summary = registry.getHealthSummary();
  const platform = registry.getOverallPlatformQuality();
  res.json({
    platformScore: platform.score,
    liveSourceCount: platform.liveSourceCount,
    totalSources: platform.totalSources,
    sources: summary,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/data-sources', async (_req: Request, res: Response) => {
  const sources = await dataMgmtRepo.getDataSources();
  res.json({ count: sources.length, sources });
});

app.get('/api/v1/data-quality', (_req: Request, res: Response) => {
  const summary = registry.getHealthSummary();
  res.json({
    scores: summary.map((s) => ({
      sourceType: s.sourceType,
      title: s.title,
      status: s.status,
      qualityScore: s.qualityScore,
      notes: s.notes,
    })),
  });
});

// 12. Weather API (Live Open-Meteo)
app.get('/api/v1/weather', async (req: Request, res: Response) => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : 25.5941;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : 85.1376;

  const result = await registry.weather.fetch({ lat, lng });
  res.json(result);
});

// 13. Satellite API (Sentinel-2 & MODIS)
app.get('/api/v1/satellite', async (req: Request, res: Response) => {
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : 25.5941;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : 85.1376;
  const districtName = (req.query.district as string) || 'Patna';

  const [sentinel, modis] = await Promise.all([
    registry.sentinel2.fetch({ lat, lng, districtName }),
    registry.modis.fetch({ lat, lng, districtName }),
  ]);

  res.json({
    sentinel2: sentinel,
    modisLST: modis,
  });
});

// 14. Hydrology & River Basins API
app.get('/api/v1/hydrology', async (req: Request, res: Response) => {
  const riverId = req.query.riverId as string | undefined;
  const result = await registry.hydrology.fetch({ riverId });
  res.json(result);
});

// 15. Water Quality API
app.get('/api/v1/water-quality', async (req: Request, res: Response) => {
  const districtId = req.query.districtId as string | undefined;
  const result = await registry.waterQuality.fetch({ districtId });
  res.json(result);
});

// 16. Epidemiological Ground Truth & Disease Types
app.get('/api/v1/diseases', async (_req: Request, res: Response) => {
  const diseases = await healthRepo.getDiseaseTypes();
  res.json({ count: diseases.length, diseases });
});

app.get('/api/v1/epidemiology', async (req: Request, res: Response) => {
  const districtId = req.query.districtId as string | undefined;
  const disease = (req.query.disease as 'ADD' | 'Cholera' | 'Typhoid') || 'ADD';
  const result = await registry.epidemiology.fetch({ districtId, disease });
  res.json(result);
});

app.get('/api/v1/epidemiology/events', async (req: Request, res: Response) => {
  const districtId = req.query.districtId as string | undefined;
  const events = await healthRepo.getDiseaseEvents(districtId);
  res.json({ count: events.length, events });
});

// 17. Socioeconomic Vulnerability (SVI) API
app.get('/api/v1/vulnerability', async (req: Request, res: Response) => {
  const districtId = req.query.districtId as string | undefined;
  const result = await registry.census.fetch({ districtId });
  res.json(result);
});

// 18. IoT In-Situ Sensor Telemetry Gateway
app.get('/api/v1/sensors', async (req: Request, res: Response) => {
  const districtId = req.query.districtId as string | undefined;
  const sensors = await iotRepo.getSensors(districtId);
  res.json({ count: sensors.length, sensors });
});

app.get('/api/v1/sensors/status', async (_req: Request, res: Response) => {
  const result = await registry.iotSensors.fetch();
  res.json(result);
});

app.get('/api/v1/sensors/readings', async (req: Request, res: Response) => {
  const sensorId = req.query.sensorId as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const readings = await iotRepo.getReadings(sensorId, limit);
  res.json({ count: readings.length, readings });
});

app.post('/api/v1/sensors/register', async (req: Request, res: Response) => {
  const { sensorId, districtId, deviceType, location, firmwareVersion } = req.body;
  if (!sensorId || !deviceType) {
    res.status(400).json({ error: 'Missing required sensor registration fields' });
    return;
  }

  const device = await iotRepo.registerSensor({
    sensorId,
    districtId: districtId || 'patna_bihar',
    deviceType,
    firmwareVersion: firmwareVersion || 'v1.0.0-lora',
    latitude: location?.lat || 25.5941,
    longitude: location?.lng || 85.1376,
    status: 'ONLINE',
  });

  res.status(201).json({ message: 'Device provisioned successfully', device });
});

app.post('/api/v1/sensors/ingest', async (req: Request, res: Response) => {
  const { sensorId, timestamp, parameter, value, unit } = req.body;
  if (!sensorId || !parameter || value === undefined) {
    res.status(400).json({ error: 'Missing sensorId, parameter, or value' });
    return;
  }

  const result = registry.iotSensors.ingestReading({
    readingId: `READ_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    sensorId,
    timestamp: timestamp || new Date().toISOString(),
    parameter,
    value: parseFloat(value),
    unit: unit || 'raw',
  });

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  await iotRepo.addReading({
    readingId: `READ_${Date.now()}`,
    sensorId,
    parameter,
    value: parseFloat(value),
    unit: unit || 'raw',
    timestamp: timestamp || new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    qualityStatus: 'GOOD',
    validationStatus: 'VALID',
  });

  res.status(200).json({ message: 'Sensor observation ingested successfully' });
});

// 19. Ingestion Jobs Scheduler API
app.get('/api/v1/ingestion/jobs', (_req: Request, res: Response) => {
  res.json({
    jobs: scheduler.listJobs(),
    logs: scheduler.getLogs(),
  });
});

app.post('/api/v1/ingestion/run/:jobId', async (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const result = await scheduler.runJob(jobId);
  res.json(result);
});

// 20. ML Models, Prediction & Provenance
app.get('/api/v1/ml/models', async (req: Request, res: Response) => {
  const disease = req.query.disease as string | undefined;
  const models = await mlRepo.getModelVersions(disease);
  res.json({ count: models.length, models });
});

app.get('/api/v1/ml/predict/:districtId', async (req: Request, res: Response) => {
  const districtId = req.params.districtId;
  const disease = ((req.query.disease as string) || 'ADD') as DiseaseType;

  const district = DISTRICTS_DATA.find((d) => d.id === districtId) || DISTRICTS_DATA[0];
  const provenance = featureStore.generatePredictionProvenance(district, disease);

  res.json({
    prediction: {
      districtId: district.id,
      districtName: district.name,
      disease,
      riskScore: district.riskScore,
      riskTier: district.riskTier,
      factors: provenance.whyThisPrediction,
      sourceDatasets: provenance.sourceDatasets,
      confidenceInterval: provenance.confidenceInterval,
    },
  });
});

app.get('/api/v1/predictions/provenance/:districtId', (req: Request, res: Response) => {
  const districtId = req.params.districtId;
  const disease = ((req.query.disease as string) || 'ADD') as DiseaseType;

  const district = DISTRICTS_DATA.find((d) => d.id === districtId) || DISTRICTS_DATA[0];
  const provenance = featureStore.generatePredictionProvenance(district, disease);

  res.json(provenance);
});

// 21. Interactive HTML Documentation & OpenAPI 3.0
app.get('/api/v1/openapi.json', (_req: Request, res: Response) => {
  res.json({
    openapi: '3.0.3',
    info: {
      title: 'JalDrishti Government Operations & Telemetry API',
      version: '2.6.0',
      description:
        'Official Government Operations, RBAC Authorization, Public Health Alerts, Interventions, Resource Logistics & Spatial Telemetry API.',
    },
    paths: {
      '/api/v1/health': { get: { summary: 'System & database health check' } },
      '/api/v1/auth/session': { get: { summary: 'Active government officer session profile' } },
      '/api/v1/auth/switch-user': { post: { summary: 'Switch demo officer role' } },
      '/api/v1/alerts': { get: { summary: 'List alerts under geographic jurisdiction' } },
      '/api/v1/alerts/{id}/acknowledge': { post: { summary: 'Acknowledge outbreak alert' } },
      '/api/v1/alerts/{id}/assign': { post: { summary: 'Assign alert response task' } },
      '/api/v1/alerts/{id}/escalate': { post: { summary: 'Escalate alert across government tiers' } },
      '/api/v1/alerts/{id}/close': { post: { summary: 'Close alert with mandatory audit note' } },
      '/api/v1/interventions': { get: { summary: 'Public health field interventions' } },
      '/api/v1/interventions/{id}/evidence': { post: { summary: 'Submit field action evidence' } },
      '/api/v1/interventions/{id}/verify': { post: { summary: 'Supervisor evidence sign-off' } },
      '/api/v1/resources': { get: { summary: 'Emergency chlorine & medical supplies' } },
      '/api/v1/resources/shortages': { get: { summary: 'Stockout and deficit alerts' } },
      '/api/v1/resources/allocations/{id}/approve': { post: { summary: 'Authorize resource transfer' } },
      '/api/v1/triage': { get: { summary: 'District multi-factor prioritization matrix' } },
      '/api/v1/audit/logs': { get: { summary: 'Immutable audit trail' } },
      '/api/v1/audit/export': { get: { summary: 'Export audit ledger to CSV' } },
    },
  });
});

app.get('/api/v1/docs', (_req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>JalDrishti Government Operations API v1</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-950 text-slate-100 font-sans p-8 max-w-5xl mx-auto">
      <header class="border-b border-cyan-500/30 pb-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-black text-cyan-400">JalDrishti Government Operations & Response API</h1>
            <p class="text-xs text-slate-400 mt-1">RBAC Authorization, Public Health Alerts, WASH Interventions, Resource Logistics & Audit Trail</p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
            v2.6.0
          </span>
        </div>
      </header>
      <div class="space-y-3 text-xs font-mono">
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div><span class="text-emerald-400 font-bold">GET</span> <span class="text-white">/api/v1/auth/session</span></div>
          <span class="text-slate-400">Current officer profile, RBAC permissions, and geographic jurisdiction</span>
        </div>
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div><span class="text-emerald-400 font-bold">GET</span> <span class="text-white">/api/v1/alerts</span></div>
          <span class="text-slate-400">Alerts strictly filtered to officer's geographic boundary</span>
        </div>
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div><span class="text-purple-400 font-bold">POST</span> <span class="text-white">/api/v1/alerts/:id/acknowledge</span></div>
          <span class="text-slate-400">Acknowledge risk alert with mandatory officer audit record</span>
        </div>
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div><span class="text-emerald-400 font-bold">GET</span> <span class="text-white">/api/v1/interventions</span></div>
          <span class="text-slate-400">WASH and health field interventions & verification status</span>
        </div>
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div><span class="text-purple-400 font-bold">POST</span> <span class="text-white">/api/v1/interventions/:id/verify</span></div>
          <span class="text-slate-400">Supervisor sign-off on field evidence (Approve / Reject)</span>
        </div>
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div><span class="text-emerald-400 font-bold">GET</span> <span class="text-white">/api/v1/resources/shortages</span></div>
          <span class="text-slate-400">Chlorine, ORS, and equipment deficit alerts</span>
        </div>
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div><span class="text-emerald-400 font-bold">GET</span> <span class="text-white">/api/v1/triage</span></div>
          <span class="text-slate-400">Multi-criteria district prioritization matrix with transparent scoring</span>
        </div>
        <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div><span class="text-emerald-400 font-bold">GET</span> <span class="text-white">/api/v1/audit/logs</span></div>
          <span class="text-slate-400">Immutable forensic audit trail</span>
        </div>
      </div>
    </body>
    </html>
  `);
});

// ====================================================================
// Vite Dev Middleware / Static Production Serving
// ====================================================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vitePkg = 'vite';
    const { createServer: createViteServer } = await import(/* @vite-ignore */ vitePkg);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JalDrishti Server] Running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export { app };
export default app;

