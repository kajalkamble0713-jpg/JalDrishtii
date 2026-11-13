/**
 * JalDrishti Field Operations & Worker Management Engine
 * Handles field investigation tasks, checklist submissions, GPS location verification,
 * field observations, and offline synchronization queues.
 */

import { GovernmentUser } from '../auth/rbacEngine.js';

export type FieldTaskType =
  | 'WATER_SOURCE_INVESTIGATION'
  | 'SANITARY_SURVEY'
  | 'RESIDUAL_CHLORINE_CHECK'
  | 'EMERGENCY_SAMPLE_COLLECTION'
  | 'OUTBREAK_VERIFICATION';

export type FieldTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type FieldTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  notes?: string;
  isFlagged?: boolean; // flags anomaly for investigation, NOT disease confirmation
}

export interface FieldTask {
  taskId: string;
  alertId?: string;
  predictionId?: string;
  districtId: string;
  districtName: string;
  state: string;
  waterSourceId?: string;
  waterSourceName?: string;
  assignedWorkerId: string;
  assignedWorkerName: string;
  assignedBy: string;
  title: string;
  description: string;
  taskType: FieldTaskType;
  priority: FieldTaskPriority;
  deadline: string;
  status: FieldTaskStatus;
  checklistItems: ChecklistItem[];
  requiredSamplesCount: number;
  evidenceRequirements: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface FieldObservation {
  observationId: string;
  taskId: string;
  workerId: string;
  workerName: string;
  districtId: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  locationVerified: boolean; // True only if genuine GPS was captured with reasonable accuracy
  observationType: 'CHECKLIST' | 'VISUAL' | 'SENSOR_READING' | 'FIELD_MEASUREMENT' | 'COMMUNITY_REPORT';
  fieldName: string;
  value: string;
  unit?: string;
  notes?: string;
  fileReference?: string;
  observedAt: string;
  createdAt: string;
}

export interface OfflineSyncPayload {
  syncId: string;
  workerId: string;
  timestamp: string;
  completedTasks?: Array<{
    taskId: string;
    completedAt: string;
    checklistItems: ChecklistItem[];
    notes?: string;
  }>;
  observations?: FieldObservation[];
}

export interface OfflineSyncResult {
  syncId: string;
  success: boolean;
  processedCount: number;
  duplicateCount: number;
  errors: string[];
  syncedAt: string;
}

export class FieldOperationsEngine {
  private static instance: FieldOperationsEngine;
  private tasks: Map<string, FieldTask> = new Map();
  private observations: Map<string, FieldObservation> = new Map();
  private processedSyncIds: Set<string> = new Set(); // Idempotency protection

  private constructor() {
    this.seedBaselineFieldTasks();
  }

  public static getInstance(): FieldOperationsEngine {
    if (!FieldOperationsEngine.instance) {
      FieldOperationsEngine.instance = new FieldOperationsEngine();
    }
    return FieldOperationsEngine.instance;
  }

  public static getDefaultInspectionChecklist(): ChecklistItem[] {
    return [
      { id: 'chk_1', label: 'Source accessible for community and sampling', completed: false },
      { id: 'chk_2', label: 'Water visibly discolored or high apparent turbidity', completed: false, isFlagged: false },
      { id: 'chk_3', label: 'Open waste / animal dung / sewage discharge within 15 meters', completed: false, isFlagged: false },
      { id: 'chk_4', label: 'Inadequate or broken apron drainage around tube-well', completed: false, isFlagged: false },
      { id: 'chk_5', label: 'Chlorination apparatus functioning / residual odor detected', completed: false },
      { id: 'chk_6', label: 'Storage reservoir lid sealed and sanitary condition acceptable', completed: false },
      { id: 'chk_7', label: 'Distribution pipe leakage or negative pressure backflow observed', completed: false, isFlagged: false },
      { id: 'chk_8', label: 'Monsoon inundation or flood overflow touching source head', completed: false, isFlagged: false },
      { id: 'chk_9', label: 'Unusual septic odor or hydrocarbon sheen observed', completed: false, isFlagged: false },
      { id: 'chk_10', label: 'Community members reported recent stomach distress or taste change', completed: false, isFlagged: false },
    ];
  }

