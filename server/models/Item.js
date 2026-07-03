const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ["product", "service"],
      default: "product",
    },

    // Product Details
    name: {
      type: String,
      required: true,
      trim: true,
    },

    hsnCode: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      default: null,
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    modelNo: {
      type: String,
      trim: true,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    // Pricing
    salesPrice: {
      type: Number,
      default: 0,
    },

    discountOnSalesPrice: {
      type: Number,
      default: 0,
    },

    // Inventory
    openingStock: {
      type: Number,
      default: 0,
    },

    // Website Publishing
    isLive: {
      type: Boolean,
      default: false,
    },

    liveAt: {
      type: Date,
      default: null,
    },

    websiteProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WebsiteProduct",
      default: null,
    },

    // System
    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ItemSchema.index({
  name: "text",
  brand: "text",
  hsnCode: "text",
});

module.exports = mongoose.model("Item", ItemSchema);