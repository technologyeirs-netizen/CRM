const FsmUser = require('../models/FsmUser');
const cloudinary = require('../config/cloudinary');

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
