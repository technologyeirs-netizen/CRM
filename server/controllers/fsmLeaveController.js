const FsmLeave = require('../models/FsmLeave');
const { startOfDay, endOfDay } = require('../utils/fsmLeaveHelper');

// @desc    Apply for leave (from date -> to date), FSM app se
// @route   POST /api/fsm/leaves
// @access  Private (FSM)
exports.applyLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({ success: false, message: 'fromDate and toDate are required' });
    }

    const from = startOfDay(fromDate);
    const to = endOfDay(toDate);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid fromDate or toDate' });
    }

    if (from > to) {
      return res.status(400).json({ success: false, message: 'fromDate cannot be after toDate' });
    }

    // Aaj se pehle ki leave allow nahi (purani date se leave nahi lagayi ja sakti)
    if (to < startOfDay(new Date())) {
      return res.status(400).json({ success: false, message: 'Cannot apply leave for a past date' });
    }

    // Overlapping active leave already hai to dobara na banaye
    const overlapping = await FsmLeave.findOne({
      fsmUser: req.fsmUser._id,
      status: 'active',
      fromDate: { $lte: to },
      toDate: { $gte: from },
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request that overlaps with these dates',
      });
    }

    const leave = await FsmLeave.create({
      fsmUser: req.fsmUser._id,
      fromDate: from,
      toDate: to,
      reason: reason || '',
    });

    res.status(201).json({ success: true, message: 'Leave request submitted', data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in FSM's own leave requests
// @route   GET /api/fsm/leaves
// @access  Private (FSM)
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await FsmLeave.find({ fsmUser: req.fsmUser._id }).sort({ fromDate: -1 });
    res.status(200).json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel own leave request (before or during the leave period)
// @route   PUT /api/fsm/leaves/:id/cancel
// @access  Private (FSM)
exports.cancelMyLeave = async (req, res) => {
  try {
    const leave = await FsmLeave.findOne({ _id: req.params.id, fsmUser: req.fsmUser._id });
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    if (leave.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Leave request already cancelled' });
    }

    leave.status = 'cancelled';
    leave.cancelledAt = new Date();
    await leave.save();

    res.status(200).json({ success: true, message: 'Leave request cancelled', data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
