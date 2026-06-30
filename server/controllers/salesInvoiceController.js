const SalesInvoice = require("../models/SalesInvoice");
const SalesSetting = require("../models/SalesSetting");
// ============================================
// CREATE SALES INVOICE
// ============================================
exports.createSalesInvoice = async (req, res) => {
try {
console.log("REQ BODY =>", req.body);
const {
  party = {},
  invoiceItems = [],

  invoicePrefix,
  invoiceNumber,
  invoiceDate,
  paymentTerms = 0,
  dueDate,

  notes = "",
  termsAndConditions = [],

  globalDiscount = 0,
  totalDiscount = 0,

  additionalCharges = 0,

  subtotal = 0,
  taxableAmount = 0,
  totalTax = 0,

  applyTCS = false,
  selectedTCS = null,
  tcsAmount = 0,

  autoRoundOff = false,
  roundOffDifference = 0,

  totalAmount = 0,

  amountReceived = 0,
  balanceAmount = 0,

  paymentMode = "Cash",

  status = "Unpaid",

  markAsPaid = false,

  company = {},

  bankDetails = {},

  signature = {},

} = req.body;

const formattedParty = {
  clientId: party?._id || null,

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

const formattedItems = invoiceItems.map((item) => {

  const qty = Number(item.qty || 1);

  const salesPrice = Number(item.salesPrice || 0);

  const purchasePrice = Number(item.purchasePrice || 0);

  const gstTaxRate = Number(item.gstTaxRate || item.tax || 0);

  const discountPercent = Number(item.discountOnSalesPrice || 0);

  const grossAmount = qty * salesPrice;

  const discountAmount =
    (grossAmount * discountPercent) / 100;

  const taxableAmount =
    grossAmount - discountAmount;

  const taxAmount =
    (taxableAmount * gstTaxRate) / 100;

  const finalAmount =
    taxableAmount + taxAmount;

  return {

    itemId:
      item._id ||
      item.itemId ||
      null,

    name: item.name || "",

    itemCode:
      item.itemCode || "",

    hsnCode:
      item.hsnCode ||
      item.hsn ||
      "",

    measuringUnit:
      item.measuringUnit || "",

    qty,

    salesPrice,

    purchasePrice,

    tax: gstTaxRate,

    gstTaxRate,

    discountOnSalesPrice:
      discountPercent,

    grossAmount,

    discountAmount,

    taxableAmount,

    taxAmount,

    finalAmount,

  };

});
const salesSetting =
  await SalesSetting.findOne();

if (!salesSetting) {
  return res.status(400).json({
    success: false,
    message: "Sales Settings not configured.",
  });
}

const preferences =
  salesSetting.invoicePreferences || {};
  
const finalPrefix =
  invoicePrefix ||
  `${preferences.invoicePrefix || ""}${
    preferences.financialYear || ""
  }/`;

const finalNumber =
  invoiceNumber ||
  String(
    preferences.currentInvoiceNumber || 1
  ).padStart(4, "0");

const fullInvoiceNumber =
  `${finalPrefix}${finalNumber}`;

const invoice =
  await SalesInvoice.create({

    party: formattedParty,

    items: formattedItems,

    invoicePrefix: finalPrefix,

    invoiceNumber: finalNumber,

    fullInvoiceNumber,

    invoiceDate,

    paymentTerms,

    dueDate,

    notes,

    termsAndConditions,

    globalDiscount,

    totalDiscount,

    additionalCharges,

    subtotal,

    taxableAmount,

    totalTax,

    applyTCS,

    selectedTCS,

    tcsAmount,

    autoRoundOff,

    roundOffDifference,

    totalAmount,

    amountReceived,

    balanceAmount,

    paymentMode,

    markAsFullyPaid: markAsPaid,

    status,

    pdfUrl: "",

    company: {

      logo:
        company?.logo || "",

      name:
        company?.name || "",

      gstin:
        company?.gstin || "",

      panNumber:
        company?.panNumber || "",

      mobile:
        company?.mobile || "",

      email:
        company?.email || "",

      website:
        company?.website || "",

      businessType:
        company?.businessType || "",

      registrationType:
        company?.registrationType || "",

      address: {

        street:
          company?.address?.street || "",

        city:
          company?.address?.city || "",

        state:
          company?.address?.state || "",

        pincode:
          company?.address?.pincode || "",

        country:
          company?.address?.country || "",

      },

    },

    bankDetails: {

      accountName:
        bankDetails?.accountName || "",

      accountHolder:
        bankDetails?.accountHolder || "",

      accountNumber:
        bankDetails?.accountNumber || "",

      bankName:
        bankDetails?.bankName || "",

      ifsc:
        bankDetails?.ifsc || "",

      branchName:
        bankDetails?.branchName || "",

      upiId:
        bankDetails?.upiId || "",

    },

    signature: {

      imageUrl:
        signature?.imageUrl || "",

    },

  });

console.log(
  "INVOICE SAVED =>",
  invoice
);
const currentNumber = Number(
  preferences.currentInvoiceNumber || 1
);

const savedNumber = Number(finalNumber);

// User entered an older invoice number.
// Don't change settings.
if (savedNumber < currentNumber) {
  // do nothing
}

// User used current invoice number.
// Increment settings.
else if (savedNumber === currentNumber) {

  await SalesSetting.findByIdAndUpdate(
    salesSetting._id,
    {
      $set: {
        "invoicePreferences.currentInvoiceNumber":
          currentNumber + 1,
      },
    }
  );

}

// User entered a future invoice number.
// Move settings ahead by one.
else {

  await SalesSetting.findByIdAndUpdate(
    salesSetting._id,
    {
      $set: {
        "invoicePreferences.currentInvoiceNumber":
          savedNumber + 1,
      },
    }
  );

}
return res.status(201).json({

  success: true,

  message:
    "Sales Invoice Created Successfully",

  invoice,

});

} catch (error) {

  console.log(
    "CREATE INVOICE ERROR =>",
    error
  );

  // Duplicate invoice number
  if (error.code === 11000) {

    const field =
      Object.keys(error.keyPattern || {})[0];

    return res.status(400).json({

      success: false,

      message:
        `${field} already exists.`,

    });

  }

  return res.status(500).json({

    success: false,

    message:
      error.message ||
      "Failed To Create Sales Invoice",

  });

}
};


// ============================================
// GET ALL SALES INVOICES
// ============================================
exports.getAllSalesInvoices = async (req, res) => {
try {
const invoices = await SalesInvoice.find()
.sort({ createdAt: -1 });

const formattedInvoices = invoices.map((invoice) => ({
  _id: invoice._id,

  date: invoice.invoiceDate || null,

  invoiceNumber:
    invoice.fullInvoiceNumber || "",

  partyName:
    invoice.party?.name || "",

  clientId:
    invoice.party?.clientId || null,

  dueIn:
    invoice.dueDate || null,

  amount:
    invoice.totalAmount || 0,

  status:
    invoice.status || "Unpaid",

  paymentMode:
    invoice.paymentMode || "Cash",

  amountReceived:
    invoice.amountReceived || 0,

  balanceAmount:
    invoice.balanceAmount || 0,
}));

return res.status(200).json({
  success: true,
  total: formattedInvoices.length,
  invoices: formattedInvoices,
});

} catch (error) {
console.log("GET SALES INVOICES ERROR =>", error);

return res.status(500).json({
  success: false,
  message: "Failed To Fetch Invoices",
  error: error.message,
});

}
};

// ============================================
// GET SINGLE SALES INVOICE
// ============================================
exports.getSingleSalesInvoice = async (req, res) => {
try {
const invoice = await SalesInvoice.findById(req.params.id);

if (!invoice) {
  return res.status(404).json({
    success: false,
    message: "Invoice Not Found",
  });
}

return res.status(200).json({
  success: true,
  invoice,
});

} catch (error) {
console.log("GET SINGLE SALES INVOICE ERROR =>", error);

return res.status(500).json({
  success: false,
  message: "Failed To Fetch Invoice",
  error: error.message,
});

}
};

// ============================================
// DELETE SALES INVOICE
// ============================================
exports.deleteSalesInvoice = async (req, res) => {
try {
const invoice = await SalesInvoice.findByIdAndDelete(
req.params.id
);
if (!invoice) {
  return res.status(404).json({
    success: false,
    message: "Invoice Not Found",
  });
}

return res.status(200).json({
  success: true,
  message: "Invoice Deleted Successfully",
});

} catch (error) {
console.log("DELETE SALES INVOICE ERROR =>", error);

return res.status(500).json({
  success: false,
  message: "Failed To Delete Invoice",
  error: error.message,
});

}
};

// ============================================
// UPDATE SALES INVOICE
// ============================================
exports.updateSalesInvoice = async (req, res) => {

  try {

    const {

      party = {},

      invoiceItems = [],

      invoicePrefix,

      invoiceNumber,

      invoiceDate,

      paymentTerms,

      dueDate,

      notes,

      termsAndConditions,

      globalDiscount,

      totalDiscount,

      additionalCharges,

      subtotal,

      taxableAmount,

      totalTax,

      applyTCS,

      selectedTCS,

      tcsAmount,

      autoRoundOff,

      roundOffDifference,

      totalAmount,

      amountReceived,

      balanceAmount,

      paymentMode,

      status,

      markAsPaid,

      company,

      bankDetails,

      signature,

    } = req.body;

    const formattedItems = invoiceItems.map(
      (item) => {

        const qty =
          Number(item.qty || 1);

        const salesPrice =
          Number(item.salesPrice || 0);

        const purchasePrice =
          Number(item.purchasePrice || 0);

        const gstTaxRate =
          Number(
            item.gstTaxRate ||
            item.tax ||
            0
          );

        const discountPercent =
          Number(
            item.discountOnSalesPrice ||
            0
          );

        const grossAmount =
          qty * salesPrice;

        const discountAmount =
          (grossAmount *
            discountPercent) /
          100;

        const taxable =
          grossAmount -
          discountAmount;

        const taxAmount =
          (taxable *
            gstTaxRate) /
          100;

        const finalAmount =
          taxable +
          taxAmount;

        return {

          itemId:
            item._id ||
            item.itemId,

          name: item.name,

          itemCode:
            item.itemCode,

          hsnCode:
            item.hsnCode,

          measuringUnit:
            item.measuringUnit,

          qty,

          salesPrice,

          purchasePrice,

          tax: gstTaxRate,

          gstTaxRate,

          discountOnSalesPrice:
            discountPercent,

          grossAmount,

          discountAmount,

          taxableAmount:
            taxable,

          taxAmount,

          finalAmount,

        };

      }
    );

    const invoice =
      await SalesInvoice.findByIdAndUpdate(

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

          items:
            formattedItems,

          invoicePrefix,

          invoiceNumber,

          fullInvoiceNumber:
            `${invoicePrefix}${invoiceNumber}`,

          invoiceDate,

          paymentTerms,

          dueDate,

          notes,

          termsAndConditions,

          globalDiscount,

          totalDiscount,

          additionalCharges,

          subtotal,

          taxableAmount,

          totalTax,

          applyTCS,

          selectedTCS,

          tcsAmount,

          autoRoundOff,

          roundOffDifference,

          totalAmount,

          amountReceived,

          balanceAmount,

          paymentMode,

          status,

          markAsFullyPaid:
            markAsPaid,

          company,

          bankDetails,

          signature,

        },

        {

          new: true,

          runValidators: true,

        }

      );

    return res.json({

      success: true,

      invoice,

    });

  }

  catch (err) {

    console.log(err);

    return res.status(500).json({

      success: false,

      message:
        err.message,

    });

  }

};

