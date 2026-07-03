const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
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
      required: true,
      default: 1,
    },

    salesPrice: {
      type: Number,
      required: true,
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

const salesInvoiceSchema = new mongoose.Schema(
  {
    // =========================
    // PARTY
    // =========================
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

      // FIXED ADDRESS FIELD
      // NOW ACCEPTS STRING
      address: {
        type: String,
        default: "",
      },
    },

    // =========================
    // INVOICE DETAILS
    // =========================
    invoicePrefix: {
      type: String,
      required: true,
      trim: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },

    fullInvoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    invoiceDate: {
      type: Date,
      required: true,
    },

    paymentTerms: {
      type: Number,
      default: 0,
    },

    dueDate: {
      type: Date,
    },

    // =========================
    // ITEMS
    // =========================
    items: {
      type: [invoiceItemSchema],
      default: [],
    },

    // =========================
    // NOTES
    // =========================
    notes: {
      type: String,
      default: "",
    },

    termsAndConditions: {
      type: [String],
      default: [],
    },

    // =========================
    // DISCOUNT
    // =========================
    globalDiscount: {
      type: Number,
      default: 0,
    },

    totalDiscount: {
      type: Number,
      default: 0,
    },

    // =========================
    // ADDITIONAL CHARGES
    // =========================
    additionalCharges: {
      type: Number,
      default: 0,
    },

    // =========================
    // TAX
    // =========================
    totalTax: {
      type: Number,
      default: 0,
    },

    // =========================
    // TCS
    // =========================
    applyTCS: {
      type: Boolean,
      default: false,
    },

    selectedTCS: {
      label: {
        type: String,
        default: "",
      },

      rate: {
        type: Number,
        default: 0,
      },
    },

    tcsAmount: {
      type: Number,
      default: 0,
    },

    // =========================
    // ROUND OFF
    // =========================
    autoRoundOff: {
      type: Boolean,
      default: false,
    },

    roundOffDifference: {
      type: Number,
      default: 0,
    },

    // =========================
    // TOTALS
    // =========================
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

    // =========================
    // PAYMENT
    // =========================
    amountReceived: {
      type: Number,
      default: 0,
    },

    balanceAmount: {
      type: Number,
      default: 0,
    },

    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Cheque", "Bank Transfer"],
      default: "Cash",
    },

    markAsFullyPaid: {
      type: Boolean,
      default: false,
    },

    // =========================
    // STATUS
    // =========================
    status: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid",
    },

    // =========================
    // PDF
    // =========================
    pdfUrl: {
      type: String,
      default: "",
    },
    // =========================
    // SIGNATURE
    // =========================
    signature: {
      imageUrl: {
        type: String,
        default: "",
      },
    },

    // =========================
    // BANK DETAILS
    // =========================
    bankDetails: {

      bankId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },

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

    // =========================
    // COMPANY
    // =========================
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
  },
  {
    timestamps: true,
  }
);


const SalesInvoice = mongoose.model(
  "SalesInvoice",
  salesInvoiceSchema
);

module.exports = SalesInvoice;
module.exports.invoiceItemSchema = invoiceItemSchema;