const SalesQuotation = require("../models/SalesQuotation");
const SalesInvoice = require("../models/SalesInvoice");
const SalesSetting = require("../models/SalesSetting");
const { logActivity } = require("../utils/activityLogger");
const { adjustProductStock } = require("../utils/stockHelper");

// Fields whose changes are worth showing in the audit history
// when a quotation is edited.
const QUOTATION_TRACKED_FIELDS = [
  "party.name",
  "fullQuotationNumber",
  "quotationDate",
  "notes",
  "items",
  "globalDiscount",
  "totalDiscount",
  "totalTax",
  "subtotal",
  "totalAmount",
  "status",
];

// ============================================
// NOTE ON STOCK:
// Creating, editing or deleting a Sales Quotation NEVER touches
// product stock. Stock is only deducted once, when the quotation
// is converted into a Sales Invoice (see convertQuotationToInvoice
// below) - that is the only place this module reduces item quantity.
// ============================================

const buildFormattedItems = (quotationItems = []) =>
  quotationItems.map((item) => {
    const qty = Number(item.qty || 1);
    const salesPrice = Number(item.salesPrice || 0);
    const purchasePrice = Number(item.purchasePrice || 0);
    const gstTaxRate = Number(item.gstTaxRate || item.tax || 0);
    const discountPercent = Number(item.discountOnSalesPrice || 0);

    const grossAmount = qty * salesPrice;
    const discountAmount = (grossAmount * discountPercent) / 100;
    const taxableAmount = grossAmount - discountAmount;
    const taxAmount = (taxableAmount * gstTaxRate) / 100;
    const finalAmount = taxableAmount + taxAmount;

    return {
      itemId: item._id || item.itemId || null,
      name: item.name || "",
      itemCode: item.itemCode || "",
      hsnCode: item.hsnCode || item.hsn || "",
      measuringUnit: item.measuringUnit || "",
      qty,
      salesPrice,
      purchasePrice,
      tax: gstTaxRate,
      gstTaxRate,
      discountOnSalesPrice: discountPercent,
      grossAmount,
      discountAmount,
      taxableAmount,
      taxAmount,
      finalAmount,
    };
  });

// ============================================
// CREATE SALES QUOTATION
// ============================================
exports.createSalesQuotation = async (req, res) => {
  try {
    const {
      party = {},
      quotationItems = [],

      quotationPrefix,
      quotationNumber,
      quotationDate,

      notes = "",
      termsAndConditions = [],

      globalDiscount = 0,
      totalDiscount = 0,

      additionalCharges = 0,

      subtotal = 0,
      taxableAmount = 0,
      totalTax = 0,

      autoRoundOff = false,
      roundOffDifference = 0,

      totalAmount = 0,

      company = {},
      bankDetails = {},
      signature = {},
    } = req.body;

    const formattedParty = {
      clientId: party?._id || party?.clientId || null,
      name:
        party?.name ||
        `${party?.firstName || ""} ${party?.lastName || ""}`.trim(),
      phone: party?.phone || "",
      email: party?.email || "",
      balance: Number(party?.balance || 0),
      address:
        typeof party?.address === "string"
          ? party.address
          : party?.address?.street || "",
    };

    const formattedItems = buildFormattedItems(quotationItems);

    const salesSetting = await SalesSetting.findOne();

    if (!salesSetting) {
      return res.status(400).json({
        success: false,
        message: "Sales Settings not configured.",
      });
    }

    const preferences = salesSetting.quotationPreferences || {};

    const finalPrefix =
      quotationPrefix ||
      `${preferences.quotationPrefix || "ET/QT/"}${
        preferences.financialYear || ""
      }/`;

    const finalNumber =
      quotationNumber ||
      String(preferences.currentQuotationNumber || 1).padStart(4, "0");

    const fullQuotationNumber = `${finalPrefix}${finalNumber}`;

    const quotation = await SalesQuotation.create({
      party: formattedParty,
      items: formattedItems,

      quotationPrefix: finalPrefix,
      quotationNumber: finalNumber,
      fullQuotationNumber,
      quotationDate: quotationDate || new Date(),

      notes,
      termsAndConditions,

      globalDiscount,
      totalDiscount,
      additionalCharges,

      subtotal,
      taxableAmount,
      totalTax,

      autoRoundOff,
      roundOffDifference,

      totalAmount,

      status: "Open",

      company: {
        logo: company?.logo || "",
        name: company?.name || "",
        gstin: company?.gstin || "",
        panNumber: company?.panNumber || "",
        mobile: company?.mobile || "",
        email: company?.email || "",
        website: company?.website || "",
        businessType: company?.businessType || "",
        registrationType: company?.registrationType || "",
        address: {
          street: company?.address?.street || "",
          city: company?.address?.city || "",
          state: company?.address?.state || "",
          pincode: company?.address?.pincode || "",
          country: company?.address?.country || "",
        },
      },

      bankDetails: {
        accountName: bankDetails?.accountName || "",
        accountHolder: bankDetails?.accountHolder || "",
        accountNumber: bankDetails?.accountNumber || "",
        bankName: bankDetails?.bankName || "",
        ifsc: bankDetails?.ifsc || "",
        branchName: bankDetails?.branchName || "",
        upiId: bankDetails?.upiId || "",
      },

      signature: {
        imageUrl: signature?.imageUrl || "",
      },
    });

    logActivity({
      req,
      documentType: "Quotation",
      documentId: quotation._id,
      documentNumber: quotation.fullQuotationNumber,
      partyName: quotation.party?.name || "",
      action: "Create",
    });

    // NOTE: Stock is intentionally NOT touched here.
    // It is only deducted when this quotation is converted to an invoice.

    const currentNumber = Number(preferences.currentQuotationNumber || 1);
    const savedNumber = Number(finalNumber);

    if (savedNumber < currentNumber) {
      // User entered an older quotation number. Don't change settings.
    } else if (savedNumber === currentNumber) {
      await SalesSetting.findByIdAndUpdate(salesSetting._id, {
        $set: {
          "quotationPreferences.currentQuotationNumber": currentNumber + 1,
        },
      });
    } else {
      await SalesSetting.findByIdAndUpdate(salesSetting._id, {
        $set: {
          "quotationPreferences.currentQuotationNumber": savedNumber + 1,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Sales Quotation Created Successfully",
      quotation,
    });
  } catch (error) {
    console.log("CREATE SALES QUOTATION ERROR =>", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed To Create Sales Quotation",
    });
  }
};

// ============================================
// GET ALL SALES QUOTATIONS
// ============================================
exports.getAllSalesQuotations = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.clientId) filter["party.clientId"] = req.query.clientId;
    if (req.query.status) filter.status = req.query.status;

    const [quotations, total] = await Promise.all([
      SalesQuotation.find(filter)
        .select(
          "quotationDate fullQuotationNumber party.name party.clientId totalAmount status convertedInvoiceNumber createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SalesQuotation.countDocuments(filter),
    ]);

    const formattedQuotations = quotations.map((q) => ({
      _id: q._id,
      date: q.quotationDate || null,
      quotationNumber: q.fullQuotationNumber || "",
      partyName: q.party?.name || "",
      clientId: q.party?.clientId || null,
      amount: q.totalAmount || 0,
      status: q.status || "Open",
      convertedInvoiceNumber: q.convertedInvoiceNumber || "",
    }));

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      quotations: formattedQuotations,
    });
  } catch (error) {
    console.log("GET SALES QUOTATIONS ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: "Failed To Fetch Sales Quotations",
      error: error.message,
    });
  }
};

