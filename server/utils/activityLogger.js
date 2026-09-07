const ActivityLog = require("../models/ActivityLog");

// ============================================
// ACTIVITY LOGGER
// ------------------------------------------------
// Single place that knows how to:
//   1. Diff a "before" and "after" plain object over a list of
//      tracked fields and produce a human-readable summary.
//   2. Write an ActivityLog entry for Create / Edited / Delete.
//
// Logging NEVER throws and NEVER blocks the response - a failure
// here must not fail the actual invoice/quotation/credit note/
// delivery challan operation. Every call is wrapped in try/catch.
// ============================================

const FIELD_LABELS = {
  status: "Status",
  totalAmount: "Total Amount",
  amountReceived: "Amount Received",
  balanceAmount: "Balance Amount",
  paymentMode: "Payment Mode",
  paymentTerms: "Payment Terms",
  dueDate: "Due Date",
  invoiceDate: "Invoice Date",
  challanDate: "Challan Date",
  creditNoteDate: "Credit Note Date",
  notes: "Notes",
  "party.name": "Party Name",
  "party.phone": "Party Phone",
  "party.email": "Party Email",
  fullInvoiceNumber: "Invoice Number",
  fullDeliveryChallanNumber: "Challan Number",
  fullCreditNoteNumber: "Credit Note Number",
  items: "Items",
  globalDiscount: "Discount",
  totalDiscount: "Total Discount",
  totalTax: "Total Tax",
  subtotal: "Subtotal",
  taxableAmount: "Taxable Amount",
};

function getPath(obj, path) {
  if (!obj) return undefined;
  return path
    .split(".")
    .reduce((acc, key) => (acc === null || acc === undefined ? acc : acc[key]), obj);
}

function normalizeForCompare(value) {
  if (value instanceof Date) return value.getTime();
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return Math.round(value * 100) / 100; // avoid float noise
  return value;
}

function formatForDisplay(value) {
  if (value === undefined || value === null || value === "") return "—";
  if (value instanceof Date) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toISOString().split("T")[0];
  }
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (Array.isArray(value)) return `${value.length} item(s)`;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Compares `before` and `after` over `trackedFields` (dot-path strings).
 * Returns an array of { field, label, oldValue, newValue } for fields
 * that actually changed. Items arrays are compared by count only
 * (a full line-item diff is noisy and rarely useful in an audit list).
 */
function diffDocuments(before, after, trackedFields) {
  const changes = [];

  trackedFields.forEach((field) => {
    const oldRaw = getPath(before, field);
    const newRaw = getPath(after, field);

    if (field === "items") {
      const oldLen = Array.isArray(oldRaw) ? oldRaw.length : 0;
      const newLen = Array.isArray(newRaw) ? newRaw.length : 0;
      if (oldLen !== newLen) {
        changes.push({
          field,
          label: FIELD_LABELS[field] || field,
          oldValue: `${oldLen} item(s)`,
          newValue: `${newLen} item(s)`,
        });
      }
      return;
    }

    const oldComparable = normalizeForCompare(oldRaw);
    const newComparable = normalizeForCompare(newRaw);

    if (oldComparable === newComparable) return;

    changes.push({
      field,
      label: FIELD_LABELS[field] || field,
      oldValue: formatForDisplay(oldRaw),
      newValue: formatForDisplay(newRaw),
    });
  });

  return changes;
}

function buildDetails(action, documentType, changes) {
  if (action === "Create") return `${documentType} created`;
  if (action === "Delete") return `${documentType} deleted`;
  if (!changes.length) return `${documentType} updated`;
  return changes.map((c) => `${c.label}: ${c.oldValue} → ${c.newValue}`).join("; ");
}

/**
 * Writes one activity log entry. Safe to call without awaiting the
 * result from a hot path - it will never throw.
 *
 * @param {object} params
 * @param {object} params.req - the express request (used for req.user / req.ip)
 * @param {"Invoice"|"Quotation"|"Credit Note"|"Delivery Challan"} params.documentType
 * @param {string} params.documentId
 * @param {string} [params.documentNumber]
 * @param {string} [params.partyName]
 * @param {"Create"|"Edited"|"Delete"} params.action
 * @param {object} [params.before] - plain object snapshot before the change (Edited only)
 * @param {object} [params.after] - plain object snapshot after the change (Edited only)
 * @param {string[]} [params.trackedFields] - dot-paths to diff (Edited only)
 */
async function logActivity({
  req,
  documentType,
  documentId,
  documentNumber = "",
  partyName = "",
  action,
  before,
  after,
  trackedFields = [],
}) {
  try {
    const changes =
      action === "Edited" && before && after
        ? diffDocuments(before, after, trackedFields)
        : [];

    // Nothing actually changed - don't clutter the history with no-op saves.
    if (action === "Edited" && changes.length === 0) return;

    const actor = (req && req.user) || {};

    const ipAddress =
      (req &&
        (req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip)) ||
      "";

    await ActivityLog.create({
      user: {
        id: actor._id || actor.id || null,
        name: actor.name || "Unknown User",
        email: actor.email || "",
        role: actor.role || (actor.isAdmin ? "admin" : ""),
      },
      documentType,
      documentId,
      documentNumber,
      partyName,
      action,
      details: buildDetails(action, documentType, changes),
      changes,
      ipAddress,
    });
  } catch (error) {
    // Logging must never break the actual business operation.
    console.error("ACTIVITY LOG ERROR =>", error.message);
  }
}

module.exports = { logActivity, diffDocuments };
