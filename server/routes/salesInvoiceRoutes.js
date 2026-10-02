const express = require("express");

const router = express.Router();

const {
  createSalesInvoice,
  getAllSalesInvoices,
  getSingleSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
  getRevenueSummary,
} = require("../controllers/salesInvoiceController");
const { protect, authorize } = require("../middleware/auth");
const { attachPermissions, requirePermission } = require("../middleware/permission");

// Needed so req.user is populated - the activity/history log
// records who (which logged-in user) created/edited/deleted
// each invoice. attachPermissions resolves the revenue-scope
// (canViewFullRevenue / dataScope) for this user.
router.use(protect, authorize('admin', 'account'), attachPermissions);


// ============================================
// REVENUE SUMMARY (scoped: full team vs own-only)
// ============================================
router.get(
  "/revenue-summary",
  requirePermission('account-revenue', 'view'),
  getRevenueSummary
);


// ============================================
// CREATE
// ============================================
router.post(
  "/create",
  requirePermission('account-invoices', 'create'),
  createSalesInvoice
);


// ============================================
// GET ALL
// ============================================
router.get(
  "/all",
  requirePermission('account-invoices', 'view'),
  getAllSalesInvoices
);


// ============================================
// GET SINGLE
// ============================================
router.get(
  "/:id",
  requirePermission('account-invoices', 'view'),
  getSingleSalesInvoice
);


// ============================================
// UPDATE
// ============================================
router.put(
  "/:id",
  requirePermission('account-invoices', 'edit'),
  updateSalesInvoice
);


// ============================================
// DELETE
// ============================================
router.delete(
  "/:id",
  requirePermission('account-invoices', 'delete'),
  deleteSalesInvoice
);

module.exports = router;
