const FsmUser = require('../models/FsmUser');
const cloudinary = require('../config/cloudinary');
const { generateAndSendOtpToEmail, verifyEmailOtp } = require('../services/otpService');

// @desc    Register a new FSM (Field Service Man) - Step 1 basic details
// @route   POST /api/fsm/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      alternateNumber,
      accountHolderName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
    } = req.body;

    if (!fullName || !phone || !email || !accountHolderName || !accountNumber || !confirmAccountNumber || !ifscCode) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }

    if (accountNumber !== confirmAccountNumber) {
      return res.status(400).json({ success: false, message: 'Account number and Confirm account number do not match' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await FsmUser.findOne({ $or: [{ email: normalizedEmail }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'FSM already registered with this email or phone' });
    }

    const fsmUser = await FsmUser.create({
      fullName,
      phone,
      email: normalizedEmail,
      alternateNumber,
      accountHolderName,
      accountNumber,
      ifscCode,
    });

    res.status(201).json({
      success: true,
      message: 'Signup step 1 successful. Please upload your documents next.',
      fsmId: fsmUser._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload FSM documents - Step 2
// @route   POST /api/fsm/:id/upload-documents
// @access  Public (fsmId acts as the reference from step 1)
exports.uploadDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const fsmUser = await FsmUser.findById(id);

    if (!fsmUser) {
      return res.status(404).json({ success: false, message: 'FSM user not found' });
    }

    const files = req.files;
    const requiredFields = ['aadharCard', 'panCard', 'drivingLicense', 'passportPhoto', 'videoClip', 'eirsIdCard'];

    for (const field of requiredFields) {
      if (!files || !files[field]) {
        return res.status(400).json({ success: false, message: `${field} is required` });
      }
    }

    // Cloudinary video upload response me duration (seconds) khud aata hai
    const videoFile = files.videoClip[0];
    const maxDuration = Number(process.env.MAX_VIDEO_DURATION) || 30;

    if (videoFile.duration && videoFile.duration > maxDuration) {
      await cloudinary.uploader.destroy(videoFile.filename, { resource_type: 'video' });
      return res.status(400).json({
        success: false,
        message: `Video clip must not exceed ${maxDuration} seconds. Uploaded video is ${Math.round(videoFile.duration)} seconds.`,
      });
    }

    fsmUser.documents = {
      aadharCard: { url: files.aadharCard[0].path, publicId: files.aadharCard[0].filename },
      panCard: { url: files.panCard[0].path, publicId: files.panCard[0].filename },
      drivingLicense: { url: files.drivingLicense[0].path, publicId: files.drivingLicense[0].filename },
      passportPhoto: { url: files.passportPhoto[0].path, publicId: files.passportPhoto[0].filename },
      videoClip: { url: videoFile.path, publicId: videoFile.filename, duration: videoFile.duration || null },
      eirsIdCard: { url: files.eirsIdCard[0].path, publicId: files.eirsIdCard[0].filename },
    };
    fsmUser.documentsSubmitted = true;
    fsmUser.status = 'pending'; // admin ke review ke liye pending

    await fsmUser.save();

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully. Waiting for admin approval.',
      status: fsmUser.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send OTP to FSM's registered email
// @route   POST /api/fsm/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
  try {
    console.log("========== SEND OTP START ==========");

    const { email } = req.body;

    if (!email) {
      console.log("❌ Email missing");
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    console.log("📧 Email:", normalizedEmail);

    const fsmUser = await FsmUser.findOne({
      email: normalizedEmail,
    });

    if (!fsmUser) {
      console.log("❌ FSM User not found");

      return res.status(404).json({
        success: false,
        message: "No FSM account found with this email. Please sign up first.",
      });
    }

    console.log("✅ FSM User Found");
    console.log({
      id: fsmUser._id,
      status: fsmUser.status,
      documentsSubmitted: fsmUser.documentsSubmitted,
      isActive: fsmUser.isActive,
    });

    // Documents check
    if (!fsmUser.documentsSubmitted) {
      console.log("❌ Documents not uploaded");

      return res.status(403).json({
        success: false,
        message: "Please complete document upload first.",
      });
    }

    // Pending
    if (fsmUser.status === "pending") {
      console.log("❌ User Pending");

      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval.",
      });
    }

    // Rejected
    if (fsmUser.status === "rejected") {
      console.log("❌ User Rejected");

      return res.status(403).json({
        success: false,
        message: fsmUser.rejectionReason
          ? `Your account has been rejected. Reason: ${fsmUser.rejectionReason}`
          : "Your account has been rejected.",
      });
    }

    console.log("📨 Sending OTP Email...");

    const otp = await generateAndSendOtpToEmail(normalizedEmail);

    console.log("✅ OTP Generated:", otp);

    console.log("========== SEND OTP SUCCESS ==========");

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email.",
    });
  } catch (error) {
    console.error("========== SEND OTP ERROR ==========");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Response:", error.response);
    console.error("Response Code:", error.responseCode);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
      code: error.code || null,
      response: error.response || null,
    });
  }
};

// @desc    Verify OTP and login FSM
// @route   POST /api/fsm/verify-otp
// @access  Public
exports.verifyOtpAndLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const fsmUser = await FsmUser.findOne({
      email: normalizedEmail,
    });

    if (!fsmUser) {
      return res.status(404).json({
        success: false,
        message: 'FSM user not found',
      });
    }

    // Documents check
    if (!fsmUser.documentsSubmitted) {
      return res.status(403).json({
        success: false,
        message: 'Please upload your documents first.',
      });
    }

    // Pending check
    if (fsmUser.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval.',
      });
    }

    // Rejected check
    if (fsmUser.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message:
          fsmUser.rejectionReason
            ? `Your account has been rejected. Reason: ${fsmUser.rejectionReason}`
            : 'Your account has been rejected.',
      });
    }

    // Final approval check
    if (fsmUser.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not approved.',
      });
    }

    // Verify OTP
    const isValid = await verifyEmailOtp(normalizedEmail, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Generate JWT
    const token = fsmUser.getSignedJwtToken();

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: {
        id: fsmUser._id,
        fullName: fsmUser.fullName,
        email: fsmUser.email,
        phone: fsmUser.phone,
        status: fsmUser.status,
        isActive: fsmUser.isActive,
        documentsSubmitted: fsmUser.documentsSubmitted,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};;

// @desc    Get logged-in FSM's own profile
// @route   GET /api/fsm/me
// @access  Private (FSM)
exports.getMyProfile = async (req, res) => {
  res.status(200).json({ success: true, data: req.fsmUser });
};

// @desc    Toggle FSM availability (online/offline)
// @route   PUT /api/fsm/toggle-active
// @access  Private (FSM)
exports.toggleActiveStatus = async (req, res) => {
  try {
    const fsmUser = req.fsmUser;

    if (fsmUser.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'You can only go active once admin has approved your account',
      });
    }

    fsmUser.isActive = !fsmUser.isActive;
    await fsmUser.save();

    res.status(200).json({
      success: true,
      message: `You are now ${fsmUser.isActive ? 'Active' : 'Inactive'}`,
      isActive: fsmUser.isActive,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
