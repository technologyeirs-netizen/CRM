const express = require('express');
const router = express.Router();
const {
  getAllFsmRequests,
  getFsmRequestById,
  approveFsmRequest,
  rejectFsmRequest,
} = require('../controllers/fsmAdminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/requests', protect, authorize('admin'), getAllFsmRequests);
router.get('/requests/:id', protect, authorize('admin'), getFsmRequestById);
router.put('/requests/:id/approve', protect, authorize('admin'), approveFsmRequest);
router.put('/requests/:id/reject', protect, authorize('admin'), rejectFsmRequest);

module.exports = router;
