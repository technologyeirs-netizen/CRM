const jwt = require('jsonwebtoken');
const FsmUser = require('../models/FsmUser');

// Protect FSM app routes - FSM must be logged in (OTP based JWT)
exports.protectFsm = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'fsm') {
      return res.status(403).json({ success: false, message: 'FSM access only' });
    }

    req.fsmUser = await FsmUser.findById(decoded.id);

    if (!req.fsmUser) {
      return res.status(401).json({ success: false, message: 'FSM user not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};
