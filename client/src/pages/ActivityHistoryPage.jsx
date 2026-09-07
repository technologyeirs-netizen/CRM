import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  History,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  FilePlus2,
  FilePen,
  FileX2,
  RefreshCw,
} from "lucide-react";

import { activityLogService } from "../services/activityLogService";

// ============================================
// CONSTANTS
// ============================================
const DOCUMENT_TYPES = [
  "Invoice",
  "Quotation",
  "Credit Note",
  "Delivery Challan",
];

const ACTIONS = ["Create", "Edited", "Delete"];

const ACTION_STYLES = {
  Create: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Edited: "bg-amber-50 text-amber-700 border border-amber-200",
  Delete: "bg-rose-50 text-rose-700 border border-rose-200",
};

const ACTION_ICONS = {
  Create: FilePlus2,
  Edited: FilePen,
  Delete: FileX2,
};

const TYPE_STYLES = {
  Invoice: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  Quotation: "bg-sky-50 text-sky-700 border border-sky-200",
  "Credit Note": "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200",
  "Delivery Challan": "bg-orange-50 text-orange-700 border border-orange-200",
};

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function ActivityHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [documentType, setDocumentType] = useState(
    searchParams.get("type") || ""
  );
  const [action, setAction] = useState(searchParams.get("action") || "");
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || ""
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

  const search = useDebouncedValue(searchInput, 400);

  const [page, setPage] = useState(1);
  const limit = 20;
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Keep the URL in sync with active filters so the page is shareable/
  // deep-linkable (e.g. a "History" button on the Invoice list can
  // link straight to /history?type=Invoice).
  useEffect(() => {
    const next = {};
    if (documentType) next.type = documentType;
    if (action) next.action = action;
    if (search) next.search = search;
    if (startDate) next.startDate = startDate;
    if (endDate) next.endDate = endDate;
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentType, action, search, startDate, endDate]);

  // Any filter change resets back to page 1.
  useEffect(() => {
    setPage(1);
  }, [documentType, action, search, startDate, endDate]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await activityLogService.getAll({
        page,
        limit,
        documentType: documentType || undefined,
        action: action || undefined,
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setLogs(data?.logs || []);
      setTotal(data?.total || 0);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error("FETCH ACTIVITY LOGS ERROR =>", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, documentType, action, search, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const hasActiveFilters = useMemo(
    () => Boolean(documentType || action || search || startDate || endDate),
    [documentType, action, search, startDate, endDate]
  );

  const clearFilters = () => {
    setDocumentType("");
    setAction("");
    setSearchInput("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="p-6 space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4f46e5]/10 flex items-center justify-center">
            <History size={20} className="text-[#4f46e5]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              Activity History
            </h1>
            <p className="text-sm text-gray-500">
              Every create, edit and delete on Invoices, Quotations, Credit
              Notes and Delivery Challans — with who did it and when.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by document no., party or username..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
          />
        </div>

        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All Types</option>
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">All Actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f1f3f5] text-gray-600 text-xs font-semibold uppercase border-b border-gray-200">
              <th className="py-3 px-4">Date &amp; Time</th>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Number</th>
              <th className="py-3 px-4">Party</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-500">
                  Loading history...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  No activity found
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const ActionIcon = ACTION_ICONS[log.action] || FilePen;
                const isExpanded = expandedId === log._id;
                const hasChanges = (log.changes || []).length > 0;

                return (
                  <React.Fragment key={log._id}>
                    <tr className="hover:bg-gray-50/60 transition-colors align-top">
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-500">
                        {formatDateTime(log.createdAt)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-800">
                          {log.user?.name || "Unknown User"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {log.user?.email || "—"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                            TYPE_STYLES[log.documentType] ||
                            "bg-gray-50 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {log.documentType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-gray-800 whitespace-nowrap">
                        {log.documentNumber || "—"}
                      </td>

                      <td className="py-3.5 px-4 text-gray-600">
                        {log.partyName || "—"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                            ACTION_STYLES[log.action] ||
                            "bg-gray-50 text-gray-600 border border-gray-200"
                          }`}
                        >
                          <ActionIcon size={12} />
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-start gap-2">
                          <p className="text-gray-600 line-clamp-2">
                            {log.details}
                          </p>
                          {hasChanges && (
                            <button
                              onClick={() =>
                                setExpandedId(isExpanded ? null : log._id)
                              }
                              className="shrink-0 text-indigo-500 hover:text-indigo-700"
                              title="View field-level changes"
                            >
                              {isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isExpanded && hasChanges && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={7} className="px-4 pb-4">
                          <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                            <thead>
                              <tr className="bg-white text-gray-500 uppercase">
                                <th className="py-2 px-3 text-left">Field</th>
                                <th className="py-2 px-3 text-left">
                                  Old Value
                                </th>
                                <th className="py-2 px-3 text-left">
                                  New Value
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {log.changes.map((c, i) => (
                                <tr key={`${log._id}-${i}`}>
                                  <td className="py-2 px-3 font-medium text-gray-700">
                                    {c.label}
                                  </td>
                                  <td className="py-2 px-3 text-rose-600">
                                    {String(c.oldValue)}
                                  </td>
                                  <td className="py-2 px-3 text-emerald-600">
                                    {String(c.newValue)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} · {total} record{total === 1 ? "" : "s"}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              Previous
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                page === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
