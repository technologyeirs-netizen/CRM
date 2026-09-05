const express = require("express");
const router = express.Router();

const {
  createFromInvoice,
  getAllCreditNotes,
  deleteCreditNote,
  getCreditNoteById,
} = require("../controllers/creditNoteController");
const { protect } = require("../middleware/auth");

// Needed so req.user is populated - the activity/history log
// records who (which logged-in user) created/deleted each
// credit note.
router.use(protect);

// Create Credit Note
router.post("/from-invoice/:invoiceId", createFromInvoice);

// Get All
router.get("/", getAllCreditNotes);

// Get Single
router.get("/:id", getCreditNoteById);

// ❌ DELETE ROUTE
router.delete("/:id", deleteCreditNote);

module.exports = router;