const Role = require('../models/Role');
const User = require('../models/User');
const { TEAM_ROLES, TEAM_LABELS } = require('../config/roles');
const { MODULES, MODULE_KEYS, getModulesForTeam, ACTIONS } = require('../config/modules');
const { isSuperAdminUser } = require('../middleware/permission');

const shapeRole = (r) => ({
  id: r._id,
  name: r.name,
  team: r.team,
  teamLabel: TEAM_LABELS[r.team] || r.team,
  permissions: r.permissions instanceof Map ? Object.fromEntries(r.permissions) : r.permissions || {},
  canViewFullRevenue: r.canViewFullRevenue,
  dataScope: r.dataScope,
  canManageTeamUsers: r.canManageTeamUsers,
  description: r.description,
  isActive: r.isActive,
  createdBy: r.createdBy,
  createdAt: r.createdAt,
});

// @desc    List every module/tab + action that a permission matrix can be
//          built from (used to render the checkbox grid in the UI).
// @route   GET /api/roles/modules
// @access  Private (Super Admin sees all teams; team lead sees own team)
exports.getModuleRegistry = async (req, res) => {
  try {
    const requesterIsSuperAdmin = isSuperAdminUser(req.user);
    const team = req.query.team;

    let modules = MODULES;
    if (team) {
      modules = getModulesForTeam(team);
    } else if (!requesterIsSuperAdmin) {
      modules = getModulesForTeam(req.user.role);
    }

    res.status(200).json({ success: true, actions: ACTIONS, modules, teams: TEAM_ROLES });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a Role (Super Admin decides the exact permission matrix)
// @route   POST /api/roles
// @access  Private/Super Admin
exports.createRole = async (req, res) => {
  try {
    const { name, team, permissions, canViewFullRevenue, dataScope, canManageTeamUsers, description } = req.body;

    if (!name || !team) {
      return res.status(400).json({ success: false, message: 'Role name and team are required' });
    }
    if (!TEAM_ROLES.includes(team)) {
      return res.status(400).json({ success: false, message: 'Invalid team' });
    }

    // Only keep permission entries for modules that actually belong to this
    // team (or are shared '*' modules) — ignore anything else sent by the client.
    const allowedKeys = new Set(getModulesForTeam(team).map((m) => m.key));
    const cleanPermissions = {};
    Object.entries(permissions || {}).forEach(([key, value]) => {
      if (!allowedKeys.has(key)) return;
      cleanPermissions[key] = {
        view: Boolean(value?.view),
        create: Boolean(value?.create),
        edit: Boolean(value?.edit),
        delete: Boolean(value?.delete),
        assign: Boolean(value?.assign),
      };
    });

    const role = await Role.create({
      name: String(name).trim(),
      team,
      permissions: cleanPermissions,
      canViewFullRevenue: Boolean(canViewFullRevenue),
      dataScope: dataScope === 'team' ? 'team' : 'own',
      canManageTeamUsers: Boolean(canManageTeamUsers),
      description: description || '',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Role created', role: shapeRole(role) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A role with this name already exists in this team' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List roles. Super Admin sees every role; a team lead only sees
//          the (active) roles created for their own team, so they can pick
//          one when hiring a sub-user.
// @route   GET /api/roles
// @access  Private
exports.getRoles = async (req, res) => {
  try {
    const requesterIsSuperAdmin = isSuperAdminUser(req.user);
    const query = requesterIsSuperAdmin ? {} : { team: req.user.role, isActive: true };
    if (req.query.team && requesterIsSuperAdmin) query.team = req.query.team;

    const roles = await Role.find(query).sort({ team: 1, name: 1 });
    res.status(200).json({ success: true, count: roles.length, roles: roles.map(shapeRole) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a role's permission matrix / flags
// @route   PUT /api/roles/:id
// @access  Private/Super Admin
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

    const { name, permissions, canViewFullRevenue, dataScope, canManageTeamUsers, description, isActive } = req.body;

    if (name) role.name = String(name).trim();
    if (description !== undefined) role.description = description;
    if (canViewFullRevenue !== undefined) role.canViewFullRevenue = Boolean(canViewFullRevenue);
    if (canManageTeamUsers !== undefined) role.canManageTeamUsers = Boolean(canManageTeamUsers);
    if (dataScope) role.dataScope = dataScope === 'team' ? 'team' : 'own';
    if (isActive !== undefined) role.isActive = Boolean(isActive);

    if (permissions) {
      const allowedKeys = new Set(getModulesForTeam(role.team).map((m) => m.key));
      const cleanPermissions = {};
      Object.entries(permissions).forEach(([key, value]) => {
        if (!allowedKeys.has(key)) return;
        cleanPermissions[key] = {
          view: Boolean(value?.view),
          create: Boolean(value?.create),
          edit: Boolean(value?.edit),
          delete: Boolean(value?.delete),
          assign: Boolean(value?.assign),
        };
      });
      role.permissions = cleanPermissions;
    }

    await role.save();
    res.status(200).json({ success: true, message: 'Role updated', role: shapeRole(role) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a role (blocked if still assigned to any user)
// @route   DELETE /api/roles/:id
// @access  Private/Super Admin
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

    const usersWithRole = await User.countDocuments({ customRole: role._id });
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — ${usersWithRole} user(s) currently have this role. Reassign them first.`,
      });
    }

    await Role.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Role deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
