const express = require('express');
const router = express.Router();
const { protect, requireSuperAdmin } = require('../middleware/auth');
const {
  createTeamUser,
  getUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  updateUserStatus,
  deleteUser,
} = require('../controllers/userManagementController');

router.use(protect);

router.get('/pending', requireSuperAdmin, getPendingUsers);
router.put('/:id/approve', requireSuperAdmin, approveUser);
router.put('/:id/reject', requireSuperAdmin, rejectUser);
router.put('/:id/status', requireSuperAdmin, updateUserStatus);
router.delete('/:id', requireSuperAdmin, deleteUser);

router.get('/', getUsers);
router.post('/', createTeamUser);

module.exports = router;
