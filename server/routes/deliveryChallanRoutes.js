const express = require("express");

const router = express.Router();

const {
  createDeliveryChallan,
  getAllDeliveryChallans,
  getSingleDeliveryChallan,
  updateDeliveryChallan,
  deleteDeliveryChallan,
} = require("../controllers/deliveryChallanController");

// ============================================
// CREATE
// ============================================
router.post(
  "/create",
  createDeliveryChallan
);

// ============================================
// GET ALL
// ============================================
router.get(
  "/all",
  getAllDeliveryChallans
);

// ============================================
// GET SINGLE
// ============================================
router.get(
  "/:id",
  getSingleDeliveryChallan
);

// ============================================
// UPDATE
// ============================================
router.put(
  "/:id",
  updateDeliveryChallan
);

// ============================================
// DELETE
// ============================================
router.delete(
  "/:id",
  deleteDeliveryChallan
);

module.exports = router;