const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getAllUsers,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/signin', login); // Alias for login endpoint
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgot-password', forgotPassword); // Step 1: send OTP to email
router.post('/reset-password', resetPassword); // Step 2: verify OTP + set new password
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;
