const User = require('../models/User');
const Employee = require('../models/Employee');
const bootstrapAdminFromEnv = require('../config/bootstrapAdmin');
const { generateAndSendOtpToEmail, verifyEmailOtp } = require('../services/otpService');

// @desc    Register a new admin/agent
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email: normalizedEmail, password, role });
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @route   POST /api/auth/signin
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    console.log(`[LOGIN] Attempting login for: ${normalizedEmail}`);

    const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim();
    const isAdminAlias = normalizedEmail === 'admin@eirtech.com' || normalizedEmail === adminEmail;

    const [user, employee] = await Promise.all([
      User.findOne({ email: normalizedEmail }).select('+password'),
      Employee.findOne({
        email: normalizedEmail,
        isDeleted: { $ne: true },
      }).select('+password'),
    ]);

    const syncEmployeeUser = async (sourceEmployee) => {
      let authUser = user;

      if (!authUser) {
        authUser = await User.create({
          name: sourceEmployee.name,
          email: sourceEmployee.email,
          password,
          role: 'employee',
          isAdmin: false,
          isActive: true,
        });
      } else {
        authUser.name = sourceEmployee.name || authUser.name;
        authUser.email = sourceEmployee.email || authUser.email;
        authUser.password = password;
        authUser.role = 'employee';
        authUser.isAdmin = false;
        authUser.isActive = true;
        await authUser.save();
      }

      return authUser;
    };

    if (user) {
      const userPasswordMatch = await user.matchPassword(password);
      if (userPasswordMatch) {
        const isEmployeeLogin = user.role === 'employee' || Boolean(employee);

        if (isEmployeeLogin) {
          const authUser = await syncEmployeeUser(employee || { name: user.name, email: user.email });
          const token = authUser.getSignedJwtToken();
          console.log(`[LOGIN] ✓ Successful login for: ${normalizedEmail}`);

          return res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            token,
            data: { id: authUser._id, name: authUser.name, email: authUser.email, role: authUser.role, isAdmin: authUser.isAdmin },
          });
        }
      }
    }

    if (isAdminAlias && adminPassword && password === adminPassword) {
      await bootstrapAdminFromEnv();

      const adminUser = await User.findOne({ email: adminEmail || normalizedEmail }).select('+password');
      if (adminUser && (await adminUser.matchPassword(password))) {
        const token = adminUser.getSignedJwtToken();
        console.log(`[LOGIN] ✓ Successful admin alias login for: ${normalizedEmail}`);

        return res.status(200).json({
          success: true,
          message: 'Logged in successfully',
          token,
          data: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role, isAdmin: adminUser.isAdmin },
        });
      }
    }

    if (!employee || !employee.password) {
      console.log(`[LOGIN] User not found or inactive: ${normalizedEmail}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials or account deactivated' });
    }

    const employeePasswordMatch = await employee.matchPassword(password);
    if (!employeePasswordMatch) {
      console.log(`[LOGIN] Password mismatch for employee: ${normalizedEmail}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const authUser = await syncEmployeeUser(employee);

    const token = authUser.getSignedJwtToken();
    console.log(`[LOGIN] ✓ Successful login for: ${normalizedEmail}`);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: { id: authUser._id, name: authUser.name, email: authUser.email, role: authUser.role, isAdmin: authUser.isAdmin },
    });
  } catch (error) {
    console.error('[authController.login] ❌ Error:', error.message);
    console.error('[authController.login] Stack:', error.stack);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, message: 'Password updated', token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send OTP to email for password reset (Forgot Password)
//          - Employee jab apna login password bhool jaye to yaha se
//            OTP mangwa sakta hai, jaise FSM app mein email OTP bhejte hai waise hi.
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const [user, employee] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      Employee.findOne({ email: normalizedEmail, isDeleted: { $ne: true } }),
    ]);

    if (!user && !employee) {
      // Security ke liye same generic message, taaki koi ye pata na kar paye
      // ki email registered hai ya nahi.
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, an OTP has been sent.',
      });
    }

    await generateAndSendOtpToEmail(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please check your inbox.',
    });
  } catch (error) {
    console.error('[authController.forgotPassword] ❌ Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
};

// @desc    Verify OTP and set a new password (Forgot Password - Step 2)
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const isValidOtp = await verifyEmailOtp(normalizedEmail, otp);
    if (!isValidOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const [user, employee] = await Promise.all([
      User.findOne({ email: normalizedEmail }).select('+password'),
      Employee.findOne({ email: normalizedEmail, isDeleted: { $ne: true } }).select('+password'),
    ]);

    if (!user && !employee) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    // Employee login password ke saath-saath uska mirrored User account bhi
    // update karo, dono jagah password sync rehna chahiye (jaise employeeController
    // mein already ho raha hai).
    if (employee) {
      employee.password = newPassword;
      await employee.save();
    }

    if (user) {
      user.password = newPassword;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });
  } catch (error) {
    console.error('[authController.resetPassword] ❌ Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to reset password' });
  }
};
