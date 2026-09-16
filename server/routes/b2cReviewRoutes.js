const express = require('express');
const router = express.Router();
const { getReviews, deleteReview } = require('../controllers/b2cReviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'b2c'), getReviews);
router.delete('/:id', protect, authorize('admin', 'b2c'), deleteReview);

module.exports = router;
