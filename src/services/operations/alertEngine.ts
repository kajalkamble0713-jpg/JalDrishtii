/**
 * JalDrishti Government Alert Generation, Lifecycle & Escalation Engine
 * Evaluates ML predictions, generates audited alerts, tracks status transitions,
 * and executes multi-tier escalation policies.
 */

import { DiseaseType } from '../../types.js';
import { GovernmentUser } from '../auth/rbacEngine.js';

export type AlertSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';

export type AlertStatus =
  | 'NEW'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'DISMISSED'
  | 'EXPIRED';

export interface AlertHistoryEntry {
  historyId: string;
  alertId: string;
  fromStatus: AlertStatus;
  toStatus: AlertStatus;
  changedBy: string;
  actorName: string;
  notes: string;
  timestamp: string;
}

export interface GovernmentAlert {
  alertId: string;
  predictionId: string;
  districtId: string;
  districtName: string;
  state: string;
  disease: DiseaseType;
  severity: AlertSeverity;
  riskScore: number;
  confidence: number;
  triggerFactor: string;
  scientificRationale: string;
  status: AlertStatus;
  assignedOfficerName?: string;
  assignedOfficerId?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  closedAt?: string;
  closedBy?: string;
  closureReason?: string;
  escalationLevel: number; // 1 = District, 2 = State, 3 = National
  dataQualityScore: number;
  createdAt: string;
  expiresAt: string;
  history: AlertHistoryEntry[];
}

export interface InAppNotification {
  notificationId: string;
  alertId: string;
  recipientEmail: string;
  recipientName: string;
  role: string;
  channel: 'IN_APP' | 'EMAIL_STUB' | 'SMS_STUB';
  status: 'DELIVERED' | 'FAILED';
  title: string;
  message: string;
  sentAt: string;
}

// Configurable Government Risk Threshold Decision Matrix
export const RISK_THRESHOLDS = {
  CRITICAL: 0.85,
  VERY_HIGH: 0.75,
  HIGH: 0.60,
  MODERATE: 0.40,
  LOW: 0.0,
};

export class AlertEngine {
  private static instance: AlertEngine;

  private alerts: Map<string, GovernmentAlert> = new Map();
  private notifications: InAppNotification[] = [];

  private constructor() {
    this.seedBaselineGovernmentAlerts();
  }

  public static getInstance(): AlertEngine {
    if (!AlertEngine.instance) {
      AlertEngine.instance = new AlertEngine();
    }
    return AlertEngine.instance;
  }

