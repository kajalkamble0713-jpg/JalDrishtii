/**
 * JalDrishti Government Role-Based Access Control (RBAC) & Geographic Authorization Engine
 * Enforces production security, granular permissions, and jurisdiction boundaries.
 */

export type GovernmentRole =
  | 'NATIONAL_ADMIN'
  | 'STATE_ADMIN'
  | 'STATE_HEALTH_OFFICER'
  | 'DISTRICT_ADMIN'
  | 'DISTRICT_HEALTH_OFFICER'
  | 'DISTRICT_COLLECTOR'
  | 'WATER_DEPARTMENT_OFFICER'
  | 'PHC_OFFICER'
  | 'FIELD_WORKER'
  | 'LAB_OFFICER'
  | 'DATA_SCIENTIST'
  | 'AUDITOR'
  | 'READ_ONLY_USER';

export type Permission =
  | 'VIEW_RISK'
  | 'VIEW_PREDICTIONS'
  | 'VIEW_ALERTS'
  | 'CREATE_ALERT'
  | 'ACKNOWLEDGE_ALERT'
  | 'ASSIGN_INTERVENTION'
  | 'MANAGE_INTERVENTION'
  | 'MANAGE_RESOURCES'
  | 'UPLOAD_SAMPLE'
  | 'VIEW_LAB_RESULTS'
  | 'MANAGE_USERS'
  | 'VIEW_AUDIT_LOGS'
  | 'EXPORT_REPORTS'
  | 'MANAGE_MODELS'
  | 'MANAGE_DATA_SOURCES'
  | 'SYSTEM_ADMIN'
  | 'MANAGE_FIELD_TASKS'
  | 'VIEW_FIELD_TASKS'
  | 'SUBMIT_FIELD_OBSERVATIONS'
  | 'COLLECT_SAMPLES'
  | 'UPDATE_CHAIN_OF_CUSTODY'
  | 'ENTER_LAB_RESULTS'
  | 'VERIFY_LAB_RESULTS'
  | 'RECORD_HEALTH_OUTCOMES'
  | 'VIEW_PREDICTION_FEEDBACK';

export type GeographicScope = 'NATIONAL' | 'STATE' | 'DISTRICT' | 'PHC';

export interface GeographicAssignment {
  scopeType: GeographicScope;
  stateId?: string; // e.g. 'bihar'
  districtId?: string; // e.g. 'patna_bihar'
  phcId?: string; // e.g. 'phc_danapur'
  jurisdictionName: string;
}

export interface GovernmentUser {
  userId: string;
  fullName: string;
  designation: string;
  department: string;
  email: string;
  role: GovernmentRole;
  assignment: GeographicAssignment;
  isActive: boolean;
  mfaEnabled: boolean;
  lastLoginAt: string;
}

