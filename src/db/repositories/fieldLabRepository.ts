/**
 * JalDrishti Field Operations, Water Samples & Laboratory Repository
 * Connects to PostgreSQL PostGIS tables with resilient in-memory engine fallback.
 */

import { DatabaseManager } from '../connection.js';
import { FieldOperationsEngine, FieldTask, FieldObservation } from '../../services/operations/fieldOperationsEngine.js';
import { WaterSampleEngine, WaterSample, CustodyRecord } from '../../services/operations/waterSampleEngine.js';
import { LabVerificationEngine, LabTestResult, LaboratoryRecord } from '../../services/operations/labVerificationEngine.js';
import { PredictionOutcomeEngine, PredictionOutcomeRecord } from '../../services/operations/predictionOutcomeEngine.js';

export class FieldLabRepository {
  private static instance: FieldLabRepository;
  private db: DatabaseManager;

  private fieldEngine: FieldOperationsEngine;
  private sampleEngine: WaterSampleEngine;
  private labEngine: LabVerificationEngine;
  private outcomeEngine: PredictionOutcomeEngine;

  private constructor() {
    this.db = DatabaseManager.getInstance();
    this.fieldEngine = FieldOperationsEngine.getInstance();
    this.sampleEngine = WaterSampleEngine.getInstance();
    this.labEngine = LabVerificationEngine.getInstance();
    this.outcomeEngine = PredictionOutcomeEngine.getInstance();
  }

  public static getInstance(): FieldLabRepository {
    if (!FieldLabRepository.instance) {
      FieldLabRepository.instance = new FieldLabRepository();
    }
    return FieldLabRepository.instance;
  }

  // --- Field Tasks ---
  public async getFieldTasks(workerId?: string, districtId?: string): Promise<FieldTask[]> {
    if (this.db.getStatus().isConnected) {
      try {
        let query = 'SELECT * FROM field_tasks WHERE 1=1';
        const params: any[] = [];
        if (workerId) {
          params.push(workerId);
          query += ` AND assigned_worker_id = $${params.length}`;
        }
        if (districtId) {
          params.push(districtId);
          query += ` AND district_id = $${params.length}`;
        }
        query += ' ORDER BY created_at DESC';
        const res = await this.db.query<any>(query, params);
        if (res && res.rows.length > 0) {
          return res.rows.map((r: any) => ({
            taskId: r.task_id,
            alertId: r.alert_id,
            predictionId: r.prediction_id,
            districtId: r.district_id,
            districtName: r.district_name || 'District',
            state: r.state || 'State',
            waterSourceId: r.water_source_id,
            waterSourceName: r.water_source_name,
            assignedWorkerId: r.assigned_worker_id,
            assignedWorkerName: r.assigned_worker_name,
            assignedBy: r.assigned_by,
            title: r.title,
            description: r.description,
            taskType: r.task_type,
            priority: r.priority,
            deadline: r.deadline,
            status: r.status,
            checklistItems: r.checklist_items || [],
            requiredSamplesCount: r.required_samples_count,
            evidenceRequirements: r.evidence_requirements,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            completedAt: r.completed_at,
          }));
        }
      } catch (err) {
        console.warn('[FieldLabRepository] Query error, falling back to engine:', err);
      }
    }
    return this.fieldEngine.getTasks({ workerId, districtId });
  }

  // --- Water Samples ---
  public async getWaterSamples(districtId?: string): Promise<WaterSample[]> {
    if (this.db.getStatus().isConnected) {
      try {
        const res = await this.db.query<any>('SELECT * FROM water_samples ORDER BY collection_timestamp DESC');
        if (res && res.rows.length > 0) {
          return res.rows.map((r: any) => ({
            sampleId: r.sample_id,
            taskId: r.task_id,
            alertId: r.alert_id,
            predictionId: r.prediction_id,
            districtId: r.district_id,
            districtName: r.district_name || 'District',
            waterSourceId: r.water_source_id,
            waterSourceName: r.water_source_name || 'Source',
            collectorId: r.collector_id,
            collectorName: r.collector_name,
            collectorRole: r.collector_role || 'FIELD_WORKER',
            latitude: r.latitude,
            longitude: r.longitude,
            locationAccuracy: r.location_accuracy,
            locationVerified: r.location_verified,
            collectionTimestamp: r.collection_timestamp,
            sampleType: r.sample_type,
            containerType: r.container_type,
            preservationMethod: r.preservation_method,
            transportCondition: r.transport_condition,
            qcStatus: r.qc_status,
            qcNotes: r.qc_notes,
            status: r.status,
            custodyTrail: [],
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));
        }
      } catch (err) {
        console.warn('[FieldLabRepository] Sample query error, falling back to engine:', err);
      }
    }
    return this.sampleEngine.getSamples({ districtId });
  }

  // --- Laboratories ---
  public async getLaboratories(): Promise<LaboratoryRecord[]> {
    return this.labEngine.getLaboratories();
  }

  // --- Lab Results ---
  public async getLabResults(sampleId?: string): Promise<LabTestResult[]> {
    return this.labEngine.getResults(sampleId);
  }

  // --- Prediction Outcomes ---
  public async getPredictionOutcomes(): Promise<PredictionOutcomeRecord[]> {
    return this.outcomeEngine.getOutcomes();
  }
}
