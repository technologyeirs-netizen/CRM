const express = require('express');
const router = express.Router();
const { protect, requireSuperAdmin } = require('../middleware/auth');
const {
  getModuleRegistry,
  createRole,
  getRoles,
  updateRole,
  deleteRole,
} = require('../controllers/roleController');

router.use(protect);

// Any logged-in team member can read the module registry / role list for
// their own team (needed to render the "hire a sub-user" form). Only Super
// Admin can create/edit/delete roles.
router.get('/modules', getModuleRegistry);
router.get('/', getRoles);
router.post('/', requireSuperAdmin, createRole);
router.put('/:id', requireSuperAdmin, updateRole);
router.delete('/:id', requireSuperAdmin, deleteRole);

module.exports = router;