// ============================================
// GET SINGLE SALES QUOTATION
// ============================================
exports.getSingleSalesQuotation = async (req, res) => {
  try {
    const quotation = await SalesQuotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      quotation,
    });
  } catch (error) {
    console.log("GET SINGLE SALES QUOTATION ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: "Failed To Fetch Quotation",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE SALES QUOTATION
// (only allowed while the quotation is still "Open")
// ============================================
exports.updateSalesQuotation = async (req, res) => {
  try {
    const oldQuotation = await SalesQuotation.findById(req.params.id);

    if (!oldQuotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation Not Found",
      });
    }

    if (oldQuotation.status === "Converted") {
      return res.status(400).json({
        success: false,
        message:
          "This quotation has already been converted to an invoice and can no longer be edited.",
      });
    }

    const {
      party = {},
      quotationItems = [],

      quotationPrefix,
      quotationNumber,
      quotationDate,

      notes,
      termsAndConditions,

      globalDiscount,
      totalDiscount,
      additionalCharges,

      subtotal,
      taxableAmount,
      totalTax,

      autoRoundOff,
      roundOffDifference,

      totalAmount,

      company,
      bankDetails,
      signature,
    } = req.body;

    const formattedItems = buildFormattedItems(quotationItems);

    const quotation = await SalesQuotation.findByIdAndUpdate(
      req.params.id,
      {
        party: {
          clientId: party?._id || party?.clientId,
          name: party?.name,
          phone: party?.phone,
          email: party?.email,
          balance: party?.balance,
          address:
            typeof party?.address === "string"
              ? party.address
              : party?.address?.street || "",
        },

        items: formattedItems,

        quotationPrefix,
        quotationNumber,
        fullQuotationNumber: `${quotationPrefix}${quotationNumber}`,
        quotationDate,

        notes,
        termsAndConditions,

        globalDiscount,
        totalDiscount,
        additionalCharges,

        subtotal,
        taxableAmount,
        totalTax,

        autoRoundOff,
        roundOffDifference,

        totalAmount,

        company,
        bankDetails,
        signature,
      },
      { new: true, runValidators: true }
    );

    // NOTE: Editing a quotation's items does not touch stock.
    // Stock only changes when the quotation is converted to an invoice.

    logActivity({
      req,
      documentType: "Quotation",
      documentId: quotation._id,
      documentNumber: quotation.fullQuotationNumber,
      partyName: quotation.party?.name || "",
      action: "Edited",
      before: oldQuotation.toObject(),
      after: quotation.toObject(),
      trackedFields: QUOTATION_TRACKED_FIELDS,
    });

    return res.status(200).json({
      success: true,
      quotation,
    });
  } catch (error) {
    console.log("UPDATE SALES QUOTATION ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed To Update Quotation",
    });
  }
};

