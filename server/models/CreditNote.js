const mongoose = require("mongoose");

// =====================================
// CREDIT NOTE ITEM
// =====================================

const creditNoteItemSchema = new mongoose.Schema(
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
// CREDIT NOTE
// =====================================

const creditNoteSchema = new mongoose.Schema(
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
// CREDIT NOTE DETAILS
// =====================================

creditNotePrefix: {
  type: String,
  required: true,
},

creditNoteNumber: {
  type: String,
  required: true,
},

fullCreditNoteNumber: {
  type: String,
  required: true,
  unique: true,
},

creditNoteDate: {
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
  type: [creditNoteItemSchema],
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
  enum: ["Refunded", "Unpaid"],
  default: "Unpaid",
},

},
{
timestamps: true,
}
);

module.exports = mongoose.model(
"CreditNote",
creditNoteSchema
);
