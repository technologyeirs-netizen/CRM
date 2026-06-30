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
    authorize("admin"),
    getSubCategories
  )
  .post(
    protect,
    authorize("admin"),
    createSubCategory
  );

router
  .route("/:id")
  .put(
    protect,
    authorize("admin"),
    updateSubCategory
  )
  .delete(
    protect,
    authorize("admin"),
    deleteSubCategory
  );

module.exports = router;