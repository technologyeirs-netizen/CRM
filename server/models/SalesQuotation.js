const mongoose = require("mongoose");

// =====================================
// SALES QUOTATION ITEM
// =====================================

const salesQuotationItemSchema = new mongoose.Schema(
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
// SALES QUOTATION
// =====================================
// NOTE ON STOCK:
// Creating / editing a Sales Quotation NEVER touches product stock.
// Stock is only deducted once, when this quotation is converted
// into a Sales Invoice (see salesQuotationController.convertToInvoice).
// =====================================

const salesQuotationSchema = new mongoose.Schema(
  {
    // =====================================
    // QUOTATION DETAILS
    // =====================================

    quotationPrefix: {
      type: String,
      required: true,
      trim: true,
    },

    quotationNumber: {
      type: String,
      required: true,
      trim: true,
    },

    fullQuotationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },

      balance: {
        type: Number,
        default: 0,
      },

      address: {
        type: String,
        default: "",
      },
    },

    // =====================================
    // ITEMS
    // =====================================

    items: {
      type: [salesQuotationItemSchema],
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
    // DISCOUNT / CHARGES
    // =====================================

    globalDiscount: {
      type: Number,
      default: 0,
    },

    totalDiscount: {
      type: Number,
      default: 0,
    },

    additionalCharges: {
      type: Number,
      default: 0,
    },

    // =====================================
    // TAX
    // =====================================

    totalTax: {
      type: Number,
      default: 0,
    },

    // =====================================
    // ROUND OFF
    // =====================================

    autoRoundOff: {
      type: Boolean,
      default: false,
    },

    roundOffDifference: {
      type: Number,
      default: 0,
    },

    // =====================================
    // TOTALS
    // =====================================

    subtotal: {
      type: Number,
      default: 0,
    },

    taxableAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    // =====================================
    // SIGNATURE / BANK / COMPANY SNAPSHOT
    // =====================================

    signature: {
      imageUrl: {
        type: String,
        default: "",
      },
    },

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
    // STATUS / CONVERSION
    // =====================================

    status: {
      type: String,
      enum: ["Open", "Converted"],
      default: "Open",
    },

    // Filled in once this quotation is converted into a Sales Invoice.
    convertedInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesInvoice",
      default: null,
    },

    convertedInvoiceNumber: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

salesQuotationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SalesQuotation", salesQuotationSchema);
