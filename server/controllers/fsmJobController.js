const FsmJob = require('../models/FsmJob');
const cloudinary = require('../config/cloudinary');
const { generateAndSendOtpToEmail, verifyEmailOtp } = require('../services/otpService');

const findMyJob = async (req) => {
  return FsmJob.findOne({ _id: req.params.id, assignedTo: req.fsmUser._id });
};

// @desc    Get all jobs (leads) assigned to logged-in FSM, newest first
// @route   GET /api/fsm/jobs?status=pending
// @access  Private (FSM)
exports.getMyJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { assignedTo: req.fsmUser._id };
    if (status) filter.status = status;

    const jobs = await FsmJob.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single job detail (price, address, customer contact, etc.)
// @route   GET /api/fsm/jobs/:id
// @access  Private (FSM)
exports.getMyJobById = async (req, res) => {
  try {
    const job = await findMyJob(req);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept an assigned job
// @route   PUT /api/fsm/jobs/:id/accept
// @access  Private (FSM)
exports.acceptJob = async (req, res) => {
  try {
    const job = await findMyJob(req);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Job is already ${job.status}` });
    }

    job.status = 'accepted';
    job.acceptedAt = new Date();
    await job.save();

    res.status(200).json({ success: true, message: 'Job accepted', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start service - sends OTP to customer's email
// @route   PUT /api/fsm/jobs/:id/start-service
// @access  Private (FSM)
exports.startService = async (req, res) => {
  try {
    const job = await findMyJob(req);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Accept the job before starting service' });
    }
    if (!job.customerEmail) {
      return res.status(400).json({ success: false, message: 'Customer email not available for this lead' });
    }

    await generateAndSendOtpToEmail(job.customerEmail);

    res.status(200).json({ success: true, message: 'OTP sent to customer email. Ask customer for the OTP to start work.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify start-service OTP -> moves job to in_progress
// @route   POST /api/fsm/jobs/:id/verify-start-otp
// @access  Private (FSM)
exports.verifyStartOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    const job = await findMyJob(req);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Job is not ready for start-service verification' });
    }

    const isValid = await verifyEmailOtp(job.customerEmail, otp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    job.startOtpVerified = true;
    job.status = 'in_progress';
    job.startedAt = new Date();
    await job.save();

    res.status(200).json({ success: true, message: 'Service started. Upload a before-work photo.', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload before-work photo
// @route   POST /api/fsm/jobs/:id/before-photo
// @access  Private (FSM)
exports.uploadBeforePhoto = async (req, res) => {
  try {
    const job = await findMyJob(req);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.status !== 'in_progress' || !job.startOtpVerified) {
      return res.status(400).json({ success: false, message: 'Verify start-service OTP before uploading photos' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Photo file is required' });
    }

    // Purani before-photo hatao agar dobara upload ho rahi ho
    if (job.beforePhoto?.publicId) {
      await cloudinary.uploader.destroy(job.beforePhoto.publicId).catch(() => {});
    }

    job.beforePhoto = { url: req.file.path, publicId: req.file.filename };
    await job.save();

    res.status(200).json({ success: true, message: 'Before-work photo uploaded', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload after-work photo (once work is done)
// @route   POST /api/fsm/jobs/:id/after-photo
// @access  Private (FSM)
exports.uploadAfterPhoto = async (req, res) => {
  try {
    const job = await findMyJob(req);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (!job.beforePhoto?.url) {
      return res.status(400).json({ success: false, message: 'Upload the before-work photo first' });
    }
    if (job.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Job is not in progress' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Photo file is required' });
    }

    if (job.afterPhoto?.publicId) {
      await cloudinary.uploader.destroy(job.afterPhoto.publicId).catch(() => {});
    }

    job.afterPhoto = { url: req.file.path, publicId: req.file.filename };
    await job.save();

    res.status(200).json({ success: true, message: 'After-work photo uploaded. Request completion OTP next.', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request completion OTP (sent to customer email) after after-work photo
// @route   PUT /api/fsm/jobs/:id/request-complete-otp
// @access  Private (FSM)
exports.requestCompleteOtp = async (req, res) => {
  try {
    const job = await findMyJob(req);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (!job.afterPhoto?.url) {
      return res.status(400).json({ success: false, message: 'Upload the after-work photo first' });
    }
    if (job.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Job is not in progress' });
    }

    await generateAndSendOtpToEmail(job.customerEmail);

    res.status(200).json({ success: true, message: 'Completion OTP sent to customer email.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify completion OTP -> marks job as completed
// @route   POST /api/fsm/jobs/:id/verify-complete-otp
// @access  Private (FSM)
exports.verifyCompleteOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required' });
    }

    const job = await findMyJob(req);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (!job.afterPhoto?.url) {
      return res.status(400).json({ success: false, message: 'Upload the after-work photo first' });
    }
    if (job.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Job is not in progress' });
    }

    const isValid = await verifyEmailOtp(job.customerEmail, otp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    job.completeOtpVerified = true;
    job.status = 'completed';
    job.completedAt = new Date();
    await job.save();

    res.status(200).json({ success: true, message: 'Job marked as completed', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
