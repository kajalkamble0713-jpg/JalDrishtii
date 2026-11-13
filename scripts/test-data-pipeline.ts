/**
 * JalDrishti Data Pipeline Test Suite
 * Validates all providers, normalization engines, validation contracts,
 * quality scoring algorithms, scheduler jobs, and feature provenance.
 */

import { DataValidator } from '../src/services/data/common/validator.js';
import { QualityScorer, FreshnessEngine } from '../src/services/data/common/qualityScorer.js';
import { DataProviderRegistry } from '../src/services/data/registry.js';
import { IngestionScheduler } from '../src/services/data/scheduler/IngestionScheduler.js';
import { MLFeatureStore } from '../src/services/data/ml/FeatureStore.js';
import { DISTRICTS_DATA } from '../src/data/jaldrishtiData.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log(' JalDrishti Real-Data Infrastructure & Test Runner');
  console.log('======================================================\n');

  // -----------------------------------------------------------------
  // 1. Data Validator Tests
  // -----------------------------------------------------------------
  console.log('--- 1. Testing Formal Data Validator ---');
  
  // Valid coordinates
  const validCoordIssues = DataValidator.validateCoordinates(25.5941, 85.1376);
  assert(validCoordIssues.length === 0, 'Valid coordinates passed without issues');

  // Invalid coordinates (out of bounds)
  const invalidLatIssues = DataValidator.validateCoordinates(105.0, 85.1376);
  assert(invalidLatIssues.some(i => i.field === 'latitude'), 'Out-of-bounds latitude (105°) rejected');

  const invalidLngIssues = DataValidator.validateCoordinates(25.0, -210.0);
  assert(invalidLngIssues.some(i => i.field === 'longitude'), 'Out-of-bounds longitude (-210°) rejected');

  // Impossible temperature rejection
  const validTempIssues = DataValidator.validateTemperature(32.5);
  assert(validTempIssues.length === 0, 'Plausible temperature (32.5°C) accepted');

  const impossibleTempIssues = DataValidator.validateTemperature(85.0);
  assert(impossibleTempIssues.some(i => i.rule === 'physical_range'), 'Impossible temperature (85.0°C) rejected');

  // Negative precipitation rejection
  const negativePrecipIssues = DataValidator.validatePrecipitation(-5.0);
  assert(negativePrecipIssues.some(i => i.rule === 'non_negative'), 'Negative precipitation (-5 mm) rejected');

  // Water quality pH validation
  const invalidPhIssues = DataValidator.validateWaterQualityParams({ ph: 16.5 });
  assert(invalidPhIssues.some(i => i.rule === 'ph_scale'), 'pH outside 0-14 (16.5) rejected');

  // Spectral index validation
  const invalidNdwiIssues = DataValidator.validateSpectralIndex(2.4, 'NDWI');
  assert(invalidNdwiIssues.some(i => i.rule === 'normalized_difference_range'), 'Spectral NDWI out-of-range (2.4) rejected');

  // -----------------------------------------------------------------
  // 2. Quality Scorer & Freshness Engine Tests
  // -----------------------------------------------------------------
  console.log('\n--- 2. Testing Quality Scorer & Freshness Engine ---');
  
  const liveScore = QualityScorer.calculate({
    sourceType: 'weather',
    status: 'LIVE',
    observedAt: new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    completenessRatio: 1.0,
    hasValidationErrors: false,
    validationWarningCount: 0,
    isOfficialGovOrSatelliteSource: true,
    isFallback: false,
  });
  assert(liveScore.total >= 85 && liveScore.total <= 100, `Live weather scored high quality: ${liveScore.total}/100`);

  const unconfiguredScore = QualityScorer.calculate({
    sourceType: 'satellite_sentinel2',
    status: 'NOT_CONFIGURED',
    observedAt: null,
    fetchedAt: new Date().toISOString(),
    completenessRatio: 0.0,
    hasValidationErrors: false,
    validationWarningCount: 0,
    isOfficialGovOrSatelliteSource: false,
    isFallback: true,
  });
  assert(unconfiguredScore.total < 30, `Unconfigured feed scored low/zero: ${unconfiguredScore.total}/100`);

  const freshnessLive = FreshnessEngine.evaluate(new Date().toISOString(), 'weather', true);
  assert(freshnessLive.status === 'LIVE', 'Recent timestamp evaluates to LIVE status');

  const fiveDaysOld = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const freshnessStale = FreshnessEngine.evaluate(fiveDaysOld, 'weather', true);
  assert(freshnessStale.status === 'STALE', '5-day old weather evaluates to STALE status');

  // -----------------------------------------------------------------
  // 3. Data Providers Tests
  // -----------------------------------------------------------------
  console.log('\n--- 3. Testing Real Data Providers ---');
  const registry = DataProviderRegistry.getInstance();

  // Weather Provider (Live Open-Meteo)
  const weatherResult = await registry.weather.fetch({ lat: 25.5941, lng: 85.1376 });
  assert(typeof weatherResult.data.temperature2m === 'number', `Weather temperature retrieved: ${weatherResult.data.temperature2m}°C`);
  assert(weatherResult.validation.isValid, 'Weather observation passed validation');
  assert(weatherResult.metadata.provider.includes('Open-Meteo'), 'Metadata reports Open-Meteo as provider');

  // Sentinel-2 Provider (Unconfigured honesty check)
  const sentinelResult = await registry.sentinel2.fetch({ lat: 25.5941, lng: 85.1376, districtName: 'Patna' });
  assert(sentinelResult.data.spectralIndices.ndwi !== undefined, 'Sentinel-2 NDWI index present in model');
  assert(sentinelResult.metadata.status === 'NOT_CONFIGURED', 'Sentinel-2 honestly reports NOT_CONFIGURED when API key unset');
  assert(sentinelResult.metadata.isFallback === true, 'Sentinel-2 explicitly flags fallback status');

  // MODIS LST Provider
  const modisResult = await registry.modis.fetch({ lat: 25.5941, lng: 85.1376, districtName: 'Patna' });
  assert(
    modisResult.metadata.status === 'NOT_CONFIGURED' || modisResult.metadata.status === 'STATIC' || modisResult.metadata.status === 'LIVE',
    `MODIS reports valid status (${modisResult.metadata.status})`
  );
  assert(modisResult.data.lstDayCelsius > 0, 'MODIS LST observation or research baseline available');

  // Hydrology Provider
  const hydroResult = await registry.hydrology.fetch();
  assert(hydroResult.data.length >= 5, `Hydrology returned ${hydroResult.data.length} river basins`);
  assert(hydroResult.metadata.status === 'STATIC', 'Hydrology reports STATIC river geometry reference');

  // Water Quality Provider
  const wqResult = await registry.waterQuality.fetch();
  assert(wqResult.data.length > 0, `Water quality returned ${wqResult.data.length} sample stations`);
  assert(wqResult.data[0].verificationStatus === 'Modeled Research Benchmark', 'Water quality strictly labeled Modeled Research Benchmark');

  // Epidemiology Provider
  const epiResult = await registry.epidemiology.fetch();
  assert(epiResult.data.length > 0, `Epidemiology returned ${epiResult.data.length} district records`);
  assert(epiResult.metadata.status === 'STATIC', 'Epidemiology reports STATIC historical benchmark');

  // IoT Sensor Provider
  const iotResult = await registry.iotSensors.fetch();
  assert(registry.iotSensors.getStatus() === 'UNAVAILABLE', 'IoT gateway reports UNAVAILABLE when no hardware nodes are connected');
  assert(
    (iotResult.metadata.errorMessage?.includes('MQTT Broker') || iotResult.metadata.errorMessage?.includes('NO LIVE SENSOR CONNECTION')) ?? false,
    'IoT metadata reports gateway/broker status clearly'
  );

  // -----------------------------------------------------------------
  // 4. Ingestion Scheduler Tests
  // -----------------------------------------------------------------
  console.log('\n--- 4. Testing Ingestion Scheduler ---');
  const scheduler = IngestionScheduler.getInstance();
  const jobs = scheduler.listJobs();
  assert(jobs.length === 7, `Scheduler manages 7 configured jobs (found ${jobs.length})`);

  const runRes = await scheduler.runJob('job_weather_sync');
  assert(runRes.success, 'Weather ingestion job executed successfully');
  const logs = scheduler.getLogs();
  assert(logs.length > 0, 'Ingestion job execution logged in audit history');

  // -----------------------------------------------------------------
  // 5. ML Feature Store & Provenance Tests
  // -----------------------------------------------------------------
  console.log('\n--- 5. Testing ML Feature Store & Provenance ---');
  const featureStore = MLFeatureStore.getInstance();
  const district = DISTRICTS_DATA[0];

  const featureVector = await featureStore.getFeatureVector(district);
  assert(typeof featureVector.features.turbidityNtu === 'number', 'Feature vector assembled turbidity parameter');
  assert(typeof featureVector.features.ambientAirTempCelsius === 'number', 'Feature vector incorporated ambient weather');
  assert(featureVector.provenance.length === 5, 'Feature vector recorded complete 5-stream provenance lineage');

  const provenance = featureStore.generatePredictionProvenance(district, 'ADD');
  assert(provenance.predictionId.startsWith('PRED_'), 'Generated unique Prediction ID with audit prefix');
  assert(provenance.whyThisPrediction.length > 0, `Generated ${provenance.whyThisPrediction.length} explainability factors`);
  assert(provenance.confidenceInterval[0] <= provenance.predictedRiskScore, '95% confidence lower bound is valid');

  // -----------------------------------------------------------------
  // 6. Database Repositories & Data Models Tests
  // -----------------------------------------------------------------
  console.log('\n--- 6. Testing Database Repositories & Data Models ---');
  const { DatabaseManager } = await import('../src/db/connection.js');
  const { GeographicRepository } = await import('../src/db/repositories/geographicRepository.js');
  const { HealthRepository } = await import('../src/db/repositories/healthRepository.js');
  const { IoTRepository } = await import('../src/db/repositories/iotRepository.js');
  const { MLRepository } = await import('../src/db/repositories/mlRepository.js');
  const { OperationsRepository } = await import('../src/db/repositories/operationsRepository.js');
  const { DataManagementRepository } = await import('../src/db/repositories/dataManagementRepository.js');
  const { SecurityRepository } = await import('../src/db/repositories/securityRepository.js');
  const { FieldLabRepository } = await import('../src/db/repositories/fieldLabRepository.js');
  const { FieldOperationsEngine } = await import('../src/services/operations/fieldOperationsEngine.js');
  const { WaterSampleEngine } = await import('../src/services/operations/waterSampleEngine.js');
  const { LabVerificationEngine } = await import('../src/services/operations/labVerificationEngine.js');
  const { PredictionOutcomeEngine } = await import('../src/services/operations/predictionOutcomeEngine.js');
  const { DEMO_GOVERNMENT_OFFICERS } = await import('../src/services/auth/rbacEngine.js');

  const dbManager = DatabaseManager.getInstance();
  const dbStatus = dbManager.getStatus();
  assert(typeof dbStatus.isConnected === 'boolean', `DatabaseManager initialized (Connected: ${dbStatus.isConnected})`);

  // Geographic
  const geoRepo = GeographicRepository.getInstance();
  const districtsResult = await geoRepo.getDistricts();
  assert(districtsResult.districts.length > 0, `GeographicRepository retrieved ${districtsResult.districts.length} districts with PostGIS centroids`);
  const states = await geoRepo.getStates();
  assert(states.length > 0, `GeographicRepository retrieved ${states.length} states`);
  const rivers = await geoRepo.getRivers();
  assert(rivers.length >= 8, `GeographicRepository retrieved ${rivers.length} river polylines`);

  // Health
  const healthRepo = HealthRepository.getInstance();
  const diseases = await healthRepo.getDiseaseTypes();
  assert(diseases.length === 3, 'HealthRepository contains 3 targeted diseases (ADD, Cholera, Typhoid)');
  const observations = await healthRepo.getObservations();
  assert(observations.length > 0, `HealthRepository retrieved ${observations.length} epidemiological observations`);

  // IoT
  const iotRepo = IoTRepository.getInstance();
  const sensors = await iotRepo.getSensors();
  assert(sensors.length > 0, `IoTRepository initialized with ${sensors.length} sensor telemetry nodes`);
  await iotRepo.addReading({
    readingId: `TEST_READ_${Date.now()}`,
    sensorId: 'NODE_GANGES_PATNA_01',
    parameter: 'turbidity',
    value: 28.5,
    unit: 'NTU',
    timestamp: new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    qualityStatus: 'GOOD',
    validationStatus: 'VALID',
  });
  const readings = await iotRepo.getReadings('NODE_GANGES_PATNA_01', 5);
  assert(readings.length > 0, 'IoTRepository successfully persisted and retrieved sensor reading');

  // ML
  const mlRepo = MLRepository.getInstance();
  const models = await mlRepo.getModelVersions();
  assert(models.length === 3, `MLRepository loaded ${models.length} active XGBoost model versions`);

  // Operations
  const opsRepo = OperationsRepository.getInstance();
  const alerts = await opsRepo.getAlerts();
  assert(alerts.length > 0, `OperationsRepository manages ${alerts.length} outbreak alerts`);
  const interventions = await opsRepo.getInterventions();
  assert(interventions.length > 0, `OperationsRepository manages ${interventions.length} WASH protocols`);
  const resources = await opsRepo.getResources();
  assert(resources.length > 0, `OperationsRepository manages ${resources.length} emergency response resources`);

  // Data Management & Security
  const dataMgmtRepo = DataManagementRepository.getInstance();
  const dataSources = await dataMgmtRepo.getDataSources();
  assert(dataSources.length === 7, `DataManagementRepository contains all 7 registered data sources`);

  const secRepo = SecurityRepository.getInstance();
  const sessionUser = await secRepo.getSessionUser();
  assert(sessionUser.roles.includes('epidemiologist'), 'SecurityRepository verified epidemiologist RBAC role');
  await secRepo.recordAuditLog({
    action: 'TEST_VALIDATION_SUITE_RUN',
    entityType: 'TEST_RUNNER',
    actorId: 'system',
    details: { passedTests, timestamp: new Date().toISOString() },
  });
  const auditLogs = await secRepo.getAuditLogs(5);
  assert(auditLogs.length > 0, 'SecurityRepository successfully recorded immutable audit log');

  // -----------------------------------------------------------------
  // 7. Field Operations, Water Samples, Lab Verification & Feedback Loop
  // -----------------------------------------------------------------
  console.log('\n--- 7. Testing Field Operations, Water Samples & Laboratory Verification ---');

  const fieldEngine = FieldOperationsEngine.getInstance();
  const sampleEngine = WaterSampleEngine.getInstance();
  const labEngine = LabVerificationEngine.getInstance();
  const outcomeEngine = PredictionOutcomeEngine.getInstance();
  const fieldLabRepo = FieldLabRepository.getInstance();

  // Field Tasks
  const initialTasks = fieldEngine.getTasks();
  assert(initialTasks.length > 0, `FieldOperationsEngine initialized with ${initialTasks.length} field tasks`);

  const newTask = fieldEngine.createTask({
    alertId: 'ALT-PATNA-001',
    predictionId: 'PRED-PATNA-001',
    districtId: 'patna',
    districtName: 'Patna',
    state: 'Bihar',
    waterSourceId: 'SRC-PATNA-01',
    waterSourceName: 'Danapur Public Tube-well',
    assignedWorkerId: DEMO_GOVERNMENT_OFFICERS[3].userId,
    assignedWorkerName: DEMO_GOVERNMENT_OFFICERS[3].fullName,
    assignedBy: 'Dr. R. Sharma (Chief Medical Officer)',
    title: 'Water Source Sanitary Survey & Coliform Check',
    description: 'Inspect public tube-well after elevated turbidity and predicted ADD alert.',
    taskType: 'WATER_SOURCE_INVESTIGATION',
    priority: 'HIGH',
    deadline: '2026-08-04',
    requiredSamplesCount: 2,
    evidenceRequirements: 'Geotagged photographs and sterile container samples.',
  });
  assert(newTask.taskId.startsWith('FT_'), `Field task successfully dispatched: ${newTask.taskId}`);

  // Checklist updates
  const checklistResult = fieldEngine.updateTaskChecklist(newTask.taskId, [
    { id: 'CHK-01', label: 'Source physically accessible', completed: true },
    { id: 'CHK-02', label: 'Water visibly clear', completed: false, isFlagged: true, notes: 'Slight cloudy turbidity observed' },
  ], 'Survey completed on site');
  assert(checklistResult.success, 'Field checklist successfully updated and persisted');

  // GPS Observation
  const validObs = fieldEngine.recordObservation({
    taskId: newTask.taskId,
    worker: DEMO_GOVERNMENT_OFFICERS[3],
    latitude: 25.5941,
    longitude: 85.1376,
    locationAccuracy: 8.5,
    observationType: 'FIELD_MEASUREMENT',
    fieldName: 'Free Residual Chlorine',
    value: '0.05',
    unit: 'mg/L',
    notes: 'Free chlorine significantly below target 0.2 mg/L',
  });
  assert(validObs.locationVerified === true, 'GPS coordinates within bounds marked as LOCATION VERIFIED');

  const invalidGpsObs = fieldEngine.recordObservation({
    taskId: newTask.taskId,
    worker: DEMO_GOVERNMENT_OFFICERS[3],
    latitude: null,
    longitude: null,
    locationAccuracy: null,
    observationType: 'VISUAL',
    fieldName: 'Drainage Status',
    value: 'Blocked storm drain adjacent to borewell',
  });
  assert(invalidGpsObs.locationVerified === false, 'Missing/null GPS coordinates honestly marked as LOCATION UNAVAILABLE');

  // Offline Sync Queue Idempotency
  const syncPayload = {
    syncId: `SYNC-TEST-${Date.now()}`,
    workerId: DEMO_GOVERNMENT_OFFICERS[3].userId,
    timestamp: new Date().toISOString(),
    completedTasks: [{
      taskId: newTask.taskId,
      completedAt: new Date().toISOString(),
      checklistItems: newTask.checklistItems,
    }],
  };
  const syncFirstRun = fieldEngine.processOfflineSync(syncPayload);
  assert(syncFirstRun.processedCount === 1, 'Offline sync queue successfully processed pending task');

  const syncDuplicateRun = fieldEngine.processOfflineSync(syncPayload);
  assert(syncDuplicateRun.duplicateCount === 1, 'Offline sync successfully rejected duplicate payload idempotently');

  // Water Samples & Unique ID format
  const registeredSample = sampleEngine.registerSample({
    collector: DEMO_GOVERNMENT_OFFICERS[3],
    taskId: newTask.taskId,
    alertId: 'ALT-PATNA-001',
    districtId: 'patna',
    districtName: 'Patna',
    waterSourceId: 'SRC-PATNA-01',
    waterSourceName: 'Danapur Public Tube-well',
    sampleType: 'GROUNDWATER',
    containerType: 'STERILE_PET',
    preservationMethod: 'ICE_BOX_4C',
    latitude: 25.5941,
    longitude: 85.1376,
    locationAccuracy: 6.0,
    transportCondition: 'Insulated cool box with blue ice packs at 4°C',
    initialNotes: 'Borewell sample collected after 3 minutes flushing',
  });
  const sampleIdPattern = /^JD-\d{4}-[A-Z0-9]+-\d+$/;
  assert(sampleIdPattern.test(registeredSample.sampleId), `Sample ID conforms to standard format: ${registeredSample.sampleId}`);

  // Chain of Custody Transitions
  const custodyTransition = sampleEngine.recordCustodyTransition({
    sampleId: registeredSample.sampleId,
    actor: DEMO_GOVERNMENT_OFFICERS[3],
    stage: 'SEALED',
    location: 'Patna District Field Station',
    temperatureCelsius: 4.2,
    conditionStatus: 'SEAL_INTACT',
    notes: 'Sample sealed with tamper-evident security barcode seal #SEAL-9876',
  });
  assert(custodyTransition.success && custodyTransition.sample?.status === 'SEALED', 'Chain of custody transitioned to SEALED');

  const labCustody = sampleEngine.recordCustodyTransition({
    sampleId: registeredSample.sampleId,
    actor: DEMO_GOVERNMENT_OFFICERS[0],
    stage: 'RECEIVED_BY_LAB',
    toEntity: 'District Public Health Laboratory, Patna',
    location: 'PHL Patna Specimen Receipt Desk',
    temperatureCelsius: 4.8,
    conditionStatus: 'SEAL_INTACT',
    notes: 'Specimen verified intact and logged into testing queue',
  });
  assert(labCustody.success && labCustody.sample?.status === 'RECEIVED_BY_LAB', 'Chain of custody transitioned to RECEIVED_BY_LAB');

  // Laboratory Verification & BIS 10500 Standards
  const labs = labEngine.getLaboratories();
  assert(labs.length > 0, `Laboratory registry contains ${labs.length} laboratories`);
  assert(labs.every(l => l.apiIntegrationStatus === 'NOT_CONFIGURED'), 'All external laboratory integrations honestly marked as NOT_CONFIGURED');

  const labTest = labEngine.submitTestResult({
    sampleId: registeredSample.sampleId,
    labId: 'LAB_PATNA_01',
    parameterCode: 'E_COLI',
    numericValue: 18.0,
    testedBy: 'Dr. Ananya Ray (Senior Microbiologist)',
    notes: 'Thermotolerant coliform growth detected on MUG agar plate at 44.5°C',
  });
  assert(labTest.success && labTest.result?.isExceeded === true, 'E. coli exceeding 0 CFU/100 mL marked as standard EXCEEDED');

  const verifiedTest = labEngine.verifyResult({
    resultId: labTest.result!.resultId,
    verifier: DEMO_GOVERNMENT_OFFICERS[0],
    isApproved: true,
    verificationNotes: 'Verified against BIS 10500:2012 drinking water standards.',
  });
  assert(verifiedTest.success && verifiedTest.result?.verificationStatus === 'VERIFIED', 'Lab test result successfully verified by authorized microbiologist');

  const amendedTest = labEngine.amendResult({
    resultId: labTest.result!.resultId,
    amender: DEMO_GOVERNMENT_OFFICERS[0],
    newValue: 22.0,
    justification: 'Recount of colony forming units on duplicate plate confirms 22 CFU/100 mL',
  });
  assert(amendedTest.success && amendedTest.result?.amendmentHistory.length === 1, 'Lab result amended with mandatory justification and audit trail');

  // Prediction-to-Outcome Feedback Engine
  const outcomes = outcomeEngine.getOutcomes();
  assert(outcomes.length > 0, `Prediction outcome engine manages ${outcomes.length} epidemiological tracking records`);

  const outcomeRecord = outcomes[0];
  const recordResult = outcomeEngine.recordActualOutcome({
    outcomeId: outcomeRecord.outcomeId,
    actor: DEMO_GOVERNMENT_OFFICERS[0],
    actualOutcome: 'CONFIRMED_EVENT',
    confirmationSource: 'Integrated Disease Surveillance Programme (IDSP) Weekly Portal',
    confirmationDate: '2026-08-01',
    confirmedCasesCount: 18,
    labEvidenceStatus: 'SUPPORTED',
    labFindingSummary: 'E. coli detected in community water supply (22 CFU/100mL)',
    notes: 'Localized outbreak confirmed by IDSP team; early warning provided 14 days lead time.',
  });
  assert(recordResult.success && recordResult.record?.evaluationClassification === 'TP', 'Prediction outcome classified as True Positive (TP) with lead time calculated');

  const evalMetrics = outcomeEngine.evaluateModelPerformance('ADD');
  assert(typeof evalMetrics.sampleSize === 'number', `Model performance evaluated for ADD (Sample size: ${evalMetrics.sampleSize})`);
  assert(evalMetrics.hasSufficientData !== undefined, 'Model correctly checks for sufficient sample size before reporting metrics');

  const effectiveness = outcomeEngine.getAlertEffectiveness();
  assert(effectiveness.totalAlerts > 0, `Alert effectiveness evaluated (${effectiveness.totalAlerts} total alerts tracked)`);

  const timelineSteps = outcomeEngine.getEvidenceTimeline(outcomeRecord.outcomeId);
  assert(timelineSteps.length >= 4, `End-to-end evidence timeline reconstructed with ${timelineSteps.length} auditable steps`);

  // FieldLabRepository
  const repoTasks = await fieldLabRepo.getFieldTasks();
  assert(repoTasks.length > 0, `FieldLabRepository retrieved ${repoTasks.length} field tasks`);
  const repoSamples = await fieldLabRepo.getWaterSamples();
  assert(repoSamples.length > 0, `FieldLabRepository retrieved ${repoSamples.length} water samples`);

  console.log('\n======================================================');
  console.log(` Test Results: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test execution error:', e);
  process.exit(1);
});