// Granular Role to Permission Mapping
export const ROLE_PERMISSIONS: Record<GovernmentRole, Permission[]> = {
  NATIONAL_ADMIN: [
    'VIEW_RISK',
    'VIEW_PREDICTIONS',
    'VIEW_ALERTS',
    'CREATE_ALERT',
    'ACKNOWLEDGE_ALERT',
    'ASSIGN_INTERVENTION',
    'MANAGE_INTERVENTION',
    'MANAGE_RESOURCES',
    'VIEW_LAB_RESULTS',
    'MANAGE_USERS',
    'VIEW_AUDIT_LOGS',
    'EXPORT_REPORTS',
    'MANAGE_DATA_SOURCES',
    'SYSTEM_ADMIN',
    'MANAGE_FIELD_TASKS',
    'VIEW_FIELD_TASKS',
    'RECORD_HEALTH_OUTCOMES',
    'VIEW_PREDICTION_FEEDBACK',
  ],
  STATE_ADMIN: [
    'VIEW_RISK',
    'VIEW_PREDICTIONS',
    'VIEW_ALERTS',
    'CREATE_ALERT',
    'ACKNOWLEDGE_ALERT',
    'ASSIGN_INTERVENTION',
    'MANAGE_INTERVENTION',
    'MANAGE_RESOURCES',
    'VIEW_LAB_RESULTS',
    'MANAGE_USERS',
    'VIEW_AUDIT_LOGS',
    'EXPORT_REPORTS',
    'MANAGE_FIELD_TASKS',
    'VIEW_FIELD_TASKS',
    'RECORD_HEALTH_OUTCOMES',
    'VIEW_PREDICTION_FEEDBACK',
  ],
  STATE_HEALTH_OFFICER: [
    'VIEW_RISK',
    'VIEW_PREDICTIONS',
    'VIEW_ALERTS',
    'CREATE_ALERT',
    'ACKNOWLEDGE_ALERT',
    'ASSIGN_INTERVENTION',
    'MANAGE_INTERVENTION',
    'MANAGE_RESOURCES',
    'VIEW_LAB_RESULTS',
    'EXPORT_REPORTS',
    'MANAGE_FIELD_TASKS',
    'VIEW_FIELD_TASKS',
    'RECORD_HEALTH_OUTCOMES',
    'VIEW_PREDICTION_FEEDBACK',
  ],
  DISTRICT_ADMIN: [
    'VIEW_RISK',
    'VIEW_PREDICTIONS',
    'VIEW_ALERTS',
    'CREATE_ALERT',
    'ACKNOWLEDGE_ALERT',
    'ASSIGN_INTERVENTION',
    'MANAGE_INTERVENTION',
    'MANAGE_RESOURCES',
    'VIEW_LAB_RESULTS',
    'MANAGE_USERS',
    'EXPORT_REPORTS',
    'MANAGE_FIELD_TASKS',
    'VIEW_FIELD_TASKS',
    'RECORD_HEALTH_OUTCOMES',
    'VIEW_PREDICTION_FEEDBACK',
  ],
  DISTRICT_COLLECTOR: [
    'VIEW_RISK',
    'VIEW_PREDICTIONS',
    'VIEW_ALERTS',
    'CREATE_ALERT',
    'ACKNOWLEDGE_ALERT',
    'ASSIGN_INTERVENTION',
    'MANAGE_INTERVENTION',
    'MANAGE_RESOURCES',
    'VIEW_LAB_RESULTS',
    'EXPORT_REPORTS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_FIELD_TASKS',
    'VIEW_FIELD_TASKS',
    'RECORD_HEALTH_OUTCOMES',
    'VIEW_PREDICTION_FEEDBACK',
  ],
  DISTRICT_HEALTH_OFFICER: [
    'VIEW_RISK',
    'VIEW_PREDICTIONS',
    'VIEW_ALERTS',
    'CREATE_ALERT',
    'ACKNOWLEDGE_ALERT',
    'ASSIGN_INTERVENTION',
    'MANAGE_INTERVENTION',
    'MANAGE_RESOURCES',
    'VIEW_LAB_RESULTS',
    'EXPORT_REPORTS',
    'MANAGE_FIELD_TASKS',
    'VIEW_FIELD_TASKS',
    'RECORD_HEALTH_OUTCOMES',
    'VIEW_PREDICTION_FEEDBACK',
  ],
  WATER_DEPARTMENT_OFFICER: [
    'VIEW_RISK',
    'VIEW_ALERTS',
    'ACKNOWLEDGE_ALERT',
    'MANAGE_INTERVENTION',
    'MANAGE_RESOURCES',
    'UPLOAD_SAMPLE',
    'VIEW_LAB_RESULTS',
    'MANAGE_FIELD_TASKS',
    'VIEW_FIELD_TASKS',
    'COLLECT_SAMPLES',
    'UPDATE_CHAIN_OF_CUSTODY',
  ],
  PHC_OFFICER: [
    'VIEW_RISK',
    'VIEW_PREDICTIONS',
    'VIEW_ALERTS',
    'ACKNOWLEDGE_ALERT',
    'MANAGE_INTERVENTION',
    'UPLOAD_SAMPLE',
    'VIEW_LAB_RESULTS',
    'MANAGE_FIELD_TASKS',
    'VIEW_FIELD_TASKS',
    'RECORD_HEALTH_OUTCOMES',
    'VIEW_PREDICTION_FEEDBACK',
  ],
  FIELD_WORKER: [
    'VIEW_RISK',
    'VIEW_ALERTS',
    'VIEW_FIELD_TASKS',
    'SUBMIT_FIELD_OBSERVATIONS',
    'COLLECT_SAMPLES',
    'UPDATE_CHAIN_OF_CUSTODY',
    'UPLOAD_SAMPLE',
    'MANAGE_INTERVENTION',
  ],
  LAB_OFFICER: [
    'VIEW_RISK',
    'VIEW_FIELD_TASKS',
    'VIEW_LAB_RESULTS',
    'UPDATE_CHAIN_OF_CUSTODY',
    'ENTER_LAB_RESULTS',
    'VERIFY_LAB_RESULTS',
    'UPLOAD_SAMPLE',
    'EXPORT_REPORTS',
  ],
  DATA_SCIENTIST: [
    'VIEW_RISK',
    'VIEW_PREDICTIONS',
    'VIEW_LAB_RESULTS',
    'VIEW_PREDICTION_FEEDBACK',
    'MANAGE_MODELS',
    'MANAGE_DATA_SOURCES',
    'EXPORT_REPORTS',
  ],
  AUDITOR: [
    'VIEW_RISK',
    'VIEW_PREDICTIONS',
    'VIEW_ALERTS',
    'VIEW_AUDIT_LOGS',
    'VIEW_FIELD_TASKS',
    'VIEW_LAB_RESULTS',
    'VIEW_PREDICTION_FEEDBACK',
    'EXPORT_REPORTS',
  ],
  READ_ONLY_USER: [
    'VIEW_RISK',
    'VIEW_PREDICTIONS',
    'VIEW_ALERTS',
  ],
};

