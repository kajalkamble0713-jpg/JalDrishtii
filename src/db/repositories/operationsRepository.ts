/**
 * JalDrishti Public Health Operations & Interventions Repository
 * Handles early warning alerts, alert dispatch lifecycle, WASH interventions, and supply resources.
 */

import { DatabaseManager } from '../connection.js';
import { RECENT_ALERTS } from '../../data/jaldrishtiData.js';
import { OutbreakAlert } from '../../types.js';

export interface AlertRecord {
  alertId: string;
  districtId: string;
  predictionId?: string;
  diseaseCode: string;
  riskTier: string;
  triggerFactor: string;
  isAcknowledged: boolean;
  dispatchedAt: string;
  districtName?: string;
  state?: string;
  riskScore?: number;
}

export interface InterventionRecord {
  interventionId: string;
  districtId: string;
  alertId?: string;
  washProtocolName: string;
  actionsChecklist: string[];
  targetStartDate?: string;
  status: 'RECOMMENDED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ResourceRecord {
  resourceId: string;
  name: string;
  category: string;
  unitOfMeasure: string;
  unitCostInr: number;
}

export class OperationsRepository {
  private static instance: OperationsRepository;

  private inMemoryAlerts: AlertRecord[] = RECENT_ALERTS.map((a) => ({
    alertId: a.id,
    districtId: a.districtId,
    diseaseCode: a.disease,
    riskTier: a.riskTier,
    triggerFactor: a.triggerFactor,
    isAcknowledged: false,
    dispatchedAt: new Date().toISOString(),
    districtName: a.districtName,
    state: a.state,
    riskScore: a.riskScore,
  }));

  private inMemoryInterventions: InterventionRecord[] = [
    {
      interventionId: 'INT_PATNA_01',
      districtId: 'patna_bihar',
      washProtocolName: 'Hyper-Chlorination & Rapid Surface Intake Filtration',
      actionsChecklist: [
        'Deploy 500kg sodium hypochlorite to WTP intake',
        'Issue boil-water advisory across Ward 12-24',
        'Stockpile 5,000 ORS sachets at Primary Health Centres',
      ],
      targetStartDate: new Date().toISOString().split('T')[0],
      status: 'RECOMMENDED',
    },
    {
      interventionId: 'INT_BHAGALPUR_01',
      districtId: 'bhagalpur_bihar',
      washProtocolName: 'Mobile RO Purification & Well Shock-Chlorination',
      actionsChecklist: [
        'Mobilize emergency water purification tankers',
        'Conduct household chlorine residual audits',
        'Targeted bacteriological testing of shallow handpumps',
      ],
      targetStartDate: new Date().toISOString().split('T')[0],
      status: 'IN_PROGRESS',
    },
  ];

  private inMemoryResources: ResourceRecord[] = [
    {
      resourceId: 'RES_CHLORINE_TABS',
      name: 'Sodium Dichloroisocyanurate (NaDCC) Tablets (10,000 pack)',
      category: 'WASH Supply',
      unitOfMeasure: 'Box',
      unitCostInr: 1250,
    },
    {
      resourceId: 'RES_ORS_SACHETS',
      name: 'WHO-Formula Low-Osmolarity ORS Sachets (1,000 pack)',
      category: 'Clinical Diagnostics',
      unitOfMeasure: 'Box',
      unitCostInr: 3400,
    },
    {
      resourceId: 'RES_RO_BARGE',
      name: 'Trailer-Mounted 5,000 LPH Emergency RO Purification Unit',
      category: 'Purification Equipment',
      unitOfMeasure: 'Unit',
      unitCostInr: 450000,
    },
  ];

  private constructor() {}

  public static getInstance(): OperationsRepository {
    if (!OperationsRepository.instance) {
      OperationsRepository.instance = new OperationsRepository();
    }
    return OperationsRepository.instance;
  }

  public async getAlerts(districtId?: string): Promise<AlertRecord[]> {
    const db = DatabaseManager.getInstance();
    let sql = `
      SELECT a.alert_id, a.district_id, a.prediction_id, a.disease_code, a.risk_tier,
             a.trigger_factor, a.is_acknowledged, a.dispatched_at, d.name as district_name,
             s.name as state_name
      FROM alerts a
      LEFT JOIN districts d ON a.district_id = d.district_id
      LEFT JOIN states s ON d.state_id = s.state_id
      WHERE 1=1
    `;
    const values: any[] = [];
    if (districtId) {
      sql += ` AND a.district_id = $1`;
      values.push(districtId);
    }
    sql += ` ORDER BY a.dispatched_at DESC LIMIT 50;`;

    const res = await db.query<any>(sql, values);
    if (res && res.rows.length > 0) {
      return res.rows.map((r) => ({
        alertId: r.alert_id,
        districtId: r.district_id,
        predictionId: r.prediction_id,
        diseaseCode: r.disease_code,
        riskTier: r.risk_tier,
        triggerFactor: r.trigger_factor,
        isAcknowledged: r.is_acknowledged,
        dispatchedAt: r.dispatched_at,
        districtName: r.district_name,
        state: r.state_name,
      }));
    }

    return districtId
      ? this.inMemoryAlerts.filter((a) => a.districtId === districtId)
      : this.inMemoryAlerts;
  }

  public async acknowledgeAlert(alertId: string, actorName = 'Health Officer'): Promise<boolean> {
    const db = DatabaseManager.getInstance();
    await db.query(`UPDATE alerts SET is_acknowledged = TRUE WHERE alert_id = $1;`, [alertId]);
    await db.query(
      `INSERT INTO alert_events (alert_id, event_type, actor_name, notes)
       VALUES ($1, 'ACKNOWLEDGED', $2, 'Acknowledged via Operations Command Console');`,
      [alertId, actorName]
    );

    const target = this.inMemoryAlerts.find((a) => a.alertId === alertId);
    if (target) target.isAcknowledged = true;
    return true;
  }

  public async getInterventions(districtId?: string): Promise<InterventionRecord[]> {
    const db = DatabaseManager.getInstance();
    let sql = `
      SELECT intervention_id, district_id, alert_id, wash_protocol_name,
             actions_checklist, target_start_date, status
      FROM interventions
      WHERE 1=1
    `;
    const values: any[] = [];
    if (districtId) {
      sql += ` AND district_id = $1`;
      values.push(districtId);
    }
    sql += ` ORDER BY created_at DESC;`;

    const res = await db.query<any>(sql, values);
    if (res && res.rows.length > 0) {
      return res.rows.map((r) => ({
        interventionId: r.intervention_id,
        districtId: r.district_id,
        alertId: r.alert_id,
        washProtocolName: r.wash_protocol_name,
        actionsChecklist: Array.isArray(r.actions_checklist) ? r.actions_checklist : [],
        targetStartDate: r.target_start_date,
        status: r.status,
      }));
    }

    return districtId
      ? this.inMemoryInterventions.filter((i) => i.districtId === districtId)
      : this.inMemoryInterventions;
  }

  public async getResources(): Promise<ResourceRecord[]> {
    const db = DatabaseManager.getInstance();
    const res = await db.query<any>(
      `SELECT resource_id, name, category, unit_of_measure, unit_cost_inr FROM resources ORDER BY name ASC;`
    );
    if (res && res.rows.length > 0) {
      return res.rows.map((r) => ({
        resourceId: r.resource_id,
        name: r.name,
        category: r.category,
        unitOfMeasure: r.unit_of_measure,
        unitCostInr: r.unit_cost_inr,
      }));
    }

    return this.inMemoryResources;
  }
}
