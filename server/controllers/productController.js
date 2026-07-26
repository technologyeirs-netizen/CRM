// Product controller (CRM) — talks directly to the SAME "products" collection
// that the website backend (web-server) uses. No separate CRM-only product
// model, no "go live" step: whatever is created/updated/deleted here shows up
// on the website immediately, and vice versa — exactly like Category works.
const mongoose = require('mongoose');
const WebsiteProduct = require('../models/Products'); // maps to the shared "products" collection

exports.getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 500 } = req.query;

    const query = {};

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { modelNo: { $regex: search, $options: 'i' } },
        { hsn: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await WebsiteProduct.countDocuments(query);

    const products = await WebsiteProduct.find(query)
      .populate({ path: 'category', model: 'Category', select: 'name' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await WebsiteProduct.findById(req.params.id).populate({
      path: 'category',
      model: 'Category',
      select: 'name',
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = req.body;

    if (!data.productName || !String(data.productName).trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    if (!data.category || !mongoose.Types.ObjectId.isValid(data.category)) {
      return res.status(400).json({ success: false, message: 'A valid category is required' });
    }

    const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];

    const product = await WebsiteProduct.create({
      productName: String(data.productName).trim(),
      hsn: data.hsn || '',
      category: data.category,
      subcategory: data.subcategory || '',
      submenu: data.submenu || '',
      channels: data.channels || '',
      brand: data.brand || '',
      description: data.description || '',
      modelNo: data.modelNo || '',
      images,
      image: images[0] || '',
      price: Number(data.price) || 0,
      stock: Number(data.stock) || 0,
      discount: Number(data.discount) || 0,
      isFeatured: Boolean(data.isFeatured),
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const data = req.body;

    if (data.category && !mongoose.Types.ObjectId.isValid(data.category)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID sent' });
    }

    const images = Array.isArray(data.images) ? data.images.filter(Boolean) : undefined;

    const updatePayload = {
      productName: data.productName,
      hsn: data.hsn,
      category: data.category,
      subcategory: data.subcategory,
      submenu: data.submenu,
      channels: data.channels,
      brand: data.brand,
      description: data.description,
      modelNo: data.modelNo,
      price: data.price !== undefined ? Number(data.price) || 0 : undefined,
      stock: data.stock !== undefined ? Number(data.stock) || 0 : undefined,
      discount: data.discount !== undefined ? Number(data.discount) || 0 : undefined,
      isFeatured: data.isFeatured,
    };

    if (images) {
      updatePayload.images = images;
      updatePayload.image = images[0] || '';
    }

    Object.keys(updatePayload).forEach(
      (key) => updatePayload[key] === undefined && delete updatePayload[key]
    );

    const product = await WebsiteProduct.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    }).populate({ path: 'category', model: 'Category', select: 'name' });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await WebsiteProduct.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