// Standard Demo Officer Personas for Development & Verification
export const DEMO_GOVERNMENT_OFFICERS: GovernmentUser[] = [
  {
    userId: 'usr_nat_01',
    fullName: 'Dr. V. K. Paul',
    designation: 'National Public Health Commissioner',
    department: 'Ministry of Health & Family Welfare (MoHFW)',
    email: 'commissioner.health@mohfw.gov.in',
    role: 'NATIONAL_ADMIN',
    assignment: {
      scopeType: 'NATIONAL',
      jurisdictionName: 'All India (National Jurisdiction)',
    },
    isActive: true,
    mfaEnabled: true,
    lastLoginAt: new Date().toISOString(),
  },
  {
    userId: 'usr_state_bihar_01',
    fullName: 'Dr. R. K. Shrivastava',
    designation: 'State Surveillance Officer (IDSP)',
    department: 'State Health Society Bihar',
    email: 'sso.bihar@idsp.nic.in',
    role: 'STATE_HEALTH_OFFICER',
    assignment: {
      scopeType: 'STATE',
      stateId: 'bihar',
      jurisdictionName: 'State of Bihar',
    },
    isActive: true,
    mfaEnabled: true,
    lastLoginAt: new Date().toISOString(),
  },
  {
    userId: 'usr_dm_patna_01',
    fullName: 'Smt. Chandana Kumar, IAS',
    designation: 'District Magistrate & Collector',
    department: 'District Collectorate Patna',
    email: 'dm-patna.bih@nic.in',
    role: 'DISTRICT_COLLECTOR',
    assignment: {
      scopeType: 'DISTRICT',
      stateId: 'bihar',
      districtId: 'patna_bihar',
      jurisdictionName: 'Patna District, Bihar',
    },
    isActive: true,
    mfaEnabled: true,
    lastLoginAt: new Date().toISOString(),
  },
  {
    userId: 'usr_cmo_patna_01',
    fullName: 'Dr. A. P. Singh',
    designation: 'Chief Medical Officer (CMO)',
    department: 'District Health Administration, Patna',
    email: 'cmo.patna@biharhealth.gov.in',
    role: 'DISTRICT_HEALTH_OFFICER',
    assignment: {
      scopeType: 'DISTRICT',
      stateId: 'bihar',
      districtId: 'patna_bihar',
      jurisdictionName: 'Patna District, Bihar',
    },
    isActive: true,
    mfaEnabled: true,
    lastLoginAt: new Date().toISOString(),
  },
  {
    userId: 'usr_phed_patna_01',
    fullName: 'Er. S. N. Mishra',
    designation: 'Executive Engineer (Water Supply & Drainage)',
    department: 'Public Health Engineering Department (PHED)',
    email: 'ee.phed.patna@bihar.gov.in',
    role: 'WATER_DEPARTMENT_OFFICER',
    assignment: {
      scopeType: 'DISTRICT',
      stateId: 'bihar',
      districtId: 'patna_bihar',
      jurisdictionName: 'Patna District Water Infrastructure',
    },
    isActive: true,
    mfaEnabled: false,
    lastLoginAt: new Date().toISOString(),
  },
  {
    userId: 'usr_phc_danapur_01',
    fullName: 'Dr. Neha Sinha',
    designation: 'Medical Officer In-Charge',
    department: 'Primary Health Centre Danapur, Patna',
    email: 'mo.danapur@phc.bihar.gov.in',
    role: 'PHC_OFFICER',
    assignment: {
      scopeType: 'PHC',
      stateId: 'bihar',
      districtId: 'patna_bihar',
      phcId: 'phc_danapur',
      jurisdictionName: 'Danapur PHC & Catchment Villages',
    },
    isActive: true,
    mfaEnabled: false,
    lastLoginAt: new Date().toISOString(),
  },
  {
    userId: 'usr_field_patna_01',
    fullName: 'Rajesh Kumar',
    designation: 'Senior Multi-Purpose Health Worker (MPHW)',
    department: 'Field Epidemiology Cell, Patna',
    email: 'rajesh.mphw@patna.gov.in',
    role: 'FIELD_WORKER',
    assignment: {
      scopeType: 'DISTRICT',
      stateId: 'bihar',
      districtId: 'patna_bihar',
      jurisdictionName: 'Patna Rural & Riverbank Wards',
    },
    isActive: true,
    mfaEnabled: false,
    lastLoginAt: new Date().toISOString(),
  },
  {
    userId: 'usr_lab_patna_01',
    fullName: 'Sunita Devi',
    designation: 'Chief Water Microbiologist',
    department: 'District Water Testing Laboratory, Patna',
    email: 'lab.patna@waterquality.bih.nic.in',
    role: 'LAB_OFFICER',
    assignment: {
      scopeType: 'DISTRICT',
      stateId: 'bihar',
      districtId: 'patna_bihar',
      jurisdictionName: 'State Public Health Water Lab, Patna',
    },
    isActive: true,
    mfaEnabled: false,
    lastLoginAt: new Date().toISOString(),
  },
  {
    userId: 'usr_auditor_01',
    fullName: 'Arvind Kejriwal',
    designation: 'Principal Public Health & Fiscal Auditor',
    department: 'Comptroller & Public Performance Audit Cell',
    email: 'auditor.jaldrishti@cag.gov.in',
    role: 'AUDITOR',
    assignment: {
      scopeType: 'NATIONAL',
      jurisdictionName: 'All India Independent Audit Scope',
    },
    isActive: true,
    mfaEnabled: true,
    lastLoginAt: new Date().toISOString(),
  },
];

