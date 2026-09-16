const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/b2cServiceController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, authorize('admin', 'b2c'), getServices)
  .post(protect, authorize('admin', 'b2c'), createService);

router
  .route('/:id')
  .get(protect, authorize('admin', 'b2c'), getServiceById)
  .put(protect, authorize('admin', 'b2c'), updateService)
  .delete(protect, authorize('admin', 'b2c'), deleteService);

module.exports = router;
