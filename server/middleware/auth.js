const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isSuperAdminRole } = require('../config/roles');

// Helper — true for Super Admin accounts (role based OR legacy isAdmin flag)
const isSuperAdminUser = (user) => Boolean(user?.isAdmin) || isSuperAdminRole(user?.role);

// Protect routes - must be logged in
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    // Sub-users created by a team lead stay locked out until the Super Admin
    // approves their account, even if they somehow already hold a valid token.
    if (req.user.status === 'pending') {
      return res.status(403).json({
        success: false,
        status: 'pending',
        message: 'Your account is awaiting Super Admin approval.',
      });
    }

    if (req.user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        status: 'rejected',
        message: 'Your account request was rejected by the Super Admin.',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Authorize by roles — Super Admin always passes, everyone else must match
// one of the listed roles (department-based access control).
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (isSuperAdminUser(req.user)) {
      return next();
    }

    const userRole = req.user.role || 'user';

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User is not authorized to access this resource (role: ${userRole})`,
      });
    }

    next();
  };
};

// Only Super Admin may proceed (used for user-approval / user-management routes)
exports.requireSuperAdmin = (req, res, next) => {
  if (!isSuperAdminUser(req.user)) {
    return res.status(403).json({ success: false, message: 'Only Super Admin can perform this action' });
  }
  next();
};

exports.isSuperAdminUser = isSuperAdminUser;
