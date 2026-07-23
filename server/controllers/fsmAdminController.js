const mongoose = require('mongoose');
const FsmUser = require('../models/FsmUser');
const FsmJob = require('../models/FsmJob');
const cloudinary = require('../config/cloudinary');

// Website ke leads raw "servicebookings" collection me padi hoti hain
// (websiteSyncController isi collection ko WebsiteSourceBooking naam se use karta hai).
const WebsiteSourceBooking =
  mongoose.models.WebsiteSourceBooking ||
  mongoose.model('WebsiteSourceBooking', new mongoose.Schema({}, { strict: false, collection: 'servicebookings' }));

// @desc    Get all FSM requests (optionally filter by status)
// @route   GET /api/fsm-admin/requests?status=pending
// @access  Private/Admin
exports.getAllFsmRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const fsmUsers = await FsmUser.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: fsmUsers.length, data: fsmUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single FSM request
// @route   GET /api/fsm-admin/requests/:id
// @access  Private/Admin
exports.getFsmRequestById = async (req, res) => {
  try {
    const fsmUser = await FsmUser.findById(req.params.id);
    if (!fsmUser) {
      return res.status(404).json({ success: false, message: 'FSM user not found' });
    }
    res.status(200).json({ success: true, data: fsmUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve an FSM request
// @route   PUT /api/fsm-admin/requests/:id/approve
// @access  Private/Admin
exports.approveFsmRequest = async (req, res) => {
  try {
    const fsmUser = await FsmUser.findById(req.params.id);
    if (!fsmUser) {
      return res.status(404).json({ success: false, message: 'FSM user not found' });
    }

    if (!fsmUser.documentsSubmitted) {
      return res.status(400).json({ success: false, message: 'Documents not submitted yet' });
    }

    fsmUser.status = 'approved';
    fsmUser.rejectionReason = null;
    fsmUser.reviewedAt = new Date();
    await fsmUser.save();

    res.status(200).json({ success: true, message: 'FSM approved successfully', data: fsmUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject an FSM request
// @route   PUT /api/fsm-admin/requests/:id/reject
// @access  Private/Admin
exports.rejectFsmRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const fsmUser = await FsmUser.findById(req.params.id);
    if (!fsmUser) {
      return res.status(404).json({ success: false, message: 'FSM user not found' });
    }

    // Rejected FSM ke documents Cloudinary se hata do (storage bachane ke liye)
    const docs = fsmUser.documents || {};
    const deletions = [
      docs.aadharCard?.publicId && cloudinary.uploader.destroy(docs.aadharCard.publicId),
      docs.panCard?.publicId && cloudinary.uploader.destroy(docs.panCard.publicId),
      docs.drivingLicense?.publicId && cloudinary.uploader.destroy(docs.drivingLicense.publicId),
      docs.passportPhoto?.publicId && cloudinary.uploader.destroy(docs.passportPhoto.publicId),
      docs.eirsIdCard?.publicId && cloudinary.uploader.destroy(docs.eirsIdCard.publicId),
      docs.videoClip?.publicId && cloudinary.uploader.destroy(docs.videoClip.publicId, { resource_type: 'video' }),
    ].filter(Boolean);
    await Promise.allSettled(deletions);

    fsmUser.status = 'rejected';
    fsmUser.rejectionReason = reason || 'Not specified';
    fsmUser.reviewedAt = new Date();
    fsmUser.isActive = false;
    await fsmUser.save();

    res.status(200).json({ success: true, message: 'FSM rejected', data: fsmUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================================
// FSM JOB REQUESTS (leads assigned to service men)
// ==========================================================

// @desc    Get all approved FSM technicians (for the "assign to" dropdown)
// @route   GET /api/fsm-admin/technicians
// @access  Private/Admin
exports.getFsmTechnicians = async (req, res) => {
  try {
    const technicians = await FsmUser.find({ status: 'approved' })
      .select('fullName phone email isActive')
      .sort({ fullName: 1 });

    res.status(200).json({ success: true, count: technicians.length, data: technicians });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get website leads that don't have an active FSM job yet (ready to assign)
// @route   GET /api/fsm-admin/assignable-bookings
// @access  Private/Admin
exports.getAssignableBookings = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      const regex = { $regex: String(search).trim(), $options: 'i' };
      filter.$or = [
        { serviceName: regex },
        { customerName: regex },
        { email: regex },
        { phoneNumber: regex },
      ];
    }

    const [bookings, assignedJobs] = await Promise.all([
      WebsiteSourceBooking.find(filter).sort({ createdAt: -1 }).limit(500),
      FsmJob.find({ status: { $ne: 'cancelled' } }).select('bookingId'),
    ]);

    const assignedBookingIds = new Set(assignedJobs.map((job) => String(job.bookingId)));
    const unassignedBookings = bookings.filter((booking) => !assignedBookingIds.has(String(booking._id)));

    res.status(200).json({ success: true, count: unassignedBookings.length, data: unassignedBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign a website lead to a service man (creates an FSM job with "pending" status)
// @route   POST /api/fsm-admin/jobs/assign
// @access  Private/Admin
exports.assignJob = async (req, res) => {
  try {
    const { bookingId, fsmUserId } = req.body;

    if (!bookingId || !fsmUserId) {
      return res.status(400).json({ success: false, message: 'bookingId and fsmUserId are required' });
    }

    const fsmUser = await FsmUser.findById(fsmUserId);
    if (!fsmUser || fsmUser.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Select a valid, approved service man' });
    }

    const existingJob = await FsmJob.findOne({ bookingId: String(bookingId), status: { $ne: 'cancelled' } });
    if (existingJob) {
      return res.status(400).json({ success: false, message: 'This lead is already assigned to a service man' });
    }

    const booking = await WebsiteSourceBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Website booking/lead not found' });
    }

    const job = await FsmJob.create({
      bookingId: String(booking._id),
      serviceName: booking.serviceName || '',
      servicePrice: booking.servicePrice || 0,
      customerName: booking.customerName || '',
      customerEmail: booking.email || '',
      customerPhone: booking.phoneNumber || '',
      address: booking.address || '',
      notes: booking.notes || '',
      preferredDate: booking.preferredDate || null,
      assignedTo: fsmUser._id,
      assignedBy: req.user._id,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: `Lead assigned to ${fsmUser.fullName}. Status: pending`,
      data: job,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all FSM job requests (optionally filter by status / technician)
// @route   GET /api/fsm-admin/jobs?status=pending&fsmUserId=...
// @access  Private/Admin
exports.getAllFsmJobs = async (req, res) => {
  try {
    const { status, fsmUserId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (fsmUserId) filter.assignedTo = fsmUserId;

    const jobs = await FsmJob.find(filter)
      .populate('assignedTo', 'fullName phone email isActive')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single FSM job request in detail
// @route   GET /api/fsm-admin/jobs/:id
// @access  Private/Admin
exports.getFsmJobById = async (req, res) => {
  try {
    const job = await FsmJob.findById(req.params.id)
      .populate('assignedTo', 'fullName phone email isActive')
      .populate('assignedBy', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'FSM job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reassign a job to a different service man (only before work has started)
// @route   PUT /api/fsm-admin/jobs/:id/reassign
// @access  Private/Admin
exports.reassignFsmJob = async (req, res) => {
  try {
    const { fsmUserId } = req.body;
    if (!fsmUserId) {
      return res.status(400).json({ success: false, message: 'fsmUserId is required' });
    }

    const job = await FsmJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'FSM job not found' });
    }

    if (['in_progress', 'completed'].includes(job.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reassign - service man has already started/completed work on this job',
      });
    }

    const fsmUser = await FsmUser.findById(fsmUserId);
    if (!fsmUser || fsmUser.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Select a valid, approved service man' });
    }

    job.assignedTo = fsmUser._id;
    job.assignedBy = req.user._id;
    job.status = 'pending';
    job.acceptedAt = null;
    await job.save();

    res.status(200).json({ success: true, message: `Reassigned to ${fsmUser.fullName}`, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel an FSM job (frees up the lead so it can be assigned again)
// @route   PUT /api/fsm-admin/jobs/:id/cancel
// @access  Private/Admin
exports.cancelFsmJob = async (req, res) => {
  try {
    const job = await FsmJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'FSM job not found' });
    }
    if (job.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed job' });
    }

    job.status = 'cancelled';
    job.cancelReason = req.body.reason || 'Cancelled by admin';
    await job.save();

    res.status(200).json({ success: true, message: 'FSM job cancelled', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
