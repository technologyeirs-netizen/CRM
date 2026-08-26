const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, updateOrderStatus } = require('../controllers/b2cOrderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getOrders);
router.get('/:id', protect, authorize('admin'), getOrderById);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
