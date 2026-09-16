const express = require("express");

const router = express.Router();

const {
  createSalesInvoice,
  getAllSalesInvoices,
  getSingleSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
} = require("../controllers/salesInvoiceController");
const { protect, authorize } = require("../middleware/auth");

// Needed so req.user is populated - the activity/history log
// records who (which logged-in user) created/edited/deleted
// each invoice.
router.use(protect, authorize('admin', 'account'));


// ============================================
// CREATE
// ============================================
router.post(
  "/create",
  createSalesInvoice
);


// ============================================
// GET ALL
// ============================================
router.get(
  "/all",
  getAllSalesInvoices
);


// ============================================
// GET SINGLE
// ============================================
router.get(
  "/:id",
  getSingleSalesInvoice
);


// ============================================
// UPDATE
// ============================================
router.put(
  "/:id",
  updateSalesInvoice
);


// ============================================
// DELETE
// ============================================
router.delete(
  "/:id",
  deleteSalesInvoice
);

module.exports = router;