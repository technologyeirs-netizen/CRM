const express = require('express');
const router = express.Router();
const {
  getAllFsmRequests,
  getFsmRequestById,
  approveFsmRequest,
  rejectFsmRequest,
  getFsmTechnicians,
  getAssignableBookings,
  assignJob,
  getAllFsmJobs,
  getFsmJobById,
  reassignFsmJob,
  cancelFsmJob,
} = require('../controllers/fsmAdminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/requests', protect, authorize('admin'), getAllFsmRequests);
router.get('/requests/:id', protect, authorize('admin'), getFsmRequestById);
router.put('/requests/:id/approve', protect, authorize('admin'), approveFsmRequest);
router.put('/requests/:id/reject', protect, authorize('admin'), rejectFsmRequest);

// ----- FSM job requests (lead assignment to service men) -----
router.get('/technicians', protect, authorize('admin'), getFsmTechnicians);
router.get('/assignable-bookings', protect, authorize('admin'), getAssignableBookings);
router.post('/jobs/assign', protect, authorize('admin'), assignJob);
router.get('/jobs', protect, authorize('admin'), getAllFsmJobs);
router.get('/jobs/:id', protect, authorize('admin'), getFsmJobById);
router.put('/jobs/:id/reassign', protect, authorize('admin'), reassignFsmJob);
router.put('/jobs/:id/cancel', protect, authorize('admin'), cancelFsmJob);

module.exports = router;
