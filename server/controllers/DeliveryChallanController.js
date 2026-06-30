const DeliveryChallan  = require("../models/DeliveryChallan");
const SalesSetting = require("../models/SalesSetting");
// ============================================
// GET ALL DELIVERY CHALLANS
// ============================================

exports.getAllDeliveryChallans = async (req, res) => {
  try {

    const challans = await DeliveryChallan.find()
      .sort({ createdAt: -1 });

    const formattedChallans = challans.map((challan) => ({
      _id: challan._id,

      date: challan.challanDate || null,

      challanNumber:
        challan.fullDeliveryChallanNumber || "",

      partyName:
        challan.party?.name || "",

      clientId:
        challan.party?.clientId || null,

      amount:
        challan.totalAmount || 0,

      status:
        challan.status || "Open",
    }));

    return res.status(200).json({
      success: true,
      total: formattedChallans.length,
      deliveryChallans: formattedChallans,
    });

  } catch (error) {

    console.log(
      "GET DELIVERY CHALLANS ERROR =>",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed To Fetch Delivery Challans",
      error: error.message,
    });

  }
};

// ============================================
// GET SINGLE DELIVERY CHALLAN
// ============================================

exports.getSingleDeliveryChallan = async (req, res) => {
  try {

    const challan =
      await DeliveryChallan.findById(
        req.params.id
      );

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: "Delivery Challan Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      deliveryChallan: challan,
    });

  } catch (error) {

    console.log(
      "GET SINGLE DELIVERY CHALLAN ERROR =>",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed To Fetch Delivery Challan",
      error: error.message,
    });

  }
};

// ============================================
// CREATE DELIVERY CHALLAN
// ============================================

