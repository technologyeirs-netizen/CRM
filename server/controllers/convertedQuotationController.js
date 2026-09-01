// controllers/convertedQuotationController.js

const ConvertedQuotation = require("../models/ConvertedQuotation");
const SalesInvoice = require("../models/SalesInvoice");
const SalesSetting = require("../models/SalesSetting");
const { adjustProductStock } = require("../utils/stockHelper");

// ===============================
// CONVERT INVOICE -> QUOTATION
// (this is the step that actually deducts stock)
// ===============================
exports.createFromInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await SalesInvoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const existingQuotation = await ConvertedQuotation.findOne({
      salesInvoiceId: invoiceId,
    });

    if (existingQuotation) {
      return res.status(400).json({
        success: false,
        message: "This invoice has already been converted to a quotation",
        quotation: existingQuotation,
      });
    }

    const salesSetting = await SalesSetting.findOne();

    if (!salesSetting) {
      return res.status(400).json({
        success: false,
        message: "Sales Settings not configured",
      });
    }

    const pref = salesSetting.convertedQuotationPreferences || {};

    const quotationPrefix =
      req.body?.quotationPrefix ||
      `${pref.quotationPrefix || "ET/CQ/"}${pref.financialYear || ""}`;

    const quotationNumber =
      req.body?.quotationNumber ||
      String(pref.currentQuotationNumber || 1).padStart(4, "0");

    const fullQuotationNumber = `${quotationPrefix}${quotationNumber}`;

    const existingNumber = await ConvertedQuotation.findOne({
      fullQuotationNumber,
    });

    if (existingNumber) {
      return res.status(400).json({
        success: false,
        message: "Quotation Number already exists",
      });
    }

    const quotation = await ConvertedQuotation.create({
      // =========================
      // REFERENCES
      // =========================
      salesInvoiceId: invoice._id,
      salesInvoiceNumber: invoice.fullInvoiceNumber,

      // =========================
      // QUOTATION DETAILS
      // =========================
      quotationPrefix,
      quotationNumber,
      fullQuotationNumber,
      quotationDate: req.body?.quotationDate || new Date(),

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
      notes: req.body?.notes ?? invoice.notes ?? "",
      termsAndConditions:
        req.body?.termsAndConditions ??
        salesSetting?.termsAndConditions?.salesInvoice ??
        [],

      // =========================
      // TOTALS SNAPSHOT
      // =========================
      subtotal: invoice.subtotal,
      taxableAmount: invoice.taxableAmount,
      totalDiscount: invoice.totalDiscount,
      totalTax: invoice.totalTax,
      totalAmount: invoice.totalAmount,
      amountReceived: invoice.amountReceived,
      balanceAmount: invoice.balanceAmount,
      roundOffDifference: invoice.roundOffDifference,
      paymentMode: invoice.paymentMode,

      // =========================
      // SIGNATURE / BANK / COMPANY SNAPSHOT
      // =========================
      signature: invoice.signature,
      bankDetails: invoice.bankDetails,
      company: invoice.company,

      status: "Converted",
    });

    // =========================
    // DEDUCT STOCK
    // This is the only place a sales-invoice-related flow
    // reduces product quantity.
    // =========================
    await adjustProductStock(invoice.items, -1);

    await SalesSetting.findByIdAndUpdate(salesSetting._id, {
      $set: {
        "convertedQuotationPreferences.currentQuotationNumber":
          Number(quotationNumber) + 1,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Invoice converted to Quotation successfully",
      quotation,
    });
  } catch (error) {
    console.error("CONVERT INVOICE TO QUOTATION ERROR =>", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];

      return res.status(400).json({
        success: false,
        message: `${field} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ===============================
// GET ALL CONVERTED QUOTATIONS
// ===============================
exports.getAllConvertedQuotations = async (req, res) => {
  try {
    const quotations = await ConvertedQuotation.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: quotations.length,
      quotations,
    });
  } catch (error) {
    console.error("GET CONVERTED QUOTATIONS ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// ===============================
// GET SINGLE CONVERTED QUOTATION
// ===============================
exports.getConvertedQuotationById = async (req, res) => {
  try {
    const quotation = await ConvertedQuotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Converted Quotation not found",
      });
    }

    return res.status(200).json({
      success: true,
      quotation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// DELETE CONVERTED QUOTATION
// (restores the stock that was deducted on conversion)
// ===============================
exports.deleteConvertedQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    const quotation = await ConvertedQuotation.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Converted Quotation not found",
      });
    }

    // Restore stock since this conversion is being undone
    await adjustProductStock(quotation.items, 1);

    await ConvertedQuotation.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Converted Quotation deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CONVERTED QUOTATION ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
