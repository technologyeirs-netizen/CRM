const express = require("express");
const router = express.Router();

const {
  createFromInvoice,
  getAllCreditNotes,
  deleteCreditNote,
  getCreditNoteById,
} = require("../controllers/creditNoteController");

// Create Credit Note
router.post("/from-invoice/:invoiceId", createFromInvoice);

// Get All
router.get("/", getAllCreditNotes);

// Get Single
router.get("/:id", getCreditNoteById);

// ❌ DELETE ROUTE
router.delete("/:id", deleteCreditNote);

module.exports = router;