  private seedBaselineGovernmentAlerts(): void {
    const patnaAlertId = 'ALT_PATNA_ADD_2026_01';
    this.alerts.set(patnaAlertId, {
      alertId: patnaAlertId,
      predictionId: 'PRED_PATNA_ADD_2026_08',
      districtId: 'patna_bihar',
      districtName: 'Patna',
      state: 'Bihar',
      disease: 'ADD',
      severity: 'CRITICAL',
      riskScore: 0.88,
      confidence: 0.91,
      triggerFactor: 'High Sentinel-2 Turbidity (4.82 FNU) + Diurnal Thermal Anomaly',
      scientificRationale:
        'Elevated predicted risk detected based on multi-spectral turbidity exceeding the 3.5 FNU safety threshold combined with post-monsoon river stage height.',
      status: 'NEW',
      escalationLevel: 3, // Multi-tier: District + State + National
      dataQualityScore: 94,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h ago
      expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days
      history: [
        {
          historyId: 'HIST_PATNA_01',
          alertId: patnaAlertId,
          fromStatus: 'NEW',
          toStatus: 'NEW',
          changedBy: 'system',
          actorName: 'Automated ML Risk Threshold Evaluator',
          notes: 'Alert triggered automatically upon ML feature store risk inference (>0.85 CRITICAL).',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
      ],
    });

    const bhagalpurAlertId = 'ALT_BHAGALPUR_CHOLERA_02';
    this.alerts.set(bhagalpurAlertId, {
      alertId: bhagalpurAlertId,
      predictionId: 'PRED_BHAGALPUR_CHOLERA_08',
      districtId: 'bhagalpur_bihar',
      districtName: 'Bhagalpur',
      state: 'Bihar',
      disease: 'Cholera',
      severity: 'VERY_HIGH',
      riskScore: 0.78,
      confidence: 0.86,
      triggerFactor: 'NDCI Algal Chlorophyll Bloom (0.34) in Ganges Downstream Reach',
      scientificRationale:
        'Elevated planktonic bloom proxy and warm alkaline water temperature conducive to Vibrio cholerae survival.',
      status: 'ACKNOWLEDGED',
      assignedOfficerName: 'Dr. A. P. Singh (District Health Officer)',
      assignedOfficerId: 'usr_cmo_patna_01',
      acknowledgedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      acknowledgedBy: 'Dr. A. P. Singh',
      escalationLevel: 2, // District + State
      dataQualityScore: 89,
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
      history: [
        {
          historyId: 'HIST_BHAG_01',
          alertId: bhagalpurAlertId,
          fromStatus: 'NEW',
          toStatus: 'NEW',
          changedBy: 'system',
          actorName: 'Automated ML Risk Evaluator',
          notes: 'Initial alert created at VERY_HIGH threshold.',
          timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        },
        {
          historyId: 'HIST_BHAG_02',
          alertId: bhagalpurAlertId,
          fromStatus: 'NEW',
          toStatus: 'ACKNOWLEDGED',
          changedBy: 'usr_cmo_patna_01',
          actorName: 'Dr. A. P. Singh (CMO)',
          notes: 'Acknowledged receipt of risk advisory; dispatching water surveillance team.',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
    });

    const varanasiAlertId = 'ALT_VARANASI_TYPHOID_03';
    this.alerts.set(varanasiAlertId, {
      alertId: varanasiAlertId,
      predictionId: 'PRED_VARANASI_TYPHOID_08',
      districtId: 'varanasi_up',
      districtName: 'Varanasi',
      state: 'Uttar Pradesh',
      disease: 'Typhoid',
      severity: 'HIGH',
      riskScore: 0.68,
      confidence: 0.82,
      triggerFactor: 'High Social Vulnerability Index (0.64) + Slower River Drainage',
      scientificRationale:
        'Unchlorinated municipal supply and dense urban riverfront drainage lag.',
      status: 'ASSIGNED',
      assignedOfficerName: 'Er. S. N. Mishra (Water Dept)',
      assignedOfficerId: 'usr_phed_patna_01',
      acknowledgedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      acknowledgedBy: 'District Health Officer',
      escalationLevel: 1, // District
      dataQualityScore: 91,
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
      history: [
        {
          historyId: 'HIST_VAR_01',
          alertId: varanasiAlertId,
          fromStatus: 'NEW',
          toStatus: 'ASSIGNED',
          changedBy: 'usr_dm_patna_01',
          actorName: 'Smt. Chandana Kumar, IAS (Collector)',
          notes: 'Assigned to PHED team for intake chlorination testing.',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
      ],
    });
  }

  public getAlerts(filter?: {
    districtId?: string;
    stateId?: string;
    status?: AlertStatus;
    severity?: AlertSeverity;
    disease?: DiseaseType;
  }): GovernmentAlert[] {
    let result = Array.from(this.alerts.values());

    if (filter?.districtId) {
      result = result.filter((a) => a.districtId === filter.districtId);
    }
    if (filter?.stateId) {
      result = result.filter((a) => a.state.toLowerCase() === filter.stateId?.toLowerCase());
    }
    if (filter?.status) {
      result = result.filter((a) => a.status === filter.status);
    }
    if (filter?.severity) {
      result = result.filter((a) => a.severity === filter.severity);
    }
    if (filter?.disease) {
      result = result.filter((a) => a.disease === filter.disease);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAlertById(alertId: string): GovernmentAlert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Evaluates an ML Risk Prediction and generates an Alert if above threshold
   */
  public evaluatePrediction(params: {
    predictionId: string;
    districtId: string;
    districtName: string;
    state: string;
    disease: DiseaseType;
    riskScore: number;
    confidence: number;
    triggerFactor: string;
    scientificRationale: string;
    dataQualityScore: number;
  }): GovernmentAlert | null {
    let severity: AlertSeverity | null = null;
    let escalationLevel = 1;

    if (params.riskScore >= RISK_THRESHOLDS.CRITICAL) {
      severity = 'CRITICAL';
      escalationLevel = 3;
    } else if (params.riskScore >= RISK_THRESHOLDS.VERY_HIGH) {
      severity = 'VERY_HIGH';
      escalationLevel = 2;
    } else if (params.riskScore >= RISK_THRESHOLDS.HIGH) {
      severity = 'HIGH';
      escalationLevel = 1;
    } else if (params.riskScore >= RISK_THRESHOLDS.MODERATE) {
      severity = 'MODERATE';
      escalationLevel = 1;
    }

    if (!severity) return null; // Below threshold

    const alertId = `ALT_${params.districtId.toUpperCase()}_${Date.now()}`;
    const newAlert: GovernmentAlert = {
      alertId,
      predictionId: params.predictionId,
      districtId: params.districtId,
      districtName: params.districtName,
      state: params.state,
      disease: params.disease,
      severity,
      riskScore: params.riskScore,
      confidence: params.confidence,
      triggerFactor: params.triggerFactor,
      scientificRationale: params.scientificRationale,
      status: 'NEW',
      escalationLevel,
      dataQualityScore: params.dataQualityScore,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
      history: [
        {
          historyId: `HIST_${Date.now()}`,
          alertId,
          fromStatus: 'NEW',
          toStatus: 'NEW',
          changedBy: 'system',
          actorName: 'Automated ML Risk Evaluator',
          notes: `Predicted risk evaluated at ${severity} level (${Math.round(params.riskScore * 100)}%).`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    this.alerts.set(alertId, newAlert);

    // Dispatch in-app notification to officer inboxes
    this.dispatchNotification(newAlert);

    return newAlert;
  }

  /**
   * Officer Acknowledgment Workflow (NEW -> ACKNOWLEDGED)
   */
  public acknowledgeAlert(
    alertId: string,
    officer: GovernmentUser,
    notes?: string
  ): { success: boolean; alert?: GovernmentAlert; error?: string } {
    const alert = this.alerts.get(alertId);
    if (!alert) return { success: false, error: 'Alert not found' };

    const fromStatus = alert.status;
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = officer.fullName;

    const historyEntry: AlertHistoryEntry = {
      historyId: `HIST_${Date.now()}`,
      alertId,
      fromStatus,
      toStatus: 'ACKNOWLEDGED',
      changedBy: officer.userId,
      actorName: officer.fullName,
      notes: notes || `Alert formally acknowledged by ${officer.designation}.`,
      timestamp: new Date().toISOString(),
    };
    alert.history.push(historyEntry);

    return { success: true, alert };
  }

  /**
   * Task Assignment Workflow (ACKNOWLEDGED / NEW -> ASSIGNED)
   */
  public assignAlert(
    alertId: string,
    officer: GovernmentUser,
    assigneeName: string,
    assigneeId?: string,
    notes?: string
  ): { success: boolean; alert?: GovernmentAlert; error?: string } {
    const alert = this.alerts.get(alertId);
    if (!alert) return { success: false, error: 'Alert not found' };

    const fromStatus = alert.status;
    alert.status = 'ASSIGNED';
    alert.assignedOfficerName = assigneeName;
    alert.assignedOfficerId = assigneeId;

    const historyEntry: AlertHistoryEntry = {
      historyId: `HIST_${Date.now()}`,
      alertId,
      fromStatus,
      toStatus: 'ASSIGNED',
      changedBy: officer.userId,
      actorName: officer.fullName,
      notes: notes || `Field task assigned to ${assigneeName}.`,
      timestamp: new Date().toISOString(),
    };
    alert.history.push(historyEntry);

    return { success: true, alert };
  }

  /**
   * Alert Escalation Workflow (-> ESCALATED)
   */
  public escalateAlert(
    alertId: string,
    officer: GovernmentUser,
    escalateToTier: number,
    reason: string
  ): { success: boolean; alert?: GovernmentAlert; error?: string } {
    const alert = this.alerts.get(alertId);
    if (!alert) return { success: false, error: 'Alert not found' };

    const fromStatus = alert.status;
    alert.status = 'ESCALATED';
    alert.escalationLevel = Math.max(alert.escalationLevel, escalateToTier);

    const historyEntry: AlertHistoryEntry = {
      historyId: `HIST_${Date.now()}`,
      alertId,
      fromStatus,
      toStatus: 'ESCALATED',
      changedBy: officer.userId,
      actorName: officer.fullName,
      notes: `Escalated to Tier ${escalateToTier} by ${officer.designation}. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
    };
    alert.history.push(historyEntry);

    return { success: true, alert };
  }

  /**
   * Alert Resolution / Closure Workflow (-> RESOLVED / CLOSED)
   */
  public closeAlert(
    alertId: string,
    officer: GovernmentUser,
    reason: string,
    targetStatus: 'RESOLVED' | 'CLOSED' | 'DISMISSED' = 'RESOLVED'
  ): { success: boolean; alert?: GovernmentAlert; error?: string } {
    const alert = this.alerts.get(alertId);
    if (!alert) return { success: false, error: 'Alert not found' };

    const fromStatus = alert.status;
    alert.status = targetStatus;
    alert.closedAt = new Date().toISOString();
    alert.closedBy = officer.fullName;
    alert.closureReason = reason;

    const historyEntry: AlertHistoryEntry = {
      historyId: `HIST_${Date.now()}`,
      alertId,
      fromStatus,
      toStatus: targetStatus,
      changedBy: officer.userId,
      actorName: officer.fullName,
      notes: `Alert marked as ${targetStatus}. Closure justification: ${reason}`,
      timestamp: new Date().toISOString(),
    };
    alert.history.push(historyEntry);

    return { success: true, alert };
  }

  private dispatchNotification(alert: GovernmentAlert): void {
    const notification: InAppNotification = {
      notificationId: `NOTIF_${Date.now()}`,
      alertId: alert.alertId,
      recipientEmail: 'duty.officer@health.gov.in',
      recipientName: 'District Public Health Emergency Officer',
      role: 'DISTRICT_HEALTH_OFFICER',
      channel: 'IN_APP',
      status: 'DELIVERED',
      title: `[${alert.severity}] Elevated ${alert.disease} Risk Alert in ${alert.districtName}`,
      message: `${alert.triggerFactor}. ML predicted risk: ${Math.round(alert.riskScore * 100)}%. Requires authorized acknowledgment.`,
      sentAt: new Date().toISOString(),
    };
    this.notifications.unshift(notification);
  }

  public getNotifications(limit = 20): InAppNotification[] {
    return this.notifications.slice(0, limit);
  }

  /**
   * Exports alerts matching optional filters as an official government CSV report
   */
  public exportCsv(filter?: {
    districtId?: string;
    stateId?: string;
    status?: AlertStatus;
    severity?: AlertSeverity;
    disease?: DiseaseType;
  }): string {
    const list = this.getAlerts(filter);
    const headers = [
      'Alert ID',
      'Created At (UTC)',
      'District',
      'District ID',
      'State',
      'Disease',
      'Severity',
      'Risk Score (%)',
      'Confidence (%)',
      'Status',
      'Trigger Factor',
      'Scientific Rationale',
      'Assigned Officer',
      'Acknowledged At',
      'Closed At',
      'Closure Reason',
      'Escalation Tier',
      'Data Quality Score'
    ];

    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = list.map((a) => [
      escapeCsv(a.alertId),
      escapeCsv(a.createdAt),
      escapeCsv(a.districtName),
      escapeCsv(a.districtId),
      escapeCsv(a.state),
      escapeCsv(a.disease),
      escapeCsv(a.severity),
      Math.round(a.riskScore * 100),
      Math.round(a.confidence * 100),
      escapeCsv(a.status),
      escapeCsv(a.triggerFactor),
      escapeCsv(a.scientificRationale),
      escapeCsv(a.assignedOfficerName || 'UNASSIGNED'),
      escapeCsv(a.acknowledgedAt || 'PENDING'),
      escapeCsv(a.closedAt || 'ACTIVE'),
      escapeCsv(a.closureReason || 'N/A'),
      a.escalationLevel === 1 ? '1 - District' : a.escalationLevel === 2 ? '2 - State' : '3 - National',
      a.dataQualityScore
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}
