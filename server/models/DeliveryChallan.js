const mongoose = require("mongoose");

const {
  invoiceItemSchema,
} = require("./SalesInvoice");

const deliveryChallanSchema = new mongoose.Schema(
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

      address: {
        type: String,
        default: "",
      },
    },

    // =========================
    // DELIVERY CHALLAN DETAILS
    // =========================

    deliveryChallanPrefix: {
      type: String,
      required: true,
      trim: true,
    },

    deliveryChallanNumber: {
      type: String,
      required: true,
      trim: true,
    },

    fullDeliveryChallanNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    challanDate: {
      type: Date,
      required: true,
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
    // STATUS
    // =========================

    status: {
      type: String,
      enum: [
        "Open",
        "Delivered",
        "Cancelled",
      ],
      default: "Open",
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

module.exports = mongoose.model(
  "DeliveryChallan",
  deliveryChallanSchema
);