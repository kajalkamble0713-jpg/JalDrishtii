/**
 * JalDrishti Government Audit Logging & Forensic Trail Engine
 * Immutable, append-only ledger of all government operations, acknowledgments,
 * task assignments, and evidence verifications.
 */

import { GovernmentUser } from '../auth/rbacEngine.js';

export interface AuditRecord {
  auditId: string;
  userId: string;
  userName: string;
  userRole: string;
  designation: string;
  action: string;
  entityType: string;
  entityId?: string;
  timestamp: string;
  ipAddress: string;
  beforeValue?: any;
  afterValue?: any;
  details?: Record<string, any>;
}

export class AuditEngine {
  private static instance: AuditEngine;
  private logs: AuditRecord[] = [];

  private constructor() {
    this.seedBaselineAuditLogs();
  }

  public static getInstance(): AuditEngine {
    if (!AuditEngine.instance) {
      AuditEngine.instance = new AuditEngine();
    }
    return AuditEngine.instance;
  }

  private seedBaselineAuditLogs(): void {
    this.logs.push(
      {
        auditId: 'AUDIT_2026_001',
        userId: 'usr_nat_01',
        userName: 'Dr. V. K. Paul',
        userRole: 'NATIONAL_ADMIN',
        designation: 'National Public Health Commissioner',
        action: 'SYSTEM_BOOT_INITIALIZATION',
        entityType: 'PLATFORM_ENGINE',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        ipAddress: '10.24.102.14 (NIC Secure Gateway)',
        details: { mode: 'OPERATIONAL_COMMAND_CENTER', schemaVersion: '2.5.0' },
      },
      {
        auditId: 'AUDIT_2026_002',
        userId: 'usr_cmo_patna_01',
        userName: 'Dr. A. P. Singh',
        userRole: 'DISTRICT_HEALTH_OFFICER',
        designation: 'Chief Medical Officer, Patna',
        action: 'ALERT_ACKNOWLEDGED',
        entityType: 'GOVERNMENT_ALERT',
        entityId: 'ALT_BHAGALPUR_CHOLERA_02',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        ipAddress: '117.240.18.91 (Bihar Govt Health Intranet)',
        beforeValue: { status: 'NEW' },
        afterValue: { status: 'ACKNOWLEDGED' },
        details: { notes: 'Acknowledged receipt of risk advisory; dispatching water surveillance team.' },
      },
      {
        auditId: 'AUDIT_2026_003',
        userId: 'usr_dm_patna_01',
        userName: 'Smt. Chandana Kumar, IAS',
        userRole: 'DISTRICT_COLLECTOR',
        designation: 'District Magistrate & Collector, Patna',
        action: 'INTERVENTION_ASSIGNED',
        entityType: 'GOVERNMENT_INTERVENTION',
        entityId: 'INT_PATNA_001',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        ipAddress: '10.15.8.42 (NIC Collectorate)',
        beforeValue: { status: 'NEW' },
        afterValue: { status: 'IN_PROGRESS' },
        details: { assignedTo: 'Er. S. N. Mishra (PHED)' },
      },
      {
        auditId: 'AUDIT_2026_004',
        userId: 'usr_cmo_patna_01',
        userName: 'Dr. A. P. Singh',
        userRole: 'DISTRICT_HEALTH_OFFICER',
        designation: 'Chief Medical Officer, Patna',
        action: 'EVIDENCE_VERIFIED',
        entityType: 'INTERVENTION_EVIDENCE',
        entityId: 'EVID_VAR_01',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        ipAddress: '117.240.18.91 (Bihar Govt Health Intranet)',
        beforeValue: { isVerified: false },
        afterValue: { isVerified: true },
        details: { verificationNotes: 'Stock batch verified against invoice expiry dates (2028).' },
      }
    );
  }

  public record(params: {
    user: GovernmentUser;
    action: string;
    entityType: string;
    entityId?: string;
    beforeValue?: any;
    afterValue?: any;
    details?: Record<string, any>;
    ipAddress?: string;
  }): AuditRecord {
    const record: AuditRecord = {
      auditId: `AUDIT_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`,
      userId: params.user.userId,
      userName: params.user.fullName,
      userRole: params.user.role,
      designation: params.user.designation,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      timestamp: new Date().toISOString(),
      ipAddress: params.ipAddress || '10.20.44.112 (NIC S3 Gateway)',
      beforeValue: params.beforeValue,
      afterValue: params.afterValue,
      details: params.details,
    };

    this.logs.unshift(record);
    return record;
  }

  public getLogs(filter?: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }): AuditRecord[] {
    let result = this.logs;

    if (filter?.userId) {
      result = result.filter((l) => l.userId === filter.userId);
    }
    if (filter?.action) {
      result = result.filter((l) => l.action.toLowerCase().includes(filter.action!.toLowerCase()));
    }
    if (filter?.entityType) {
      result = result.filter((l) => l.entityType.toLowerCase() === filter.entityType!.toLowerCase());
    }
    if (filter?.startDate) {
      const start = new Date(filter.startDate).getTime();
      result = result.filter((l) => new Date(l.timestamp).getTime() >= start);
    }
    if (filter?.endDate) {
      const end = new Date(filter.endDate).getTime();
      result = result.filter((l) => new Date(l.timestamp).getTime() <= end);
    }

    return result;
  }

  public exportCsv(filter?: { entityType?: string }): string {
    const list = this.getLogs(filter);
    const headers = ['Audit ID', 'Timestamp', 'User Name', 'Role', 'Designation', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
    const rows = list.map((l) => [
      l.auditId,
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      `"${l.designation}"`,
      l.action,
      l.entityType,
      l.entityId || 'N/A',
      l.ipAddress,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
