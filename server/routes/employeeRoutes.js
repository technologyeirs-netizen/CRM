const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getMyEmployeeProfile,
  updateMyEmployeeProfile,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, getMyEmployeeProfile);
router.put('/me', protect, updateMyEmployeeProfile);
router.get('/stats', protect, authorize('admin', 'hr'), getEmployeeStats);
router.route('/').get(protect, authorize('admin', 'hr'), getEmployees).post(protect, authorize('admin', 'hr'), createEmployee);
router.route('/:id').put(protect, authorize('admin', 'hr'), updateEmployee).delete(protect, authorize('admin', 'hr'), deleteEmployee);

module.exports = router;
