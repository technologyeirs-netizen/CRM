const User = require('../models/User');
const { TEAM_ROLES, TEAM_LABELS, isSuperAdminRole } = require('../config/roles');
const { decryptPassword } = require('../utils/passwordCrypto');

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
  status: u.status,
  isActive: u.isActive,
  createdBy: u.createdBy,
  approvedBy: u.approvedBy,
  approvedAt: u.approvedAt,
  createdAt: u.createdAt,
});

// @desc    Create a team login (sub-user).
//          - Super Admin: can create a user for ANY team, activated instantly.
//          - Team lead (account/sales/service/delivery/hr/b2c/website): can only
//            invite people into THEIR OWN team. That account is created with
//            status "pending" and stays locked out until the Super Admin
//            approves it.
// @route   POST /api/users
// @access  Private (any active, non-employee login)
exports.createTeamUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const requester = req.user;
    const requesterIsSuperAdmin = Boolean(requester.isAdmin) || isSuperAdminRole(requester.role);

    if (!requesterIsSuperAdmin && !TEAM_ROLES.includes(requester.role)) {
      return res.status(403).json({ success: false, message: 'Your account is not permitted to create team users' });
    }

    let targetRole;
    if (requesterIsSuperAdmin) {
      targetRole = role;
      if (!TEAM_ROLES.includes(targetRole) && !isSuperAdminRole(targetRole)) {
        return res.status(400).json({ success: false, message: 'Please choose a valid team role' });
      }
    } else {
      // A team lead can only add colleagues into their OWN department,
      // regardless of what role value is sent from the client.
      targetRole = requester.role;
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
//          Super Admin sees everyone; a team lead sees only themself and the
//          people they personally invited into their team.
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res) => {
  try {
    const requester = req.user;
    const requesterIsSuperAdmin = Boolean(requester.isAdmin) || isSuperAdminRole(requester.role);

    const query = requesterIsSuperAdmin
      ? { ...TEAM_USER_FILTER }
      : { ...TEAM_USER_FILTER, $or: [{ _id: requester._id }, { createdBy: requester._id }] };

    const users = await User.find(query).select('+passwordEncrypted').sort({ createdAt: -1 });
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