  private seedBaselineFieldTasks(): void {
    const taskPatna1: FieldTask = {
      taskId: 'FT_PATNA_2026_001',
      alertId: 'ALT_PATNA_ADD_2026_01',
      predictionId: 'PRED_PATNA_2026_01',
      districtId: 'patna_bihar',
      districtName: 'Patna',
      state: 'Bihar',
      waterSourceId: 'ws_patna_danapur_01',
      waterSourceName: 'Danapur Community Tube-well Cluster',
      assignedWorkerId: 'usr_field_patna_01',
      assignedWorkerName: 'Rajesh Kumar (Senior MPHW)',
      assignedBy: 'Dr. A. P. Singh (Chief Medical Officer)',
      title: 'Water Source Sanitary Survey & Microbial Sample Collection',
      description: 'Elevated predicted risk for acute diarrheal illness triggered by upstream turbidity surge (14.2 NTU). Inspect tube-well cluster and collect sterile drinking water samples.',
      taskType: 'WATER_SOURCE_INVESTIGATION',
      priority: 'HIGH',
      deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      status: 'IN_PROGRESS',
      checklistItems: [
        { id: 'chk_1', label: 'Source accessible for community and sampling', completed: true },
        { id: 'chk_2', label: 'Water visibly discolored or high apparent turbidity', completed: true, isFlagged: true, notes: 'Slight yellow turbidity observed' },
        { id: 'chk_3', label: 'Open waste / animal dung / sewage discharge within 15 meters', completed: true, isFlagged: true, notes: 'Uncovered municipal drain 8m upstream' },
        { id: 'chk_4', label: 'Inadequate or broken apron drainage around tube-well', completed: false },
        { id: 'chk_5', label: 'Chlorination apparatus functioning / residual odor detected', completed: false },
        { id: 'chk_6', label: 'Storage reservoir lid sealed and sanitary condition acceptable', completed: false },
        { id: 'chk_7', label: 'Distribution pipe leakage or negative pressure backflow observed', completed: false },
        { id: 'chk_8', label: 'Monsoon inundation or flood overflow touching source head', completed: false },
        { id: 'chk_9', label: 'Unusual septic odor or hydrocarbon sheen observed', completed: false },
        { id: 'chk_10', label: 'Community members reported recent stomach distress or taste change', completed: false },
      ],
      requiredSamplesCount: 2,
      evidenceRequirements: 'At least 1 geotagged photograph of source apron, 1 water sample in sterile PET bottle on ice, DPD residual chlorine field test.',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    };

    const taskPatna2: FieldTask = {
      taskId: 'FT_PATNA_2026_002',
      alertId: 'ALT_PATNA_ADD_2026_01',
      predictionId: 'PRED_PATNA_2026_01',
      districtId: 'patna_bihar',
      districtName: 'Patna',
      state: 'Bihar',
      waterSourceId: 'ws_patna_digha_02',
      waterSourceName: 'Digha Ghat River Intake Pipe',
      assignedWorkerId: 'usr_field_patna_01',
      assignedWorkerName: 'Rajesh Kumar (Senior MPHW)',
      assignedBy: 'Dr. A. P. Singh (Chief Medical Officer)',
      title: 'River Intake Free Chlorine & Turbidity Verification',
      description: 'Check post-chlorination residual at Digha pump station following Ganga stage rise. Verify whether residual chlorine meets 0.5 mg/L minimum target.',
      taskType: 'RESIDUAL_CHLORINE_CHECK',
      priority: 'URGENT',
      deadline: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
      status: 'PENDING',
      checklistItems: FieldOperationsEngine.getDefaultInspectionChecklist(),
      requiredSamplesCount: 1,
      evidenceRequirements: 'Digital colorimeter photo log, residual chlorine measurement, intake valve photograph.',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    };

    const taskKhordha1: FieldTask = {
      taskId: 'FT_KHORDHA_2026_001',
      alertId: 'ALT_KHORDHA_CHOL_2026_02',
      predictionId: 'PRED_KHORDHA_2026_01',
      districtId: 'khordha_odisha',
      districtName: 'Khordha',
      state: 'Odisha',
      waterSourceId: 'ws_khordha_puri_canal',
      waterSourceName: 'Puri Main Canal Village Inflow Point',
      assignedWorkerId: 'usr_field_khordha_01',
      assignedWorkerName: 'Bijay Mohapatra (Health Inspector)',
      assignedBy: 'Dr. S. Mohanty (District Surveillance Officer)',
      title: 'Canal Overflow Sanitary Survey & E. coli Screening',
      description: 'Continuous moderate risk prediction for Cholera following heavy rainfall in Mahanadi delta. Collect 3 water samples for microbiological culture.',
      taskType: 'EMERGENCY_SAMPLE_COLLECTION',
      priority: 'HIGH',
      deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'PENDING',
      checklistItems: FieldOperationsEngine.getDefaultInspectionChecklist(),
      requiredSamplesCount: 3,
      evidenceRequirements: '3 sterile water samples, cold-chain GPS tracking, sanitary survey checklist.',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    };

    this.tasks.set(taskPatna1.taskId, taskPatna1);
    this.tasks.set(taskPatna2.taskId, taskPatna2);
    this.tasks.set(taskKhordha1.taskId, taskKhordha1);

    // Initial baseline observation
    const obs1: FieldObservation = {
      observationId: 'OBS_PATNA_2026_001',
      taskId: 'FT_PATNA_2026_001',
      workerId: 'usr_field_patna_01',
      workerName: 'Rajesh Kumar',
      districtId: 'patna_bihar',
      latitude: 25.6186,
      longitude: 85.0442,
      locationAccuracy: 8.5, // 8.5 meters accuracy
      locationVerified: true,
      observationType: 'FIELD_MEASUREMENT',
      fieldName: 'Residual Free Chlorine',
      value: '0.1',
      unit: 'mg/L',
      notes: 'Below minimum protective standard (0.2 mg/L). Re-chlorination recommended.',
      fileReference: 'PHOTO_CHLORINE_TEST_PATNA_01.jpg',
      observedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    };
    this.observations.set(obs1.observationId, obs1);
  }

