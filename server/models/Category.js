const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ['product', 'service'],
      default: 'product', // required hata diya
      index: true,
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

// Website aur CRM dono compatible
CategorySchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);