const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, authorize('admin', 'account', 'b2c', 'delivery'), getProducts)
  .post(protect, authorize('admin', 'account', 'b2c', 'delivery'), createProduct);

router
  .route('/:id')
  .get(protect, authorize('admin', 'account', 'b2c', 'delivery'), getProductById)
  .put(protect, authorize('admin', 'account', 'b2c', 'delivery'), updateProduct)
  .delete(protect, authorize('admin', 'account', 'b2c', 'delivery'), deleteProduct);

module.exports = router;
