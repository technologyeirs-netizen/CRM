console.log("salesSettingController loaded");

const SalesSetting = require("../models/SalesSetting");

// ========================================
// GET SALES SETTINGS
// ========================================

exports.getSalesSetting = async (req, res) => {
  try {
    const setting = await SalesSetting.findOne();

    return res.status(200).json({
      success: true,
      setting,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed To Fetch Settings",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE SALES SETTINGS
// ========================================

exports.updateSalesSetting = async (req, res) => {
  try {
    console.log("BODY RECEIVED:");
    console.log(JSON.stringify(req.body, null, 2));

    let setting = await SalesSetting.findOne();

    if (!setting) {
      setting = new SalesSetting(req.body);
    } else {
      setting.set({
        ...req.body,

        invoicePreferences: {
          ...setting.invoicePreferences?.toObject?.(),
          ...req.body.invoicePreferences,
        },

        creditNotePreferences: {
          ...setting.creditNotePreferences?.toObject?.(),
          ...req.body.creditNotePreferences,
        },
        deliveryChallanPreferences: {
          ...setting.deliveryChallanPreferences?.toObject?.(),
          ...req.body.deliveryChallanPreferences,
        },
      });
    }

    await setting.save();

    console.log("AFTER SAVE:");
    console.log(setting);

    return res.status(200).json({
      success: true,
      message: "Settings Updated Successfully",
      setting,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed To Update Settings",
      error: error.message,
    });
  }
};