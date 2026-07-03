const express = require("express");

const router = express.Router();

const {
  getSalesSetting,
  updateSalesSetting,
} = require("../controllers/salesSettingController");

router.get("/", getSalesSetting);

router.put("/", (req, res) => {
  console.log("PUT ROUTE HIT");
  updateSalesSetting(req, res);
});

module.exports = router;