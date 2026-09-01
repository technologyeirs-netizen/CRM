const mongoose = require("mongoose");

// =====================================
// CONVERTED QUOTATION ITEM
// =====================================

const convertedQuotationItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WebsiteProduct",
    },

    name: {
      type: String,
      required: true,
    },

    itemCode: {
      type: String,
      default: "",
    },

    hsnCode: {
      type: String,
      default: "",
    },

    measuringUnit: {
      type: String,
      default: "",
    },

    qty: {
      type: Number,
      default: 0,
    },

    salesPrice: {
      type: Number,
      default: 0,
    },

    purchasePrice: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    gstTaxRate: {
      type: Number,
      default: 0,
    },

    discountOnSalesPrice: {
      type: Number,
      default: 0,
    },

    grossAmount: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    taxableAmount: {
      type: Number,
      default: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    finalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

// =====================================
// CONVERTED QUOTATION
// =====================================

const convertedQuotationSchema = new mongoose.Schema(
  {
    // =====================================
    // SALES INVOICE REFERENCE
    // =====================================

    salesInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesInvoice",
      required: true,
    },

    salesInvoiceNumber: {
      type: String,
      default: "",
    },

    // =====================================
    // QUOTATION DETAILS
    // =====================================

    quotationPrefix: {
      type: String,
      required: true,
    },

    quotationNumber: {
      type: String,
      required: true,
    },

    fullQuotationNumber: {
      type: String,
      required: true,
      unique: true,
    },

    quotationDate: {
      type: Date,
      default: Date.now,
    },

    // =====================================
    // PARTY SNAPSHOT
    // =====================================

    party: {
      clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },

      name: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },

      address: {
        type: String,
        default: "",
      },
    },

    // =====================================
    // ITEMS SNAPSHOT
    // =====================================

    items: {
      type: [convertedQuotationItemSchema],
      default: [],
    },

    // =====================================
    // NOTES
    // =====================================

    notes: {
      type: String,
      default: "",
    },

    termsAndConditions: {
      type: [String],
      default: [],
    },

    // =====================================
    // TOTALS SNAPSHOT
    // =====================================

    subtotal: {
      type: Number,
      default: 0,
    },

    taxableAmount: {
      type: Number,
      default: 0,
    },

    totalDiscount: {
      type: Number,
      default: 0,
    },

    totalTax: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    amountReceived: {
      type: Number,
      default: 0,
    },

    balanceAmount: {
      type: Number,
      default: 0,
    },

    roundOffDifference: {
      type: Number,
      default: 0,
    },

    paymentMode: {
      type: String,
      default: "Cash",
    },

    // =====================================
    // SIGNATURE
    // =====================================

    signature: {
      imageUrl: {
        type: String,
        default: "",
      },
    },

    // =====================================
    // BANK DETAILS SNAPSHOT
    // =====================================

    bankDetails: {
      accountName: {
        type: String,
        default: "",
      },

      accountHolder: {
        type: String,
        default: "",
      },

      accountNumber: {
        type: String,
        default: "",
      },

      bankName: {
        type: String,
        default: "",
      },

      ifsc: {
        type: String,
        default: "",
      },

      branchName: {
        type: String,
        default: "",
      },

      upiId: {
        type: String,
        default: "",
      },
    },

    // =====================================
    // COMPANY SNAPSHOT
    // =====================================

    company: {
      logo: {
        type: String,
        default: "",
      },

      name: {
        type: String,
        default: "",
      },

      gstin: {
        type: String,
        default: "",
      },

      panNumber: {
        type: String,
        default: "",
      },

      mobile: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },

      website: {
        type: String,
        default: "",
      },

      businessType: {
        type: String,
        default: "",
      },

      registrationType: {
        type: String,
        default: "",
      },

      address: {
        street: {
          type: String,
          default: "",
        },

        city: {
          type: String,
          default: "",
        },

        state: {
          type: String,
          default: "",
        },

        pincode: {
          type: String,
          default: "",
        },

        country: {
          type: String,
          default: "",
        },
      },
    },

    // =====================================
    // STATUS
    // =====================================

    status: {
      type: String,
      enum: ["Converted"],
      default: "Converted",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ConvertedQuotation",
  convertedQuotationSchema
);
