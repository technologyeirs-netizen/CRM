// =========================================================================
// CENTRAL MODULE / TAB REGISTRY (Server)
// -------------------------------------------------------------------------
// This is the single source of truth for every "tab" that a custom Role's
// permission matrix can grant access to. Keep this in sync with
// client/src/config/modules.js.
//
// Each module belongs to one `team` (the same keys used in config/roles.js
// TEAM_ROLES). When the Super Admin builds a Role for a team, only that
// team's modules are shown in the permission matrix.
//
// Actions:
//   view    - can open the tab / list records
//   create  - can add a new record
//   edit    - can update an existing record
//   delete  - can remove a record
//   assign  - can (re)assign a record (e.g. a lead) to someone else in
//             their downline. Only meaningful on a few modules.
// =========================================================================

const ACTIONS = ['view', 'create', 'edit', 'delete', 'assign'];

const MODULES = [
  // ---- Sales team ----
  { key: 'sales-leads', label: 'Leads / Clients', team: 'sales', supportsAssign: true },
  { key: 'sales-quotations', label: 'Quotations', team: 'sales' },
  { key: 'sales-invoices', label: 'Sales Invoices', team: 'sales' },
  { key: 'sales-campaigns', label: 'Campaigns', team: 'sales' },
  { key: 'sales-followups', label: 'Follow Ups', team: 'sales', supportsAssign: true },

  // ---- Account team ----
  { key: 'account-revenue', label: 'Revenue / Dashboard', team: 'account' },
  { key: 'account-invoices', label: 'Invoices & Billing', team: 'account' },
  { key: 'account-credit-notes', label: 'Credit Notes', team: 'account' },
  { key: 'account-inventory', label: 'Inventory', team: 'account' },

  // ---- Service team ----
  { key: 'service-prospects', label: 'Service Requests', team: 'service', supportsAssign: true },
  { key: 'service-fsm', label: 'Field Service (FSM)', team: 'service', supportsAssign: true },
  { key: 'service-interactions', label: 'Interactions', team: 'service' },

  // ---- Delivery team ----
  { key: 'delivery-challans', label: 'Delivery Challans', team: 'delivery' },
  { key: 'delivery-distribution', label: 'Distribution', team: 'delivery' },
  { key: 'delivery-fsm', label: 'Field Service (FSM)', team: 'delivery', supportsAssign: true },

  // ---- HR team ----
  { key: 'hr-employees', label: 'Employees', team: 'hr' },
  { key: 'hr-leaves', label: 'Leaves', team: 'hr' },

  // ---- B2C team ----
  { key: 'b2c-orders', label: 'Orders', team: 'b2c' },
  { key: 'b2c-services', label: 'Services', team: 'b2c' },
  { key: 'b2c-reviews', label: 'Reviews', team: 'b2c' },
  { key: 'b2c-banners', label: 'Banners', team: 'b2c' },

  // ---- Website team ----
  { key: 'website-sync', label: 'Website Sync', team: 'website' },
  { key: 'website-contacts', label: 'Website Contacts', team: 'website' },

  // ---- Shared across every team ----
  { key: 'team-users', label: 'Team / Sub-users', team: '*' },
  { key: 'team-activity', label: 'Activity / History', team: '*' },
];

const MODULE_KEYS = MODULES.map((m) => m.key);

const getModulesForTeam = (team) => MODULES.filter((m) => m.team === team || m.team === '*');

// Builds an "everything true" permission map for a given team — used for
// legacy flat-role users who have no custom Role assigned yet, so they keep
// working exactly like before this feature existed.
const buildFullAccessMap = (team) => {
  const map = {};
  getModulesForTeam(team).forEach((m) => {
    map[m.key] = { view: true, create: true, edit: true, delete: true, assign: true };
  });
  return map;
};

const buildEmptyAccessMap = () => {
  const map = {};
  MODULE_KEYS.forEach((key) => {
    map[key] = { view: false, create: false, edit: false, delete: false, assign: false };
  });
  return map;
};

module.exports = {
  ACTIONS,
  MODULES,
  MODULE_KEYS,
  getModulesForTeam,
  buildFullAccessMap,
  buildEmptyAccessMap,
};
