const express = require("express");
const router = express.Router();

const {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/subCategoryController");

const {
  protect,
  authorize,
} = require("../middleware/auth");

router
  .route("/")
  .get(
    protect,
    authorize("admin", "account", "b2c", "delivery"),
    getSubCategories
  )
  .post(
    protect,
    authorize("admin", "account", "b2c", "delivery"),
    createSubCategory
  );

router
  .route("/:id")
  .put(
    protect,
    authorize("admin", "account", "b2c", "delivery"),
    updateSubCategory
  )
  .delete(
    protect,
    authorize("admin", "account", "b2c", "delivery"),
    deleteSubCategory
  );

module.exports = router;