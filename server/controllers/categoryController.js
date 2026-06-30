const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const { search, page = 1, limit = 100 } = req.query;

    const query = {
      isActive: { $ne: false }
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Category.countDocuments(query);

    const categories = await Category.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: categories.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};  

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create({
      itemType: req.body.itemType || 'product',
      name: req.body.name?.trim(),
      description: req.body.description?.trim() || '',
      isActive: true,
      isDeleted: false,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Category already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.deleteCategory = async (req, res) => {
  try {
    console.log("DELETE ID:", req.params.id);

    const category = await Category.findByIdAndDelete(req.params.id);

    console.log("DELETED:", category);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};