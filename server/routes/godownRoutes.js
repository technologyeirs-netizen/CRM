const express = require('express');
const router = express.Router();
const { getGodowns, createGodown, updateGodown, deleteGodown } = require('../controllers/godownController');
const { protect, authorize } = require('../middleware/auth');

router.route('/').get(protect, authorize('admin', 'account', 'b2c', 'delivery'), getGodowns).post(protect, authorize('admin', 'account', 'b2c', 'delivery'), createGodown);
router.route('/:id').put(protect, authorize('admin', 'account', 'b2c', 'delivery'), updateGodown).delete(protect, authorize('admin', 'account', 'b2c', 'delivery'), deleteGodown);

module.exports = router;