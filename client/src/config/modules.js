// =========================================================================
// CENTRAL MODULE / TAB REGISTRY (Client)
// -------------------------------------------------------------------------
// Mirrors server/config/modules.js. The authoritative list still comes from
// GET /api/roles/modules (so it can never drift from what the backend
// actually enforces) — this file only provides instant labels/fallback
// while that request is in flight.
// =========================================================================

export const ACTIONS = ['view', 'create', 'edit', 'delete', 'assign'];

export const ACTION_LABELS = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  assign: 'Assign',
};

export const MODULES = [
  { key: 'sales-leads', label: 'Leads / Clients', team: 'sales', supportsAssign: true },
  { key: 'sales-quotations', label: 'Quotations', team: 'sales' },
  { key: 'sales-invoices', label: 'Sales Invoices', team: 'sales' },
  { key: 'sales-campaigns', label: 'Campaigns', team: 'sales' },
  { key: 'sales-followups', label: 'Follow Ups', team: 'sales', supportsAssign: true },

  { key: 'account-revenue', label: 'Revenue / Dashboard', team: 'account' },
  { key: 'account-invoices', label: 'Invoices & Billing', team: 'account' },
  { key: 'account-credit-notes', label: 'Credit Notes', team: 'account' },
  { key: 'account-inventory', label: 'Inventory', team: 'account' },

  { key: 'service-prospects', label: 'Service Requests', team: 'service', supportsAssign: true },
  { key: 'service-fsm', label: 'Field Service (FSM)', team: 'service', supportsAssign: true },
  { key: 'service-interactions', label: 'Interactions', team: 'service' },

  { key: 'delivery-challans', label: 'Delivery Challans', team: 'delivery' },
  { key: 'delivery-distribution', label: 'Distribution', team: 'delivery' },
  { key: 'delivery-fsm', label: 'Field Service (FSM)', team: 'delivery', supportsAssign: true },

  { key: 'hr-employees', label: 'Employees', team: 'hr' },
  { key: 'hr-leaves', label: 'Leaves', team: 'hr' },

  { key: 'b2c-orders', label: 'Orders', team: 'b2c' },
  { key: 'b2c-services', label: 'Services', team: 'b2c' },
  { key: 'b2c-reviews', label: 'Reviews', team: 'b2c' },
  { key: 'b2c-banners', label: 'Banners', team: 'b2c' },

  { key: 'website-sync', label: 'Website Sync', team: 'website' },
  { key: 'website-contacts', label: 'Website Contacts', team: 'website' },

  { key: 'team-users', label: 'Team / Sub-users', team: '*' },
  { key: 'team-activity', label: 'Activity / History', team: '*' },
];

export const getModulesForTeam = (team) => MODULES.filter((m) => m.team === team || m.team === '*');
