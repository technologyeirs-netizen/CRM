// =========================================================================
// CENTRAL ROLE CONFIG (Client)
// -------------------------------------------------------------------------
// One place that decides: which team a role belongs to, its landing page,
// and which sidebar sections/routes it is allowed to see. Keep this in sync
// with server/config/roles.js.
// =========================================================================

export const SUPERADMIN_ROLES = ["admin", "superadmin"];

export const TEAM_ROLES = [
  "account",
  "sales",
  "service",
  "delivery",
  "hr",
  "b2c",
  "website",
];

export const ROLE_LABELS = {
  admin: "Super Admin",
  superadmin: "Super Admin",
  account: "Account Team",
  sales: "Sales Team",
  service: "Service Team",
  delivery: "Delivery Team",
  hr: "HR Team",
  b2c: "B2C Team",
  website: "Website Team",
  employee: "Field Employee",
};

export const isSuperAdminRole = (role) => SUPERADMIN_ROLES.includes(role);
export const isTeamRole = (role) => TEAM_ROLES.includes(role);

// Where each role lands right after login / when they click the logo.
export const ROLE_HOME_ROUTE = {
  admin: "/dashboard",
  superadmin: "/dashboard",
  account: "/account",
  sales: "/sales-team",
  service: "/services-team",
  delivery: "/delivery-team",
  hr: "/hr",
  b2c: "/b2c",
  website: "/website-users",
  employee: "/employee-dashboard",
};

export const getHomeRoute = (role) => ROLE_HOME_ROUTE[role] || "/employee-dashboard";

// Sidebar section keys each role is allowed to see. Super Admin always sees
// everything ('*') regardless of what's listed here.
export const ROLE_MODULES = {
  account: ["account", "inventory", "purchase-history", "team"],
  sales: ["sales-team", "campaigns", "team"],
  service: ["service", "fsm", "team"],
  delivery: ["delivery-team", "distribution", "fsm", "inventory", "team"],
  hr: ["hr", "employees", "fsm", "team"],
  b2c: ["b2c", "inventory", "team"],
  website: ["website", "team"],
};

export const canAccessModule = (role, moduleKey) => {
  if (isSuperAdminRole(role)) return true;
  const allowed = ROLE_MODULES[role] || [];
  return allowed.includes(moduleKey);
};
