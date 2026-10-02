const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  addPurchase,
  updatePurchaseStatus,
  getClientStats,
  importClientsFromExcel,
  exportClientsToExcel,
  assignClientLead,
  getAssignableUsers,
} = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');
const { attachPermissions, requirePermission } = require('../middleware/permission');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed (.xlsx, .xls)'));
    }
  },
});

const uploadImportFile = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size must be less than 5MB' });
      }
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(400).json({ success: false, message: error.message });
  });
};

router.use(protect, attachPermissions);

// Stats route MUST come before /:id routes
router.get('/stats', getClientStats);
router.get('/assignable-users', getAssignableUsers);
router.get('/export', authorize('admin', 'sales'), exportClientsToExcel);
router.post('/import', authorize('admin', 'sales'), uploadImportFile, importClientsFromExcel);

router
  .route('/')
  .get(requirePermission('sales-leads', 'view'), getClients)
  .post(requirePermission('sales-leads', 'create'), createClient);

// More specific nested routes MUST come before /:id route
router.post('/:id/purchase', requirePermission('sales-leads', 'edit'), addPurchase);
router.put('/:id/purchase/:purchaseIndex', requirePermission('sales-leads', 'edit'), updatePurchaseStatus);
router.put('/:id/assign', requirePermission('sales-leads', 'assign'), assignClientLead);

// Generic :id route comes last
router
  .route('/:id')
  .get(requirePermission('sales-leads', 'view'), getClientById)
  .put(requirePermission('sales-leads', 'edit'), updateClient)
  .delete(requirePermission('sales-leads', 'delete'), deleteClient);

module.exports = router;
