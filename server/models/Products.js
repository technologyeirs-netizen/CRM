// models/WebsiteProduct.js

const mongoose = require('mongoose');

const WebsiteProductSchema = new mongoose.Schema(
{
  productName: String,
  hsn: String,
  category: mongoose.Schema.Types.ObjectId,
  subcategory: String,
  submenu: String,
  channels: String,
  brand: String,
  description: String,
  modelNo: String,
  image: String,
  images: [String],
  price: Number,
  stock: Number,
  isFeatured: Boolean,
  discount: Number
},
{
  timestamps: true
});

module.exports = mongoose.model(
  'WebsiteProduct',
  WebsiteProductSchema,
  'products'
);