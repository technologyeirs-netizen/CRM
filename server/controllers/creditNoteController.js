// controllers/creditNoteController.js

const CreditNote = require("../models/CreditNote");
const SalesInvoice = require("../models/SalesInvoice");
const SalesSetting = require("../models/SalesSetting");

// ===============================
// CREATE CREDIT NOTE FROM INVOICE
// ===============================
exports.createFromInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const {
      creditNotePrefix,
      creditNoteNumber,
      creditNoteDate,
      notes,
      termsAndConditions,
    } = req.body;

    const invoice =
      await SalesInvoice.findById(
        invoiceId
      );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const existingCreditNote =
      await CreditNote.findOne({
        salesInvoiceId: invoiceId,
      });

    if (existingCreditNote) {
      return res.status(400).json({
        success: false,
        message:
          "Credit Note already exists for this invoice",
        creditNote:
          existingCreditNote,
      });
    }

    const salesSetting =
      await SalesSetting.findOne();

    if (!salesSetting) {
      return res.status(400).json({
        success: false,
        message:
          "Sales Settings not configured",
      });
    }

    const fullCreditNoteNumber =
      `${creditNotePrefix}${creditNoteNumber}`;

    const existingNumber =
      await CreditNote.findOne({
        fullCreditNoteNumber,
      });

    if (existingNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Credit Note Number already exists",
      });
    }

    let creditNoteStatus =
      "Unpaid";

    if (
      invoice.status === "Unpaid"
    ) {
      creditNoteStatus =
        "Refunded";
    }
    console.log(
  "INVOICE COMPANY =>",
  invoice.company
);
    const creditNote =
      await CreditNote.create({
        // =========================
        // REFERENCES
        // =========================

        salesInvoiceId:
          invoice._id,

        salesInvoiceNumber:
          invoice.fullInvoiceNumber,

        // =========================
        // CREDIT NOTE DETAILS
        // =========================

        creditNotePrefix,

        creditNoteNumber,

        fullCreditNoteNumber,

        creditNoteDate:
          creditNoteDate ||
          new Date(),

        // =========================
        // PARTY SNAPSHOT
        // =========================

        party: invoice.party,

        // =========================
        // ITEMS SNAPSHOT
        // =========================

        items: invoice.items,

        // =========================
        // NOTES
        // =========================

        notes:
          notes ??
          invoice.notes ??
          "",

        termsAndConditions:
          termsAndConditions ??
          salesSetting?.termsAndConditions?.creditNote ??
          [],

        // =========================
        // TOTALS SNAPSHOT
        // =========================

        subtotal:
          invoice.subtotal,

        taxableAmount:
          invoice.taxableAmount,

        totalDiscount:
          invoice.totalDiscount,

        totalTax:
          invoice.totalTax,

        totalAmount:
          invoice.totalAmount,

        // =========================
        // COMPANY SNAPSHOT
        // =========================

        company:
          invoice.company,

        // =========================
        // SIGNATURE SNAPSHOT
        // =========================

        signature:
          invoice.signature,

        status:
          creditNoteStatus,
      });

    await SalesSetting.findByIdAndUpdate(
      salesSetting._id,
      {
        $set: {
          "creditNotePreferences.currentCreditNoteNumber":
            Number(
              creditNoteNumber
            ) + 1,
        },
      }
    );

    return res.status(201).json({
      success: true,
      message:
        "Credit Note created successfully",
      creditNote,
    });
  } catch (error) {
    console.error(
      "CREATE CREDIT NOTE ERROR =>",
      error
    );

    if (error.code === 11000) {
      const field =
        Object.keys(
          error.keyPattern || {}
        )[0];

      return res.status(400).json({
        success: false,
        message: `${field} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error",
    });
  }
};


// ===============================
// GET ALL CREDIT NOTES
// ===============================
exports.getAllCreditNotes = async (req, res) => {
  try {
    const creditNotes = await CreditNote.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: creditNotes.length,
      creditNotes,
    });
  } catch (error) {
    console.error("GET CREDIT NOTES ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ===============================
// GET SINGLE CREDIT NOTE
// ===============================
exports.getCreditNoteById = async (req, res) => {
  try {
    const creditNote = await CreditNote.findById(
      req.params.id
    );

    if (!creditNote) {
      return res.status(404).json({
        success: false,
        message: "Credit Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      creditNote,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// DELETE CREDIT NOTE
// ===============================
exports.deleteCreditNote = async (req, res) => {
  try {
    const { id } = req.params;

    const creditNote = await CreditNote.findById(id);

    if (!creditNote) {
      return res.status(404).json({
        success: false,
        message: "Credit Note not found",
      });
    }

    await CreditNote.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Credit Note deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CREDIT NOTE ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};