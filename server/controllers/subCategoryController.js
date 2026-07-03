const SubCategory = require("../models/SubCategory");

exports.getSubCategories = async (
  req,
  res
) => {
  try {
    const subcategories =
      await SubCategory.find({
        isActive: { $ne: false },
      })
        .populate("category", "name")
        .sort({ name: 1 });

    res.status(200).json({
      success: true,
      subcategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createSubCategory = async (
  req,
  res
) => {
  try {
    const subcategory =
      await SubCategory.create({
        category: req.body.category,
        name:
          req.body.name?.trim(),
        description:
          req.body.description?.trim() ||
          "",
      });

    res.status(201).json({
      success: true,
      message:
        "SubCategory created successfully",
      subcategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "SubCategory already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateSubCategory =
  async (req, res) => {
    try {
      const subcategory =
        await SubCategory.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message:
            "SubCategory not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "SubCategory updated successfully",
        subcategory,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

exports.deleteSubCategory =
  async (req, res) => {
    try {
      const subcategory =
        await SubCategory.findByIdAndDelete(
          req.params.id
        );

      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message:
            "SubCategory not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "SubCategory deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };