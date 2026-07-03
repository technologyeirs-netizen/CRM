const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

SubCategorySchema.index(
  { category: 1, name: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "SubCategory",
  SubCategorySchema
);