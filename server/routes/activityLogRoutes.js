const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { attachPermissions, requirePermission } = require("../middleware/permission");
const {
  getActivityLogs,
  getActivityLogsForDocument,
} = require("../controllers/activityLogController");

// Every logged-in team member can hit this — the controller itself scopes
// the result down to "yourself + your downline" unless you're Super Admin
// or on the Account team (dataScope 'all'). This is what lets a Sales
// Manager see "who did what" for their own Sales Executives / Telecallers
// without exposing every other team's history.
router.use(protect, attachPermissions);

// GET /api/activity-logs                    -> full, filterable history (scoped)
router.get("/", requirePermission('team-activity', 'view'), getActivityLogs);

// GET /api/activity-logs/document/:documentId -> history for one document
router.get("/document/:documentId", requirePermission('team-activity', 'view'), getActivityLogsForDocument);

module.exports = router;
