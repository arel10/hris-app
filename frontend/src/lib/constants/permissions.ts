export const PERMISSIONS = {
  EMPLOYEES_CREATE: 'employees.create',
  EMPLOYEES_READ: 'employees.read',
  EMPLOYEES_UPDATE: 'employees.update',
  EMPLOYEES_DELETE: 'employees.delete',

  ORGANIZATION_CREATE: 'organization.create',
  ORGANIZATION_READ: 'organization.read',
  ORGANIZATION_UPDATE: 'organization.update',
  ORGANIZATION_DELETE: 'organization.delete',

  ATTENDANCE_READ: 'attendance.read',
  ATTENDANCE_CORRECT: 'attendance.correct',

  LEAVES_CREATE: 'leaves.create',
  LEAVES_READ: 'leaves.read',
  LEAVES_APPROVE: 'leaves.approve',

  PAYROLL_READ: 'payroll.read',
  PAYROLL_PROCESS: 'payroll.process',
  PAYROLL_APPROVE: 'payroll.approve',

  CONTRACTS_READ: 'contracts.read',
  CONTRACTS_CREATE: 'contracts.create',
  CONTRACTS_UPDATE: 'contracts.update',

  PERFORMANCE_READ: 'performance.read',
  PERFORMANCE_EVALUATE: 'performance.evaluate',

  RECRUITMENT_READ: 'recruitment.read',
  RECRUITMENT_MANAGE: 'recruitment.manage',

  TRAINING_READ: 'training.read',
  TRAINING_MANAGE: 'training.manage',

  DOCUMENTS_READ: 'documents.read',
  DOCUMENTS_UPLOAD: 'documents.upload',

  REPORTS_READ: 'reports.read',
  AUDIT_READ: 'audit.read',
  ROLES_MANAGE: 'roles.manage',
  USERS_MANAGE: 'users.manage',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

