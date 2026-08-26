const express = require('express');
const router = express.Router();
const { getBookings, updateBookingStatus } = require('../controllers/b2cServiceBookingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getBookings);
router.put('/:id/status', protect, authorize('admin'), updateBookingStatus);

module.exports = router;