export class RbacEngine {
  private static instance: RbacEngine;
  private currentUser: GovernmentUser = DEMO_GOVERNMENT_OFFICERS[0]; // Defaults to National Commissioner

  private constructor() {}

  public static getInstance(): RbacEngine {
    if (!RbacEngine.instance) {
      RbacEngine.instance = new RbacEngine();
    }
    return RbacEngine.instance;
  }

  public getCurrentUser(): GovernmentUser {
    return this.currentUser;
  }

  public setCurrentUserById(userId: string): GovernmentUser {
    const found = DEMO_GOVERNMENT_OFFICERS.find((u) => u.userId === userId);
    if (found) {
      this.currentUser = found;
    }
    return this.currentUser;
  }

  public hasPermission(permission: Permission, user: GovernmentUser = this.currentUser): boolean {
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  }

  /**
   * Server-side Geographic Authorization Validator
   * Ensures users cannot access, acknowledge, or modify alerts/tasks outside their assigned territory.
   */
  public hasGeographicAccess(
    targetDistrictId?: string,
    targetStateId?: string,
    user: GovernmentUser = this.currentUser
  ): boolean {
    // 1. National jurisdiction has access to all Indian territories
    if (user.assignment.scopeType === 'NATIONAL') {
      return true;
    }

    // 2. State-level officer has access only to districts within their state
    if (user.assignment.scopeType === 'STATE') {
      if (!targetStateId && !targetDistrictId) return true;
      if (targetStateId && user.assignment.stateId) {
        return user.assignment.stateId.toLowerCase() === targetStateId.toLowerCase();
      }
      if (targetDistrictId && user.assignment.stateId) {
        // District id usually contains state, e.g. 'patna_bihar'
        return targetDistrictId.toLowerCase().includes(user.assignment.stateId.toLowerCase());
      }
      return false;
    }

    // 3. District & PHC level officers have access strictly to their assigned district
    if (user.assignment.scopeType === 'DISTRICT' || user.assignment.scopeType === 'PHC') {
      if (!targetDistrictId) return true;
      return user.assignment.districtId?.toLowerCase() === targetDistrictId.toLowerCase();
    }

    return false;
  }

  /**
   * Enforces both Role Permission and Geographic Scope
   * Returns { allowed: boolean; reason?: string }
   */
  public authorizeAction(params: {
    permission: Permission;
    targetDistrictId?: string;
    targetStateId?: string;
    user?: GovernmentUser;
  }): { allowed: boolean; reason?: string } {
    const user = params.user || this.currentUser;

    if (!user.isActive) {
      return { allowed: false, reason: 'User account is inactive.' };
    }

    if (!this.hasPermission(params.permission, user)) {
      return {
        allowed: false,
        reason: `Role '${user.role}' is not granted permission '${params.permission}'.`,
      };
    }

    if (
      (params.targetDistrictId || params.targetStateId) &&
      !this.hasGeographicAccess(params.targetDistrictId, params.targetStateId, user)
    ) {
      return {
        allowed: false,
        reason: `Geographic violation: User jurisdiction is restricted to '${user.assignment.jurisdictionName}'. Access denied for target territory.`,
      };
    }

    return { allowed: true };
  }
}
