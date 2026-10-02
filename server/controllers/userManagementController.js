const User = require('../models/User');
const Role = require('../models/Role');
const { TEAM_ROLES, TEAM_LABELS, isSuperAdminRole } = require('../config/roles');
const { decryptPassword } = require('../utils/passwordCrypto');
const { getDownlineUserIds, isSuperAdminUser } = require('../middleware/permission');

// Only accounts added through "Add Team User" (Super Admin / team lead invite,
// bootstrap admin, employee-login sync) should ever show up on the Team
// Users / Approval screen. Public self-registrations (accountType: 'self') —
// e.g. a client logging in from the website — are excluded here so they
// never appear in this list.
const TEAM_USER_FILTER = { accountType: 'team' };

const shapeUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  password: decryptPassword(u.passwordEncrypted),
  role: u.role,
  roleLabel: TEAM_LABELS[u.role] || u.role,
  customRole: u.customRole
    ? {
        id: u.customRole._id || u.customRole,
        name: u.customRole.name,
        canViewFullRevenue: u.customRole.canViewFullRevenue,
        dataScope: u.customRole.dataScope,
        canManageTeamUsers: u.customRole.canManageTeamUsers,
      }
    : null,
  reportsTo: u.reportsTo,
  status: u.status,
  isActive: u.isActive,
  createdBy: u.createdBy,
  approvedBy: u.approvedBy,
  approvedAt: u.approvedAt,
  createdAt: u.createdAt,
});

