const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, updateOrderStatus } = require('../controllers/b2cOrderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'b2c'), getOrders);
router.get('/:id', protect, authorize('admin', 'b2c'), getOrderById);
router.put('/:id/status', protect, authorize('admin', 'b2c'), updateOrderStatus);

module.exports = router;
