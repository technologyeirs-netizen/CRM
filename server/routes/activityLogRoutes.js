const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  getActivityLogs,
  getActivityLogsForDocument,
} = require("../controllers/activityLogController");

// All history routes require a logged-in user.
router.use(protect);

// GET /api/activity-logs                    -> full, filterable history
router.get("/", getActivityLogs);

// GET /api/activity-logs/document/:documentId -> history for one document
router.get("/document/:documentId", getActivityLogsForDocument);

module.exports = router;