  public getTasks(filters?: {
    workerId?: string;
    districtId?: string;
    status?: FieldTaskStatus;
    priority?: FieldTaskPriority;
  }): FieldTask[] {
    let result = Array.from(this.tasks.values());

    if (filters?.workerId) {
      result = result.filter((t) => t.assignedWorkerId === filters.workerId);
    }
    if (filters?.districtId) {
      result = result.filter((t) => t.districtId === filters.districtId);
    }
    if (filters?.status) {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters?.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getTaskById(taskId: string): FieldTask | null {
    return this.tasks.get(taskId) || null;
  }

  public createTask(data: {
    alertId?: string;
    predictionId?: string;
    districtId: string;
    districtName: string;
    state?: string;
    waterSourceId?: string;
    waterSourceName?: string;
    assignedWorkerId: string;
    assignedWorkerName: string;
    assignedBy: string;
    title: string;
    description: string;
    taskType: FieldTaskType;
    priority: FieldTaskPriority;
    deadline: string;
    requiredSamplesCount?: number;
    evidenceRequirements?: string;
  }): FieldTask {
    const seq = this.tasks.size + 1;
    const districtPrefix = data.districtId.split('_')[0].toUpperCase();
    const taskId = `FT_${districtPrefix}_2026_${String(seq).padStart(3, '0')}`;

    const newTask: FieldTask = {
      taskId,
      alertId: data.alertId,
      predictionId: data.predictionId,
      districtId: data.districtId,
      districtName: data.districtName,
      state: data.state || 'Bihar',
      waterSourceId: data.waterSourceId,
      waterSourceName: data.waterSourceName || 'Community Drinking Water Point',
      assignedWorkerId: data.assignedWorkerId,
      assignedWorkerName: data.assignedWorkerName,
      assignedBy: data.assignedBy,
      title: data.title,
      description: data.description,
      taskType: data.taskType,
      priority: data.priority,
      deadline: data.deadline,
      status: 'PENDING',
      checklistItems: FieldOperationsEngine.getDefaultInspectionChecklist(),
      requiredSamplesCount: data.requiredSamplesCount ?? 1,
      evidenceRequirements: data.evidenceRequirements || 'Geotagged photographic verification and water sample collection metadata.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(taskId, newTask);
    return newTask;
  }

  public updateTaskChecklist(taskId: string, checklistItems: ChecklistItem[], notes?: string): { success: boolean; task?: FieldTask; error?: string } {
    const task = this.tasks.get(taskId);
    if (!task) return { success: false, error: 'Task not found' };

    task.checklistItems = checklistItems;
    task.updatedAt = new Date().toISOString();

    const allCompleted = checklistItems.every((item) => item.completed);
    if (allCompleted && task.status !== 'COMPLETED') {
      task.status = 'COMPLETED';
      task.completedAt = new Date().toISOString();
    } else if (task.status === 'PENDING') {
      task.status = 'IN_PROGRESS';
    }

    return { success: true, task };
  }

  public updateTaskStatus(taskId: string, status: FieldTaskStatus): { success: boolean; task?: FieldTask; error?: string } {
    const task = this.tasks.get(taskId);
    if (!task) return { success: false, error: 'Task not found' };

    task.status = status;
    task.updatedAt = new Date().toISOString();
    if (status === 'COMPLETED') {
      task.completedAt = new Date().toISOString();
    }

    return { success: true, task };
  }

  public recordObservation(data: {
    taskId: string;
    worker: GovernmentUser;
    latitude?: number | null;
    longitude?: number | null;
    locationAccuracy?: number | null;
    observationType: 'CHECKLIST' | 'VISUAL' | 'SENSOR_READING' | 'FIELD_MEASUREMENT' | 'COMMUNITY_REPORT';
    fieldName: string;
    value: string;
    unit?: string;
    notes?: string;
    fileReference?: string;
  }): FieldObservation {
    const task = this.tasks.get(data.taskId);
    const districtId = task ? task.districtId : data.worker.assignment.districtId || 'patna_bihar';

    const seq = this.observations.size + 1;
    const observationId = `OBS_${data.worker.userId.slice(-6)}_${Date.now()}_${seq}`;

    // Verify GPS: must have lat, lng, and reasonable accuracy <= 50m
    const hasCoordinates = typeof data.latitude === 'number' && typeof data.longitude === 'number' &&
      !isNaN(data.latitude) && !isNaN(data.longitude) &&
      data.latitude >= -90 && data.latitude <= 90 &&
      data.longitude >= -180 && data.longitude <= 180;

    const locationVerified = Boolean(
      hasCoordinates &&
      typeof data.locationAccuracy === 'number' &&
      data.locationAccuracy > 0 &&
      data.locationAccuracy <= 50
    );

    const obs: FieldObservation = {
      observationId,
      taskId: data.taskId,
      workerId: data.worker.userId,
      workerName: data.worker.fullName,
      districtId,
      latitude: hasCoordinates ? data.latitude! : null,
      longitude: hasCoordinates ? data.longitude! : null,
      locationAccuracy: data.locationAccuracy ?? null,
      locationVerified,
      observationType: data.observationType,
      fieldName: data.fieldName,
      value: data.value,
      unit: data.unit,
      notes: data.notes,
      fileReference: data.fileReference,
      observedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.observations.set(observationId, obs);
    return obs;
  }

  public getObservations(taskId?: string): FieldObservation[] {
    let result = Array.from(this.observations.values());
    if (taskId) {
      result = result.filter((o) => o.taskId === taskId);
    }
    return result.sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());
  }

  /**
   * Process offline batch sync queue submitted when internet connection is restored
   */
  public processOfflineSync(payload: OfflineSyncPayload): OfflineSyncResult {
    if (!payload.syncId) {
      return {
        syncId: 'UNKNOWN',
        success: false,
        processedCount: 0,
        duplicateCount: 0,
        errors: ['Missing syncId for idempotency verification'],
        syncedAt: new Date().toISOString(),
      };
    }

    // Duplicate sync detection
    if (this.processedSyncIds.has(payload.syncId)) {
      return {
        syncId: payload.syncId,
        success: true,
        processedCount: 0,
        duplicateCount: 1,
        errors: [],
        syncedAt: new Date().toISOString(),
      };
    }

    let processedCount = 0;
    const errors: string[] = [];

    // Process offline task updates
    if (payload.completedTasks && Array.isArray(payload.completedTasks)) {
      for (const item of payload.completedTasks) {
        const task = this.tasks.get(item.taskId);
        if (task) {
          if (item.checklistItems) {
            task.checklistItems = item.checklistItems;
          }
          task.status = 'COMPLETED';
          task.completedAt = item.completedAt || new Date().toISOString();
          task.updatedAt = new Date().toISOString();
          processedCount++;
        } else {
          errors.push(`Task ${item.taskId} not found on server during offline sync`);
        }
      }
    }

    // Process offline observations
    if (payload.observations && Array.isArray(payload.observations)) {
      for (const obs of payload.observations) {
        if (!this.observations.has(obs.observationId)) {
          this.observations.set(obs.observationId, {
            ...obs,
            createdAt: new Date().toISOString(),
          });
          processedCount++;
        }
      }
    }

    this.processedSyncIds.add(payload.syncId);

    return {
      syncId: payload.syncId,
      success: errors.length === 0,
      processedCount,
      duplicateCount: 0,
      errors,
      syncedAt: new Date().toISOString(),
    };
  }
}
