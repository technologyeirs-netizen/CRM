const express = require("express");
const router = express.Router();

const {
  createFromInvoice,
  getAllConvertedQuotations,
  getConvertedQuotationById,
  deleteConvertedQuotation,
} = require("../controllers/convertedQuotationController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize('admin', 'account'));

// Convert an invoice into a quotation (deducts stock)
router.post("/from-invoice/:invoiceId", createFromInvoice);

// Get All
router.get("/", getAllConvertedQuotations);

// Get Single
router.get("/:id", getConvertedQuotationById);

// Delete (restores stock)
router.delete("/:id", deleteConvertedQuotation);

module.exports = router;
