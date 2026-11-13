/**
 * JalDrishti Security & Audit Repository
 * Handles RBAC roles, authenticated user accounts, and immutable audit logs.
 */

import { DatabaseManager } from '../connection.js';

export interface UserRecord {
  userId: string;
  email: string;
  fullName: string;
  organization?: string;
  isActive: boolean;
  roles: string[];
}

export interface AuditLogRecord {
  logId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  actorId: string;
  details: Record<string, any>;
  createdAt?: string;
}

export class SecurityRepository {
  private static instance: SecurityRepository;

  private inMemoryUsers: UserRecord[] = [
    {
      userId: 'usr_admin_001',
      email: 'kajalkamble0713@gmail.com',
      fullName: 'Epidemiology Administrator',
      organization: 'JalDrishti Telemetry Observatory',
      isActive: true,
      roles: ['superadmin', 'epidemiologist'],
    },
  ];

  private inMemoryAuditLogs: AuditLogRecord[] = [];

  private constructor() {}

  public static getInstance(): SecurityRepository {
    if (!SecurityRepository.instance) {
      SecurityRepository.instance = new SecurityRepository();
    }
    return SecurityRepository.instance;
  }

  public async getSessionUser(email?: string): Promise<UserRecord> {
    const db = DatabaseManager.getInstance();
    const targetEmail = email || 'kajalkamble0713@gmail.com';
    const res = await db.query<any>(
      `SELECT u.user_id, u.email, u.full_name, u.organization, u.is_active,
              ARRAY_AGG(r.role_id) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.user_id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.role_id
       WHERE u.email = $1
       GROUP BY u.user_id, u.email, u.full_name, u.organization, u.is_active;`,
      [targetEmail]
    );

    if (res && res.rows.length > 0) {
      const r = res.rows[0];
      return {
        userId: r.user_id,
        email: r.email,
        fullName: r.full_name,
        organization: r.organization,
        isActive: r.is_active,
        roles: Array.isArray(r.roles) ? r.roles : ['epidemiologist'],
      };
    }

    return this.inMemoryUsers[0];
  }

  public async recordAuditLog(log: AuditLogRecord): Promise<void> {
    const db = DatabaseManager.getInstance();
    await db.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, actor_id, details)
       VALUES ($1, $2, $3, $4, $5);`,
      [log.action, log.entityType, log.entityId || null, log.actorId || 'system', JSON.stringify(log.details)]
    );

    this.inMemoryAuditLogs.unshift({
      ...log,
      createdAt: new Date().toISOString(),
    });
  }

  public async getAuditLogs(limit = 25): Promise<AuditLogRecord[]> {
    const db = DatabaseManager.getInstance();
    const res = await db.query<any>(
      `SELECT log_id, action, entity_type, entity_id, actor_id, details, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT $1;`,
      [limit]
    );

    if (res && res.rows.length > 0) {
      return res.rows.map((r) => ({
        logId: r.log_id,
        action: r.action,
        entityType: r.entity_type,
        entityId: r.entity_id,
        actorId: r.actor_id,
        details: typeof r.details === 'object' ? r.details : {},
        createdAt: r.created_at,
      }));
    }

    return this.inMemoryAuditLogs.slice(0, limit);
  }
}
