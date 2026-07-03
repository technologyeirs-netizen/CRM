import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Calendar,
  ChevronDown,
  MoreVertical,
  FileText,
  Settings,
  Grid,
  Edit,
  History,
  Copy,
  FileMinus,
  XCircle,
  Trash2,
  HelpCircle,
  Download,
} from "lucide-react";

import { salesInvoiceService } from "../../services/salesInvoiceService";
import { creditNoteService } from "../../services/creditNoteService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { salesSettingService } from "../../services/salesSettingService";
export default function SalesInvoicesDashboard() {
  // =========================
  // STATES
  // =========================
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState("Last 365 Days");
  const [salesSettings, setSalesSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  // REAL API DATA
  const [invoices, setInvoices] = useState([]);

  // PAGINATION
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // STATS
  const [stats, setStats] = useState([
    {
      label: "Total Sales",
      value: "₹ 0",
      color: "border-purple-500 bg-purple-50/30 text-purple-700",
    },
    {
      label: "Paid",
      value: "₹ 0",
      color: "border-gray-200 bg-white text-emerald-600",
    },
    {
      label: "Unpaid",
      value: "₹ 0",
      color: "border-gray-200 bg-white text-rose-600",
    },
    {
      label: "Cancelled",
      value: "—",
      color: "border-gray-200 bg-white text-gray-400",
    },
  ]);

  const dateDropdownRef = useRef(null);
  const bulkDropdownRef = useRef(null);
  const searchRef = useRef(null);
  const fetchSalesSettings = async () => {
  try {
    const { data } =
      await salesSettingService.get();

    setSalesSettings(data.setting);
  } catch (error) {
    console.log(error);
  }
};
  const handleDeleteInvoice = async (invoiceId) => {
  try {
    const ok = window.confirm("Are you sure you want to delete this invoice?");
    if (!ok) return;

    await salesInvoiceService.remove(invoiceId);

    setInvoices((prev) =>
      prev.filter((item) => item._id !== invoiceId)
    );

    toast.success("Invoice deleted successfully");
  } catch (error) {
    toast.error(
      error?.response?.data?.message || "Failed to delete invoice"
    );
  }
};

  // =========================
  // FETCH INVOICES
  // =========================
  const handleIssueCreditNote = async (invoiceId) => {
  try {
    if (!salesSettings) {
      return toast.error("Sales settings not loaded");
    }

    const pref =
      salesSettings.creditNotePreferences;

    const payload = {
      creditNotePrefix:
        `${pref.creditNotePrefix}${pref.financialYear}/`,

      creditNoteNumber:
        String(
          pref.currentCreditNoteNumber
        ).padStart(4, "0"),

      creditNoteDate:
        new Date()
          .toISOString()
          .split("T")[0],

      notes: "",

      termsAndConditions:
        salesSettings?.termsAndConditions?.creditNote || [],
    };

    const res =
      await creditNoteService.createFromInvoice(
        invoiceId,
        payload
      );

    if (res.data.success) {
      toast.success(
        "Credit Note Created Successfully"
      );

      setActiveMenuIndex(null);

      navigate("/credit-note");
    }
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
        "Failed to create credit note"
    );
  }
};

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const response = await salesInvoiceService.getAll({
        page,
        limit,
      });

      console.log("API RESPONSE => ", response.data);

      // API RESPONSE
      // {
      //   success: true,
      //   invoices: [],
      //   total: 2
      // }

      const apiInvoices = response?.data?.invoices || [];

      setInvoices(apiInvoices);

      // PAGINATION
      const total = response?.data?.total || 0;
      setTotalPages(Math.ceil(total / limit) || 1);

      // =========================
      // STATS CALCULATION
      // =========================
      let totalSales = 0;
      let paid = 0;
      let unpaid = 0;

      apiInvoices.forEach((invoice) => {
        totalSales += Number(invoice.amount || 0);

        if (invoice.status === "Paid") {
          paid += Number(invoice.amount || 0);
        }

        if (invoice.status === "Unpaid") {
          unpaid += Number(invoice.amount || 0);
        }
      });

      setStats([
        {
          label: "Total Sales",
          value: `₹ ${totalSales.toLocaleString("en-IN")}`,
          color: "border-purple-500 bg-purple-50/30 text-purple-700",
        },
        {
          label: "Paid",
          value: `₹ ${paid.toLocaleString("en-IN")}`,
          color: "border-gray-200 bg-white text-emerald-600",
        },
        {
          label: "Unpaid",
          value: `₹ ${unpaid.toLocaleString("en-IN")}`,
          color: "border-gray-200 bg-white text-rose-600",
        },
        {
          label: "Cancelled",
          value: "—",
          color: "border-gray-200 bg-white text-gray-400",
        },
      ]);
    } catch (error) {
      console.log("FETCH INVOICE ERROR => ", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // USE EFFECT
  // =========================
  useEffect(() => {
    fetchInvoices();
    fetchSalesSettings();
  }, [page]);

  // =========================
  // CLOSE DROPDOWNS
  // =========================
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target)
      ) {
        setShowDateDropdown(false);
      }

      if (
        bulkDropdownRef.current &&
        !bulkDropdownRef.current.contains(event.target)
      ) {
        setShowBulkDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================
  // REDIRECT
  // =========================
  const handleCreateInvoiceRedirect = () => {
    window.location.href = "/invoice/create";
  };

  // =========================
  // DATE OPTIONS
  // =========================
  const dateOptions = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "7 Days",
    "30 Days",
    "This Month",
    "Previous Month",
    "This Quarter",
    "Previous Quarter",
    "Current Fiscal Year",
    "Previous Fiscal Year",
    "Last 365 Days",
    "Custom",
  ];

  // =========================
  // MENU
  // =========================
  const toggleActionMenu = (index, e) => {
    e.stopPropagation();

    if (activeMenuIndex === index) {
      setActiveMenuIndex(null);
    } else {
      setActiveMenuIndex(index);
    }
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // DUE DAYS
  // =========================
  const getDueIn = (dueDate) => {
    if (!dueDate) return "-";

    const today = new Date();
    const due = new Date(dueDate);

    const diffTime = due - today;

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Overdue";

    return `${diffDays} Days`;
  };

  const handleEditInvoice = (invoiceId) => {
    window.location.href = `/invoice/create?id=${invoiceId}`;
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/invoice/view/${invoiceId}`);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans relative select-none">
      {/* Top Header Row */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Sales Invoices</h1>

       
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border bg-white shadow-sm flex flex-col justify-between h-24 ${
              idx === 0
                ? "border-purple-400 bg-purple-50/20"
                : "border-gray-100"
            }`}
          >
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {stat.label}
            </span>

            <span
              className={`text-xl font-bold ${
                idx === 0 ? "text-slate-800" : stat.color.split(" ").pop()
              }`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Interactive Filters & Actions Bar */}
      <div className="flex justify-between items-center mb-4 gap-4">
        {/* <div className="flex items-center gap-3 flex-1">
          <div ref={searchRef} className="transition-all duration-300">
            {!isSearchExpanded ? (
              <button
                onClick={() => setIsSearchExpanded(true)}
                className="p-2.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 shadow-sm flex items-center justify-center"
              >
                <Search size={18} />
              </button>
            ) : (
              <div className="flex items-center border border-purple-400 bg-white rounded-lg shadow-sm overflow-hidden w-80 h-[40px]">
                <div className="pl-3 text-gray-400">
                  <Search size={18} />
                </div>

                <input
                  type="text"
                  placeholder="Search Sales Invoice"
                  className="w-full px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                  autoFocus
                />

                <div className="border-l border-gray-200 h-full flex items-center px-3 bg-gray-50 text-gray-600 text-xs font-medium cursor-pointer gap-1 whitespace-nowrap">
                  <span>Invoice No. & Pa...</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={dateDropdownRef}>
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2.5 rounded-lg text-sm text-gray-600 font-medium shadow-sm hover:bg-gray-50 h-[40px]"
            >
              <Calendar size={16} className="text-gray-400" />

              <span>{selectedDateFilter}</span>

              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {showDateDropdown && (
              <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto py-1.5 divide-y divide-gray-50">
                <div className="py-1">
                  {dateOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedDateFilter(option);
                        setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${
                        selectedDateFilter === option
                          ? "bg-indigo-50/60 font-semibold text-indigo-600"
                          : ""
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div> */}

        <div className="flex items-center gap-3">
          {/* Bulk Actions */}
          {/* <div className="relative" ref={bulkDropdownRef}>
            <button
              onClick={() => setShowBulkDropdown(!showBulkDropdown)}
              className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 h-[40px]"
            >
              <span>Bulk Actions</span>

              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {showBulkDropdown && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1">
                <button
                  onClick={() => handleCreateInvoiceRedirect()}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-normal"
                >
                  <Download size={16} className="text-gray-500" />
                  Download Bulk Upload
                </button>
              </div>
            )}
          </div> */}

          {/* Create Button */}
          <button
            onClick={handleCreateInvoiceRedirect}
            className="bg-[#4f46e5] text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-[#4338ca] transition-colors whitespace-nowrap h-[40px]"
          >
            Create Sales Invoice
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f1f3f5] text-gray-600 text-xs font-semibold uppercase border-b border-gray-200">
              {/* <th className="py-3 px-4 w-12">
                <input
                  type="checkbox"
                  className="rounded text-indigo-600 border-gray-300"
                />
              </th> */}

              <th className="py-3 px-4 flex items-center gap-1 cursor-pointer">
                Date <ChevronDown size={12} />
              </th>

              <th className="py-3 px-4">Invoice Number</th>

              <th className="py-3 px-4">Party Name</th>

              <th className="py-3 px-4">Due In</th>

              <th className="py-3 px-4">Amount</th>

              <th className="py-3 px-4">Status</th>

              <th className="py-3 px-4 w-12"></th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-500">
                  Loading invoices...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((invoice, index) => (
                <tr
                    key={invoice._id}
                    onClick={() => handleViewInvoice(invoice._id)}
                    className={`cursor-pointer hover:bg-gray-50/60 transition-colors ${
                      activeMenuIndex === index ? "bg-slate-50" : ""
                    }`}
                  >
                  {/* <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="rounded text-indigo-600 border-gray-300"
                    />
                  </td> */}

                  <td className="py-4 px-4 whitespace-nowrap text-gray-500">
                    {formatDate(invoice.date)}
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-semibold text-indigo-600 hover:underline">
                      {invoice.invoiceNumber}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-gray-800 font-medium">
                    {invoice.partyName}
                  </td>

                  <td className="py-4 px-4 text-gray-400">
                    {getDueIn(invoice.dueIn)}
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-semibold text-gray-800">
                      ₹ {Number(invoice.amount || 0).toLocaleString("en-IN")}
                    </div>

                    {invoice.status === "Unpaid" && (
                      <div className="text-[11px] text-gray-400 font-normal">
                        ₹ {Number(invoice.amount || 0).toLocaleString("en-IN")}{" "}
                        unpaid
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        invoice.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>

                    <td
                      className="py-4 px-4 text-right relative overflow-visible"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                      onClick={(e) => toggleActionMenu(index, e)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuIndex === index && (
                      <div className="absolute right-12 top-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 text-left py-1 divide-y divide-gray-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewInvoice(invoice._id);
                              setActiveMenuIndex(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <FileText size={16} className="text-gray-500" />
                            View
                          </button>
                        </div>
                        
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditInvoice(invoice._id);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-normal"
                          >
                            <Edit size={16} className="text-gray-500" />
                            Edit
                          </button>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => handleIssueCreditNote(invoice._id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-normal"
                          >
                            <FileMinus size={16} className="text-gray-500" />
                            Issue Credit Note
                          </button>
                        </div>

                        <div className="py-1">
                          <button
  onClick={(e) => {
    e.stopPropagation();
    handleDeleteInvoice(invoice._id);
    setActiveMenuIndex(null);
  }}
  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-normal"
>
  <Trash2 size={16} className="text-red-500" />
  Delete
</button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
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
              onClick={() => setPage(page + 1)}
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

      {/* Floating Bottom Help Icon */}
      <div className="absolute bottom-6 right-6">
        <button className="bg-slate-800 text-white p-3 rounded-full shadow-lg hover:bg-slate-700 transition-colors">
          <HelpCircle size={22} />
        </button>
      </div>
    </div>
  );
}
