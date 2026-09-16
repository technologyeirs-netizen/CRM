const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

router.route('/').get(protect, authorize('admin', 'account', 'b2c', 'delivery'), getCategories).post(protect, authorize('admin', 'account', 'b2c', 'delivery'), createCategory);
router.route('/:id').put(protect, authorize('admin', 'account', 'b2c', 'delivery'), updateCategory).delete(protect, authorize('admin', 'account', 'b2c', 'delivery'), deleteCategory);

module.exports = router;