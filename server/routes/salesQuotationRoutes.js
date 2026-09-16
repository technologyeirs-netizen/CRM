const express = require("express");
const router = express.Router();

const {
  createSalesQuotation,
  getAllSalesQuotations,
  getSingleSalesQuotation,
  updateSalesQuotation,
  deleteSalesQuotation,
  convertQuotationToInvoice,
} = require("../controllers/salesQuotationController");
const { protect, authorize } = require("../middleware/auth");

// Needed so req.user is populated - the activity/history log
// records who (which logged-in user) created/edited/deleted
// each quotation.
router.use(protect, authorize('admin', 'account'));

// ============================================
// CREATE
// ============================================
router.post("/create", createSalesQuotation);

// ============================================
// GET ALL
// ============================================
router.get("/all", getAllSalesQuotations);

// ============================================
// CONVERT TO INVOICE (deducts stock)
// ============================================
router.post("/:id/convert-to-invoice", convertQuotationToInvoice);

// ============================================
// GET SINGLE
// ============================================
router.get("/:id", getSingleSalesQuotation);

// ============================================
// UPDATE
// ============================================
router.put("/:id", updateSalesQuotation);

// ============================================
// DELETE
// ============================================
router.delete("/:id", deleteSalesQuotation);

module.exports = router;
