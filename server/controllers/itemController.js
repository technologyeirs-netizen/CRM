const Item = require('../models/Item');
// FIX: Model path updated to match your file name 'WebsiteProduct'
const WebsiteProduct = require('../models/Products'); 

exports.getItems = async (req, res) => {
  try {
    const { page = 1, limit = 500, search } = req.query;

    const query = {
      isDeleted: false,
    };

    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    const total = await Item.countDocuments(query);

    const products = await Item.find(query)
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createItem = async (req, res) => {
  try {
    const data = req.body;

    const item = await Item.create({
      itemType: "product",
      name: data.productName,
      hsnCode: data.hsn || "",
      category: data.category || null,
      subCategory: data.subCategory || null,
      brand: data.brand || "",
      description: data.description || "",
      modelNo: data.modelNo || "",
      images: data.images || [],
      salesPrice: Number(data.price) || 0,
      openingStock: Number(data.stock) || 0,
      discountOnSalesPrice: Number(data.discount) || 0,
      isLive: false,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const data = req.body;

    const item = await Item.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false,
      },
      {
        name: data.productName,
        hsnCode: data.hsn || "",
        category: data.category || null,
        subCategory: data.subCategory || null,
        brand: data.brand || "",
        description: data.description || "",
        modelNo: data.modelNo || "",
        images: data.images || [],
        salesPrice: Number(data.price) || 0,
        openingStock: Number(data.stock) || 0,
        discountOnSalesPrice: Number(data.discount) || 0,
      },
      {
        new: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
      },
      {
        new: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getItemStats = async (req, res) => {
  try {
    const total = await Item.countDocuments({ isDeleted: false });
    const products = await Item.countDocuments({ isDeleted: false, itemType: 'product' });
    const services = await Item.countDocuments({ isDeleted: false, itemType: 'service' });
    res.status(200).json({ success: true, stats: { total, products, services } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.liveProduct = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (item.isLive) {
      return res.status(400).json({
        success: false,
        message: "Already live",
      });
    }

    const websiteProduct = await WebsiteProduct.create({
      productName: item.name,
      hsn: item.hsnCode,
      category: item.category,
      subcategory: item.subCategory,
      brand: item.brand,
      description: item.description,
      modelNo: item.modelNo,
      images: item.images,
      image: item.images?.[0] || "",
      price: item.salesPrice,
      stock: item.openingStock,
      discount: item.discountOnSalesPrice,
      isFeatured: false,
    });

    item.isLive = true;
    item.liveAt = new Date();
    item.websiteProductId = websiteProduct._id;

    await item.save();

    res.status(200).json({
      success: true,
      message: "Product is now live on website",
      product: websiteProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
