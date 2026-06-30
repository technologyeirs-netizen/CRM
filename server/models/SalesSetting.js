const mongoose = require("mongoose");

const salesSettingSchema = new mongoose.Schema(
  {
    // =====================================
    // COMPANY DETAILS
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
      gstin: {
        type: String,
        default: "",
      },
      panNumber: {
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
    // SIGNATURE
    // =====================================
    signature: {
      imageUrl: {
        type: String,
        default: "",
      },
    },

    // =====================================
    // BANK ACCOUNTS
    // =====================================
    bankAccounts: [
      {
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
    ],

    // =====================================
    // TERMS & CONDITIONS
    // =====================================
    termsAndConditions: {
      salesInvoice: {
        type: [String],
        default: [],
      },
      creditNote: {
        type: [String],
        default: [],
      },
      debitNote: {
        type: [String],
        default: [],
      },
      deliveryChallan: {
        type: [String],
        default: [],
      },
      proformaInvoice: {
        type: [String],
        default: [],
      },
      purchaseInvoice: {
        type: [String],
        default: [],
      },
      purchaseReturn: {
        type: [String],
        default: [],
      },
    },

    // =====================================
    // INVOICE PREFERENCES
    // =====================================
    invoicePreferences: {
      invoicePrefix: {
        type: String,
        default: "",
      },

      financialYear: {
        type: String,
        default: "",
      },

      currentInvoiceNumber: {
        type: Number,
        default: 1,
      },

      defaultPaymentTerms: {
        type: Number,
        default: 0,
      },

      defaultPaymentMode: {
        type: String,
        default: "Cash",
      },

      autoRoundOff: {
        type: Boolean,
        default: false,
      },

      defaultTemplate: {
        type: String,
        enum: ["classic", "modern", "minimal"],
        default: "classic",
      },

      defaultBankAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },

      showLogo: {
        type: Boolean,
        default: true,
      },

      showSignature: {
        type: Boolean,
        default: true,
      },

      showBankDetails: {
        type: Boolean,
        default: true,
      },

      showTermsAndConditions: {
        type: Boolean,
        default: true,
      },
    },
    creditNotePreferences: {

      creditNotePrefix: {
        type: String,
        default: "ET/CN/",
      },

      financialYear: {
        type: String,
        default: "",
      },

      currentCreditNoteNumber: {
        type: Number,
        default: 1,
      },

    },
    deliveryChallanPreferences: {

      deliveryChallanPrefix: {
        type: String,
        default: "ET/DC/",
      },

      financialYear: {
        type: String,
        default: "",
      },

      currentDeliveryChallanNumber: {
        type: Number,
        default: 1,
      },

    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SalesSetting", salesSettingSchema);