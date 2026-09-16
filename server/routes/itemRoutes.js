const express = require('express');
const router = express.Router();
const { getItems, createItem, updateItem, deleteItem, getItemStats, liveProduct } = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin', 'account', 'b2c', 'delivery'), getItemStats);

router.post(
  '/:id/live',
  protect,
  authorize('admin', 'account', 'b2c', 'delivery'),
  liveProduct
);

router.route('/')
  .get(protect, authorize('admin', 'account', 'b2c', 'delivery'), getItems)
  .post(protect, authorize('admin', 'account', 'b2c', 'delivery'), createItem);

router.route('/:id')
  .put(protect, authorize('admin', 'account', 'b2c', 'delivery'), updateItem)
  .delete(protect, authorize('admin', 'account', 'b2c', 'delivery'), deleteItem);

module.exports = router;