// ============================================
// DELETE SALES QUOTATION
// (a quotation never held any stock, so deleting one never
// needs to restore stock - only a converted invoice would)
// ============================================
exports.deleteSalesQuotation = async (req, res) => {
  try {
    const quotation = await SalesQuotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation Not Found",
      });
    }

    if (quotation.status === "Converted") {
      return res.status(400).json({
        success: false,
        message:
          "This quotation has already been converted to an invoice and cannot be deleted.",
      });
    }

    await SalesQuotation.findByIdAndDelete(req.params.id);

    logActivity({
      req,
      documentType: "Quotation",
      documentId: quotation._id,
      documentNumber: quotation.fullQuotationNumber,
      partyName: quotation.party?.name || "",
      action: "Delete",
    });

    return res.status(200).json({
      success: true,
      message: "Quotation Deleted Successfully",
    });
  } catch (error) {
    console.log("DELETE SALES QUOTATION ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: "Failed To Delete Quotation",
      error: error.message,
    });
  }
};

// ============================================
// CONVERT QUOTATION -> SALES INVOICE
// This is the ONLY place a Sales Quotation flow reduces
// product stock: the moment it becomes a real invoice.
// ============================================
exports.convertQuotationToInvoice = async (req, res) => {
  try {
    const quotation = await SalesQuotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation Not Found",
      });
    }

    if (quotation.status === "Converted") {
      return res.status(400).json({
        success: false,
        message: "This quotation has already been converted to an invoice",
        invoiceId: quotation.convertedInvoiceId,
      });
    }

    const salesSetting = await SalesSetting.findOne();

    if (!salesSetting) {
      return res.status(400).json({
        success: false,
        message: "Sales Settings not configured.",
      });
    }

    const preferences = salesSetting.invoicePreferences || {};

    const finalPrefix =
      req.body?.invoicePrefix ||
      `${preferences.invoicePrefix || ""}${preferences.financialYear || ""}/`;

    const finalNumber =
      req.body?.invoiceNumber ||
      String(preferences.currentInvoiceNumber || 1).padStart(4, "0");

    const fullInvoiceNumber = `${finalPrefix}${finalNumber}`;

    const invoice = await SalesInvoice.create({
      party: quotation.party,
      items: quotation.items,

      invoicePrefix: finalPrefix,
      invoiceNumber: finalNumber,
      fullInvoiceNumber,
      invoiceDate: req.body?.invoiceDate || new Date(),

      paymentTerms: preferences.defaultPaymentTerms || 0,

      notes: quotation.notes,
      termsAndConditions:
        salesSetting?.termsAndConditions?.salesInvoice || [],

      globalDiscount: quotation.globalDiscount,
      totalDiscount: quotation.totalDiscount,
      additionalCharges: quotation.additionalCharges,

      subtotal: quotation.subtotal,
      taxableAmount: quotation.taxableAmount,
      totalTax: quotation.totalTax,

      autoRoundOff: quotation.autoRoundOff,
      roundOffDifference: quotation.roundOffDifference,

      totalAmount: quotation.totalAmount,

      amountReceived: 0,
      balanceAmount: quotation.totalAmount,

      paymentMode: preferences.defaultPaymentMode || "Cash",

      status: "Unpaid",

      company: quotation.company,
      bankDetails: quotation.bankDetails,
      signature: quotation.signature,
    });

    // =========================
    // DEDUCT STOCK
    // This is the only place a sales-quotation-related flow
    // reduces product quantity.
    // =========================
    await adjustProductStock(quotation.items, -1);

    quotation.status = "Converted";
    quotation.convertedInvoiceId = invoice._id;
    quotation.convertedInvoiceNumber = invoice.fullInvoiceNumber;
    await quotation.save();

    const currentNumber = Number(preferences.currentInvoiceNumber || 1);
    const savedNumber = Number(finalNumber);

    if (savedNumber >= currentNumber) {
      await SalesSetting.findByIdAndUpdate(salesSetting._id, {
        $set: {
          "invoicePreferences.currentInvoiceNumber": savedNumber + 1,
        },
      });
    }

    logActivity({
      req,
      documentType: "Invoice",
      documentId: invoice._id,
      documentNumber: invoice.fullInvoiceNumber,
      partyName: invoice.party?.name || "",
      action: "Create",
    });

    return res.status(201).json({
      success: true,
      message: "Quotation converted to Sales Invoice successfully",
      invoice,
      quotation,
    });
  } catch (error) {
    console.log("CONVERT QUOTATION TO INVOICE ERROR =>", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed To Convert Quotation To Invoice",
    });
  }
};
