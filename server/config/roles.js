// =========================================================================
// CENTRAL ROLE CONFIG (Server)
// -------------------------------------------------------------------------
// Single source of truth for every role that can log in to the CRM.
// If you ever add a new team/department, add its role key here first.
// =========================================================================

// Roles that own a specific department/module and can invite people into
// their OWN team (subject to Super Admin approval).
const TEAM_ROLES = ['account', 'sales', 'service', 'delivery', 'hr', 'b2c', 'website'];

// Roles that are treated as the top-level Super Admin (full, unrestricted
// access to every module + all records + user approval powers).
// 'admin' is kept for backward compatibility with existing bootstrapped
// admin accounts / env based login.
const SUPERADMIN_ROLES = ['admin', 'superadmin'];

// Field-staff / distribution workers who only see their own assignments.
const FIELD_ROLES = ['employee'];

const ALL_ROLES = [...SUPERADMIN_ROLES, ...TEAM_ROLES, ...FIELD_ROLES];

const isSuperAdminRole = (role) => SUPERADMIN_ROLES.includes(role);
const isTeamRole = (role) => TEAM_ROLES.includes(role);

const TEAM_LABELS = {
  admin: 'Super Admin',
  superadmin: 'Super Admin',
  account: 'Account Team',
  sales: 'Sales Team',
  service: 'Service Team',
  delivery: 'Delivery Team',
  hr: 'HR Team',
  b2c: 'B2C Team',
  website: 'Website Team',
  employee: 'Field Employee',
};

module.exports = {
  TEAM_ROLES,
  SUPERADMIN_ROLES,
  FIELD_ROLES,
  ALL_ROLES,
  TEAM_LABELS,
  isSuperAdminRole,
  isTeamRole,
};
