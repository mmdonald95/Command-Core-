export const ROLE_PERMISSION_DEFINITIONS = [
  {
    key: 'manage_company_workspace',
    label: 'Management Workspace',
    description: 'Open the management area and company-wide controls.',
  },
  {
    key: 'manage_projects',
    label: 'Create / Edit Projects',
    description: 'Create new projects and edit project records.',
  },
  {
    key: 'manage_employees',
    label: 'Employees',
    description: 'View and manage employee records.',
  },
  {
    key: 'manage_equipment',
    label: 'Equipment',
    description: 'View and manage company equipment records.',
  },
  {
    key: 'manage_timecards',
    label: 'Time Cards',
    description: 'Open and manage weekly time card records.',
  },
  {
    key: 'approve_time',
    label: 'Time Approval',
    description: 'Approve weekly time for payroll processing.',
  },
  {
    key: 'view_money',
    label: 'Money / Cost Values',
    description: 'See payroll, rates, costs, and other money-related values.',
  },
];

export const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    manage_company_workspace: true,
    manage_projects: true,
    manage_employees: true,
    manage_equipment: true,
    manage_timecards: true,
    approve_time: true,
    view_money: true,
  },
  manager: {
    manage_company_workspace: true,
    manage_projects: true,
    manage_employees: true,
    manage_equipment: true,
    manage_timecards: false,
    approve_time: true,
    view_money: false,
  },
  user: {
    manage_company_workspace: false,
    manage_projects: false,
    manage_employees: false,
    manage_equipment: false,
    manage_timecards: false,
    approve_time: false,
    view_money: false,
  },
};

function normalizeRole(role) {
  return ['admin', 'manager', 'user'].includes(role) ? role : 'user';
}

function getCompanyPermissionOverrides(company) {
  if (company?.role_permissions && typeof company.role_permissions === 'object') {
    return company.role_permissions;
  }

  const terminology =
    company?.custom_terminology && typeof company.custom_terminology === 'object'
      ? company.custom_terminology
      : {};

  if (terminology?.role_permissions && typeof terminology.role_permissions === 'object') {
    return terminology.role_permissions;
  }

  return {};
}

export function getEffectiveRole({ profile, user } = {}) {
  return normalizeRole(profile?.role || user?.app_role || user?.role || 'user');
}

export function hasRole(context, allowedRoles = []) {
  const role = getEffectiveRole(context);
  return allowedRoles.includes(role);
}

export function isAdmin(context) {
  return hasRole(context, ['admin']);
}

export function isManagerOrAdmin(context) {
  return hasRole(context, ['admin', 'manager']);
}

export function getRolePermissions(role, company) {
  const normalizedRole = normalizeRole(role);
  const defaults = DEFAULT_ROLE_PERMISSIONS[normalizedRole] || DEFAULT_ROLE_PERMISSIONS.user;
  if (normalizedRole === 'admin') {
    return {
      ...DEFAULT_ROLE_PERMISSIONS.admin,
    };
  }

  const overrides = getCompanyPermissionOverrides(company)?.[normalizedRole] || {};

  return {
    ...defaults,
    ...overrides,
  };
}

export function hasPermission(context, permissionKey) {
  const role = getEffectiveRole(context);
  const permissions = getRolePermissions(role, context?.company);
  return permissions[permissionKey] === true;
}

export function canManageCompanyWorkspace(context) {
  return hasPermission(context, 'manage_company_workspace');
}

export function canManageProjects(context) {
  return hasPermission(context, 'manage_projects');
}

export function canManageEmployees(context) {
  return hasPermission(context, 'manage_employees');
}

export function canManageEquipment(context) {
  return hasPermission(context, 'manage_equipment');
}

export function canManageTimeCards(context) {
  return hasPermission(context, 'manage_timecards');
}

export function canApproveTime(context) {
  return hasPermission(context, 'approve_time');
}

export function canViewMoney(context) {
  return hasPermission(context, 'view_money');
}
