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
  getAllFsmLeaves,
} = require('../controllers/fsmAdminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/requests', protect, authorize('admin', 'service', 'delivery', 'hr'), getAllFsmRequests);
router.get('/requests/:id', protect, authorize('admin', 'service', 'delivery', 'hr'), getFsmRequestById);
router.put('/requests/:id/approve', protect, authorize('admin', 'service', 'delivery', 'hr'), approveFsmRequest);
router.put('/requests/:id/reject', protect, authorize('admin', 'service', 'delivery', 'hr'), rejectFsmRequest);

// ----- FSM job requests (lead assignment to service men) -----
router.get('/technicians', protect, authorize('admin', 'service', 'delivery', 'hr'), getFsmTechnicians);
router.get('/assignable-bookings', protect, authorize('admin', 'service', 'delivery', 'hr'), getAssignableBookings);
router.post('/jobs/assign', protect, authorize('admin', 'service', 'delivery', 'hr'), assignJob);
router.get('/jobs', protect, authorize('admin', 'service', 'delivery', 'hr'), getAllFsmJobs);
router.get('/jobs/:id', protect, authorize('admin', 'service', 'delivery', 'hr'), getFsmJobById);
router.put('/jobs/:id/reassign', protect, authorize('admin', 'service', 'delivery', 'hr'), reassignFsmJob);
router.put('/jobs/:id/cancel', protect, authorize('admin', 'service', 'delivery', 'hr'), cancelFsmJob);

// ----- FSM leave requests -----
router.get('/leaves', protect, authorize('admin', 'service', 'delivery', 'hr'), getAllFsmLeaves);

module.exports = router;