// @desc    Create a team login (sub-user).
//          - Super Admin: can create a user for ANY team, activated instantly,
//            optionally with a specific customRole, and lands wherever in
//            the hierarchy they choose (reportsTo).
//          - Team lead / any downline user with `canManageTeamUsers`: can
//            only invite people into THEIR OWN team, assigned a Role that
//            the Super Admin already created for that team (they cannot
//            invent or widen permissions), and the new hire automatically
//            reports to them — this is how "Sales Manager hires a Sales
//            Executive / Telecaller" works. That account is created with
//            status "pending" and stays locked out until the Super Admin
//            approves it.
// @route   POST /api/users
// @access  Private (any active login with permission to manage team users)
exports.createTeamUser = async (req, res) => {
  try {
    const { name, email, password, role, customRoleId, reportsTo } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const requester = req.user;
    const requesterIsSuperAdmin = isSuperAdminUser(requester);
    const requesterPermissions = req.permissions;

    if (!requesterIsSuperAdmin && !TEAM_ROLES.includes(requester.role)) {
      return res.status(403).json({ success: false, message: 'Your account is not permitted to create team users' });
    }
    if (!requesterIsSuperAdmin && requesterPermissions && !requesterPermissions.canManageTeamUsers) {
      return res.status(403).json({ success: false, message: 'Your role is not permitted to add team users' });
    }

    let targetRole;
    let targetCustomRole = null;
    let targetReportsTo;

    if (requesterIsSuperAdmin) {
      targetRole = role;
      if (!TEAM_ROLES.includes(targetRole) && !isSuperAdminRole(targetRole)) {
        return res.status(400).json({ success: false, message: 'Please choose a valid team role' });
      }
      // Super Admin may place the new hire anywhere in the tree.
      targetReportsTo = reportsTo || null;
      if (customRoleId) {
        targetCustomRole = await Role.findById(customRoleId);
        if (!targetCustomRole) {
          return res.status(400).json({ success: false, message: 'Selected role not found' });
        }
      }
    } else {
      // A team lead / downline manager can only add colleagues into their
      // OWN department, and the new hire always reports to them directly.
      targetRole = requester.role;
      targetReportsTo = requester._id;

      if (customRoleId) {
        targetCustomRole = await Role.findById(customRoleId);
        if (!targetCustomRole || targetCustomRole.team !== requester.role) {
          return res.status(400).json({
            success: false,
            message: 'Please choose one of the roles available for your team',
          });
        }
      }
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: targetRole,
      customRole: targetCustomRole ? targetCustomRole._id : null,
      reportsTo: targetReportsTo,
      isAdmin: isSuperAdminRole(targetRole),
      isActive: true,
      status: requesterIsSuperAdmin ? 'active' : 'pending',
      createdBy: requester._id,
      approvedBy: requesterIsSuperAdmin ? requester._id : null,
      approvedAt: requesterIsSuperAdmin ? new Date() : null,
    });

    return res.status(201).json({
      success: true,
      message: requesterIsSuperAdmin
        ? 'Team user created and activated'
        : 'Request sent — this login will work once the Super Admin approves it',
      user: shapeUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List users visible to the requester.
//          Super Admin sees everyone; a team lead sees themself plus their
//          ENTIRE downline (people who report to them, directly or via a
//          chain of sub-managers) — not just the people they personally
//          created. A plain team member with 'own' data scope only sees
//          themself.
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res) => {
  try {
    const requester = req.user;
    const requesterIsSuperAdmin = isSuperAdminUser(requester);

    let query;
    if (requesterIsSuperAdmin) {
      query = { ...TEAM_USER_FILTER };
    } else if (req.permissions?.dataScope === 'team' || req.permissions?.canManageTeamUsers) {
      const downlineIds = await getDownlineUserIds(requester._id);
      query = { ...TEAM_USER_FILTER, $or: [{ _id: requester._id }, { _id: { $in: downlineIds } }] };
    } else {
      query = { ...TEAM_USER_FILTER, _id: requester._id };
    }

    const users = await User.find(query)
      .select('+passwordEncrypted')
      .populate('customRole', 'name canViewFullRevenue dataScope canManageTeamUsers')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users: users.map(shapeUser) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List every account waiting on Super Admin approval
// @route   GET /api/users/pending
// @access  Private/Super Admin
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ ...TEAM_USER_FILTER, status: 'pending' })
      .select('+passwordEncrypted')
      .populate('createdBy', 'name email role')
      .populate('customRole', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map((u) => ({ ...shapeUser(u), createdBy: u.createdBy })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve a pending team-user request
// @route   PUT /api/users/:id/approve
// @access  Private/Super Admin
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This user is not waiting for approval' });
    }

    user.status = 'active';
    user.isActive = true;
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    await user.save();

    res.status(200).json({ success: true, message: 'User approved and activated', user: shapeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a pending team-user request
// @route   PUT /api/users/:id/reject
// @access  Private/Super Admin
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This user is not waiting for approval' });
    }

    user.status = 'rejected';
    user.isActive = false;
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    await user.save();

    res.status(200).json({ success: true, message: 'User request rejected', user: shapeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activate / deactivate an existing team user
// @route   PUT /api/users/:id/status
// @access  Private/Super Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (isSuperAdminRole(user.role)) {
      return res.status(403).json({ success: false, message: 'Cannot modify a Super Admin account here' });
    }

    user.isActive = Boolean(isActive);
    await user.save();

    res.status(200).json({ success: true, message: 'User updated', user: shapeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change a user's custom Role and/or who they report to.
//          Super Admin only — this is exactly the "admin khud permission
//          dega" control panel.
// @route   PUT /api/users/:id/role
// @access  Private/Super Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { customRoleId, reportsTo } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (isSuperAdminRole(user.role)) {
      return res.status(403).json({ success: false, message: 'Cannot modify a Super Admin account here' });
    }

    if (customRoleId !== undefined) {
      if (customRoleId === null) {
        user.customRole = null;
      } else {
        const role = await Role.findById(customRoleId);
        if (!role || role.team !== user.role) {
          return res.status(400).json({ success: false, message: "Role must belong to this user's own team" });
        }
        user.customRole = role._id;
      }
    }

    if (reportsTo !== undefined) {
      user.reportsTo = reportsTo || null;
    }

    await user.save();
    const populated = await User.findById(user._id).populate(
      'customRole',
      'name canViewFullRevenue dataScope canManageTeamUsers'
    );
    res.status(200).json({ success: true, message: 'User updated', user: shapeUser(populated) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Permanently remove a team user
// @route   DELETE /api/users/:id
// @access  Private/Super Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (isSuperAdminRole(user.role)) {
      return res.status(403).json({ success: false, message: 'Cannot delete a Super Admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
