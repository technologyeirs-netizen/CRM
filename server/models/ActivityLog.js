const mongoose = require("mongoose");

// ============================================
// ACTIVITY LOG (AUDIT TRAIL)
// ------------------------------------------------
// Tracks who did what, on which document, and when.
// Written by controllers whenever an Invoice, Quotation,
// Credit Note or Delivery Challan is created, edited or
// deleted. Read-heavy (list view with filters), so it is
// indexed for the common query patterns: latest-first,
// filter by document type, filter by document, filter by
// user, and text search by document number / user.
// ============================================

const changeSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    label: { type: String, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const activityLogSchema = new mongoose.Schema(
  {
    // Who performed the action (snapshot at the time of the
    // action - kept even if the user/employee is later renamed
    // or removed, so history never goes blank).
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      name: { type: String, default: "Unknown User", trim: true },
      email: { type: String, default: "", trim: true, lowercase: true },
      role: { type: String, default: "", trim: true },
    },

    documentType: {
      type: String,
      required: true,
      enum: ["Invoice", "Quotation", "Credit Note", "Delivery Challan"],
      index: true,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    documentNumber: { type: String, default: "", trim: true },

    // Who the document was for (party / client name) - helpful
    // context in the history list without another lookup.
    partyName: { type: String, default: "", trim: true },

    action: {
      type: String,
      required: true,
      enum: ["Create", "Edited", "Delete"],
      index: true,
    },

    // Human-readable one-line (or semicolon separated) summary,
    // e.g. "Status: Unpaid → Paid; Total Amount: 1,000 → 1,200"
    details: { type: String, default: "" },

    // Structured field-level diff backing `details`, so the UI
    // can render a clean before/after table instead of parsing text.
    changes: { type: [changeSchema], default: [] },

    ipAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

// Latest-first is the default list view.
activityLogSchema.index({ createdAt: -1 });
// Filter by module (Invoice/Quotation/Credit Note/Delivery Challan).
activityLogSchema.index({ documentType: 1, createdAt: -1 });
// "Show me the history of this one document" (e.g. from its view page).
activityLogSchema.index({ documentId: 1, createdAt: -1 });
// "Show me what this employee did".
activityLogSchema.index({ "user.id": 1, createdAt: -1 });
// Free-text search by document number / user name / email.
activityLogSchema.index({
  documentNumber: "text",
  "user.name": "text",
  "user.email": "text",
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