exports.createDeliveryChallan = async (req, res) => {
  try {

    console.log(
      "REQ BODY =>",
      req.body
    );

    const {

      party = {},

      deliveryChallanItems = [],

      deliveryChallanPrefix,

      deliveryChallanNumber,

      challanDate,

      notes = "",

      termsAndConditions = [],

      subtotal = 0,

      taxableAmount = 0,

      totalDiscount = 0,

      totalTax = 0,

      totalAmount = 0,

      company = {},

      signature = {},

      status = "Open",

    } = req.body;

    // =====================================
    // FORMAT PARTY
    // =====================================

    const formattedParty = {

      clientId:
        party?._id || null,

      name:
        party?.name ||
        `${party?.firstName || ""} ${party?.lastName || ""}`.trim(),

      phone:
        party?.phone || "",

      email:
        party?.email || "",

      balance:
        Number(
          party?.balance || 0
        ),

      address:
        typeof party?.address ===
        "string"
          ? party.address
          : party?.address?.street ||
            "",

    };

    // =====================================
    // FORMAT ITEMS
    // =====================================

    const formattedItems =
      deliveryChallanItems.map(
        (item) => {

          const qty = Number(
            item.qty || 1
          );

          const salesPrice =
            Number(
              item.salesPrice || 0
            );

          const purchasePrice =
            Number(
              item.purchasePrice || 0
            );

          const gstTaxRate =
            Number(
              item.gstTaxRate ||
                item.tax ||
                0
            );

          const discountPercent =
            Number(
              item.discountOnSalesPrice ||
                0
            );

          const grossAmount =
            qty * salesPrice;

          const discountAmount =
            (grossAmount *
              discountPercent) /
            100;

          const taxableAmount =
            grossAmount -
            discountAmount;

          const taxAmount =
            (taxableAmount *
              gstTaxRate) /
            100;

          const finalAmount =
            taxableAmount +
            taxAmount;

          return {

            itemId:
              item._id ||
              item.itemId ||
              null,

            name:
              item.name || "",

            itemCode:
              item.itemCode ||
              "",

            hsnCode:
              item.hsnCode ||
              item.hsn ||
              "",

            measuringUnit:
              item.measuringUnit ||
              "",

            qty,

            salesPrice,

            purchasePrice,

            tax: gstTaxRate,

            gstTaxRate,

            discountOnSalesPrice:
              discountPercent,

            grossAmount,

            discountAmount,

            taxableAmount,

            taxAmount,

            finalAmount,

          };

        }
      );

    // =====================================
    // SALES SETTINGS
    // =====================================

    const salesSetting =
      await SalesSetting.findOne();

    if (!salesSetting) {
      return res.status(400).json({
        success: false,
        message:
          "Sales Settings not configured.",
      });
    }

    const preferences =
      salesSetting.deliveryChallanPreferences ||
      {};

    const finalPrefix =
      deliveryChallanPrefix ||
      `${preferences.deliveryChallanPrefix || ""}${
        preferences.financialYear ||
        ""
      }/`;

    const finalNumber =
      deliveryChallanNumber ||
      String(
        preferences.currentDeliveryChallanNumber ||
          1
      ).padStart(4, "0");

    const fullDeliveryChallanNumber =
      `${finalPrefix}${finalNumber}`;

    // =====================================
    // CREATE
    // =====================================

    const deliveryChallan =
      await DeliveryChallan.create({

        party:
          formattedParty,

        items:
          formattedItems,

        deliveryChallanPrefix:
          finalPrefix,

        deliveryChallanNumber:
          finalNumber,

        fullDeliveryChallanNumber,

        challanDate,

        notes,

        termsAndConditions,

        subtotal,

        taxableAmount,

        totalDiscount,

        totalTax,

        totalAmount,

        company: {

          logo:
            company?.logo || "",

          name:
            company?.name || "",

          gstin:
            company?.gstin || "",

          panNumber:
            company?.panNumber || "",

          mobile:
            company?.mobile || "",

          email:
            company?.email || "",

          website:
            company?.website || "",

          businessType:
            company?.businessType ||
            "",

          registrationType:
            company?.registrationType ||
            "",

          address: {

            street:
              company?.address
                ?.street || "",

            city:
              company?.address
                ?.city || "",

            state:
              company?.address
                ?.state || "",

            pincode:
              company?.address
                ?.pincode || "",

            country:
              company?.address
                ?.country || "",

          },

        },

        signature: {

          imageUrl:
            signature?.imageUrl ||
            "",

        },

        status,

      });

    // =====================================
    // UPDATE NEXT NUMBER
    // =====================================

    const currentNumber =
      Number(
        preferences.currentDeliveryChallanNumber ||
          1
      );

    const savedNumber =
      Number(finalNumber);

    if (
      savedNumber ===
      currentNumber
    ) {

      await SalesSetting.findByIdAndUpdate(
        salesSetting._id,
        {
          $set: {
            "deliveryChallanPreferences.currentDeliveryChallanNumber":
              currentNumber + 1,
          },
        }
      );

    } else if (
      savedNumber >
      currentNumber
    ) {

      await SalesSetting.findByIdAndUpdate(
        salesSetting._id,
        {
          $set: {
            "deliveryChallanPreferences.currentDeliveryChallanNumber":
              savedNumber + 1,
          },
        }
      );

    }

    return res.status(201).json({

      success: true,

      message:
        "Delivery Challan Created Successfully",

      deliveryChallan,

    });

  } catch (error) {

    console.log(
      "CREATE DELIVERY CHALLAN ERROR =>",
      error
    );

    if (error.code === 11000) {

      const field =
        Object.keys(
          error.keyPattern || {}
        )[0];

      return res.status(400).json({

        success: false,

        message: `${field} already exists.`,

      });

    }

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed To Create Delivery Challan",

    });

  }
};

// ============================================
// UPDATE DELIVERY CHALLAN
// ============================================

