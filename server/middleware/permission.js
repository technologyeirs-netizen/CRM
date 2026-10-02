const User = require('../models/User');
const Role = require('../models/Role');
const { isSuperAdminRole } = require('../config/roles');
const { buildFullAccessMap, getModulesForTeam } = require('../config/modules');

// ============================================
// PERMISSION ENGINE
// ------------------------------------------------
// Computes what a logged-in user is actually allowed to do, tab by tab,
// and exposes it as req.permissions on every request (see attachPermissions
// below). Two building blocks:
//
//   1. Super Admin              -> everything, always.
//   2. User has a `customRole`  -> exactly what that Role's matrix says
//      (this is the "admin decides how many tabs this person gets" path).
//   3. Legacy flat-role user
//      (no customRole set yet)  -> full access to every module of their own
//      team, exactly like the CRM behaved before this feature existed. This
//      keeps every existing team-lead account working unchanged.
// ============================================

const isSuperAdminUser = (user) => Boolean(user?.isAdmin) || isSuperAdminRole(user?.role);

/**
 * Computes the effective permission object for a user document.
 * Returns:
 *   {
 *     isSuperAdmin: boolean,
 *     team: string,               // department the user belongs to
 *     dataScope: 'own' | 'team' | 'all',
 *     canViewFullRevenue: boolean,
 *     canManageTeamUsers: boolean,
 *     roleName: string,
 *     modules: { [moduleKey]: { view, create, edit, delete, assign } },
 *   }
 */
async function computeEffectivePermissions(user) {
  if (isSuperAdminUser(user)) {
    return {
      isSuperAdmin: true,
      team: user.role,
      dataScope: 'all',
      canViewFullRevenue: true,
      canManageTeamUsers: true,
      roleName: 'Super Admin',
      modules: null, // null == unrestricted, every module/action allowed
    };
  }

  let role = user.customRole;
  if (role && !(role instanceof Role)) {
    // customRole may already be populated (an object) or just an id.
    role = await Role.findById(role).lean();
  }

  if (role && role.isActive !== false) {
    const modules = {};
    const permMap = role.permissions instanceof Map ? role.permissions : new Map(Object.entries(role.permissions || {}));
    permMap.forEach((value, key) => {
      modules[key] = {
        view: Boolean(value.view),
        create: Boolean(value.create),
        edit: Boolean(value.edit),
        delete: Boolean(value.delete),
        assign: Boolean(value.assign),
      };
    });

    return {
      isSuperAdmin: false,
      team: role.team,
      dataScope: role.dataScope || 'own',
      canViewFullRevenue: Boolean(role.canViewFullRevenue),
      canManageTeamUsers: Boolean(role.canManageTeamUsers),
      roleName: role.name,
      modules,
    };
  }

  // Legacy fallback: full access to their own team's tabs, team-wide data
  // scope (same behaviour as before granular permissions existed).
  return {
    isSuperAdmin: false,
    team: user.role,
    dataScope: 'team',
    canViewFullRevenue: user.role === 'account',
    canManageTeamUsers: true,
    roleName: null,
    modules: buildFullAccessMap(user.role),
  };
}

/**
 * Express middleware — attach req.permissions to every authenticated
 * request. Mount this right after `protect` on any router that needs
 * fine-grained checks.
 */
async function attachPermissions(req, res, next) {
  try {
    if (!req.user) return next();
    req.permissions = await computeEffectivePermissions(req.user);
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to resolve permissions', error: error.message });
  }
}

const canDo = (permissions, moduleKey, action) => {
  if (!permissions) return false;
  if (permissions.isSuperAdmin) return true;
  if (!permissions.modules) return true;
  return Boolean(permissions.modules[moduleKey]?.[action]);
};

/**
 * Route guard: requirePermission('sales-leads', 'edit')
 * Super Admin always passes. Everyone else must have that exact
 * module+action granted on their effective permission set.
 */
function requirePermission(moduleKey, action) {
  return async (req, res, next) => {
    try {
      if (!req.permissions) {
        req.permissions = await computeEffectivePermissions(req.user);
      }
      if (!canDo(req.permissions, moduleKey, action)) {
        return res.status(403).json({
          success: false,
          message: `You don't have "${action}" permission on this tab`,
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}

/**
 * Returns every user id in `managerId`'s downline (people who report to
 * them, directly or transitively), NOT including the manager themselves.
 * Used to scope "team" dataScope queries and to validate that a manager is
 * only assigning leads / viewing history for their own people.
 */
async function getDownlineUserIds(managerId) {
  const all = [];
  let frontier = [managerId];

  while (frontier.length) {
    // eslint-disable-next-line no-await-in-loop
    const children = await User.find({ reportsTo: { $in: frontier } }).select('_id').lean();
    const childIds = children.map((c) => String(c._id));
    const newOnes = childIds.filter((id) => !all.includes(id));
    if (!newOnes.length) break;
    all.push(...newOnes);
    frontier = newOnes;
  }

  return all;
}

/**
 * Convenience: ids this user is allowed to see records for, based on
 * dataScope — [self] for 'own', [self + downline] for 'team', or null for
 * 'all' (no restriction, e.g. Super Admin / whole-team Account view).
 */
async function getVisibleUserIds(req) {
  const permissions = req.permissions || (await computeEffectivePermissions(req.user));
  if (permissions.isSuperAdmin || permissions.dataScope === 'all') return null;

  const selfId = String(req.user._id);
  if (permissions.dataScope === 'own') return [selfId];

  const downline = await getDownlineUserIds(req.user._id);
  return [selfId, ...downline];
}

/**
 * Mongo filter object to scope a revenue/financial query.
 * canViewFullRevenue -> {} (no restriction, e.g. Account Manager / Super Admin).
 * otherwise           -> { createdBy: <self> } (only their own numbers), so
 *                         an employee under the Account Manager can never
 *                         see the whole team's revenue.
 */
function getRevenueScopeFilter(req) {
  const permissions = req.permissions;
  if (!permissions || permissions.isSuperAdmin || permissions.canViewFullRevenue) return {};
  return { createdBy: req.user._id };
}

module.exports = {
  computeEffectivePermissions,
  attachPermissions,
  requirePermission,
  canDo,
  getDownlineUserIds,
  getVisibleUserIds,
  getRevenueScopeFilter,
  isSuperAdminUser,
};
