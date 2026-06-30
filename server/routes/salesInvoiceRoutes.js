const express = require("express");

const router = express.Router();

const {
  createSalesInvoice,
  getAllSalesInvoices,
  getSingleSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
} = require("../controllers/salesInvoiceController");


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