exports.updateDeliveryChallan = async (req, res) => {
  try {

    const { id } = req.params;

    const existing =
      await DeliveryChallan.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Delivery Challan not found",
      });
    }

    const {

      party = {},

      deliveryChallanItems = [],

      deliveryChallanPrefix,

      deliveryChallanNumber,

      challanDate,

      notes = "",

      termsAndConditions = [],

      subtotal = 0,

      taxableAmount = 0,

      totalDiscount = 0,

      totalTax = 0,

      totalAmount = 0,

      company = {},

      signature = {},

      status = "Open",

    } = req.body;

    // =========================
    // PARTY
    // =========================

    const formattedParty = {

      clientId:
        party?._id || null,

      name:
        party?.name ||
        `${party?.firstName || ""} ${party?.lastName || ""}`.trim(),

      phone:
        party?.phone || "",

      email:
        party?.email || "",

      balance:
        Number(
          party?.balance || 0
        ),

      address:
        typeof party?.address ===
        "string"
          ? party.address
          : party?.address?.street ||
            "",

    };

    // =========================
    // ITEMS
    // =========================

    const formattedItems =
      deliveryChallanItems.map(
        (item) => {

          const qty =
            Number(item.qty || 1);

          const salesPrice =
            Number(
              item.salesPrice || 0
            );

          const purchasePrice =
            Number(
              item.purchasePrice || 0
            );

          const gstTaxRate =
            Number(
              item.gstTaxRate ||
                item.tax ||
                0
            );

          const discountPercent =
            Number(
              item.discountOnSalesPrice ||
                0
            );

          const grossAmount =
            qty * salesPrice;

          const discountAmount =
            (grossAmount *
              discountPercent) /
            100;

          const taxableAmount =
            grossAmount -
            discountAmount;

          const taxAmount =
            (taxableAmount *
              gstTaxRate) /
            100;

          const finalAmount =
            taxableAmount +
            taxAmount;

          return {

            itemId:
              item._id ||
              item.itemId ||
              null,

            name:
              item.name || "",

            itemCode:
              item.itemCode || "",

            hsnCode:
              item.hsnCode ||
              item.hsn ||
              "",

            measuringUnit:
              item.measuringUnit ||
              "",

            qty,

            salesPrice,

            purchasePrice,

            tax: gstTaxRate,

            gstTaxRate,

            discountOnSalesPrice:
              discountPercent,

            grossAmount,

            discountAmount,

            taxableAmount,

            taxAmount,

            finalAmount,

          };

        }
      );

    const fullDeliveryChallanNumber =
      `${deliveryChallanPrefix}${deliveryChallanNumber}`;

    const updated =
      await DeliveryChallan.findByIdAndUpdate(
        id,
        {

          party:
            formattedParty,

          items:
            formattedItems,

          deliveryChallanPrefix,

          deliveryChallanNumber,

          fullDeliveryChallanNumber,

          challanDate,

          notes,

          termsAndConditions,

          subtotal,

          taxableAmount,

          totalDiscount,

          totalTax,

          totalAmount,

          company,

          signature,

          status,

        },
        {
          new: true,
          runValidators: true,
        }
      );

    return res.status(200).json({

      success: true,

      message:
        "Delivery Challan Updated Successfully",

      deliveryChallan:
        updated,

    });

  } catch (error) {

    console.log(
      "UPDATE DELIVERY CHALLAN ERROR =>",
      error
    );

    if (error.code === 11000) {

      const field =
        Object.keys(
          error.keyPattern || {}
        )[0];

      return res.status(400).json({

        success: false,

        message:
          `${field} already exists.`,

      });

    }

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed To Update Delivery Challan",

    });

  }
};

// ============================================
// DELETE DELIVERY CHALLAN
// ============================================

exports.deleteDeliveryChallan = async (req, res) => {
  try {

    const challan =
      await DeliveryChallan.findById(
        req.params.id
      );

    if (!challan) {
      return res.status(404).json({
        success: false,
        message:
          "Delivery Challan not found",
      });
    }

    await DeliveryChallan.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({

      success: true,

      message:
        "Delivery Challan deleted successfully",

    });

  } catch (error) {

    console.log(
      "DELETE DELIVERY CHALLAN ERROR =>",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed To Delete Delivery Challan",

    });

  }
};