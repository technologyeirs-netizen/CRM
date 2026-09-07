const ActivityLog = require("../models/ActivityLog");

// ============================================
// GET ACTIVITY LOGS (HISTORY)
// ------------------------------------------------
// Supports:
//   page, limit            - pagination
//   documentType            - Invoice | Quotation | Credit Note | Delivery Challan
//   action                   - Create | Edited | Delete
//   documentId               - history for one specific document
//   userId                   - what one employee/user did
//   search                   - matches document number / user name / email
//   startDate, endDate        - date range (inclusive)
// ============================================
exports.getActivityLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.documentType) {
      filter.documentType = req.query.documentType;
    }

    if (req.query.action) {
      filter.action = req.query.action;
    }

    if (req.query.documentId) {
      filter.documentId = req.query.documentId;
    }

    if (req.query.userId) {
      filter["user.id"] = req.query.userId;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};

      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (req.query.search) {
      const regex = new RegExp(
        String(req.query.search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { documentNumber: regex },
        { partyName: regex },
        { "user.name": regex },
        { "user.email": regex },
      ];
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      logs,
    });
  } catch (error) {
    console.error("GET ACTIVITY LOGS ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: "Failed To Fetch Activity Logs",
      error: error.message,
    });
  }
};

// ============================================
// GET ACTIVITY LOGS FOR ONE DOCUMENT
// (used on a document's own view page, e.g. "History" tab)
// ============================================
exports.getActivityLogsForDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const logs = await ActivityLog.find({ documentId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("GET DOCUMENT ACTIVITY LOG ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: "Failed To Fetch Document History",
      error: error.message,
    });
  }
};
