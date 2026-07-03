import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  ChevronDown,
  MoreVertical,
  FileText,
  Settings,
  Grid,
  Edit,
  
  Trash2,
  HelpCircle,
  Download,
} from "lucide-react";

import { salesInvoiceService } from "../../services/salesInvoiceService";
import { creditNoteService } from "../../services/creditNoteService";
import { toast } from "react-hot-toast";
export default function CreditInvoiceNote() {
  const navigate = useNavigate();
  // =========================
  // STATES
  // =========================
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [creditNotes, setCreditNotes] = useState([]);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showBulkDropdown, setShowBulkDropdown] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState("Last 365 Days");

  const [loading, setLoading] = useState(false);

  // REAL API DATA


  // PAGINATION
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  // STATS


  const dateDropdownRef = useRef(null);
  const bulkDropdownRef = useRef(null);
  const searchRef = useRef(null);

    const fetchCreditNotes = async () => {
  try {
    setLoading(true);

    const response = await creditNoteService.getAll();
    console.log("CREDIT NOTES =>", response.data.creditNotes);

    console.log(response.data);

    setCreditNotes(
      response.data.creditNotes || []
    );
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchCreditNotes();
}, []);


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
    window.location.href = "/credit-note/create";
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

const handleDeleteCreditNote = async (id) => {
  try {
    const ok = window.confirm("Delete this credit note?");
    if (!ok) return;

    await creditNoteService.delete(id);

    setCreditNotes((prev) =>
      prev.filter((item) => item._id !== id)
    );

    toast.success("Credit note deleted");
  } catch (error) {
    toast.error(
      error?.response?.data?.message || "Delete failed"
    );
  }
};
  

const handleEditCreditNote = (id) => {
  navigate(`/credit-note/edit/${id}`);
};
const handleViewCreditNote = (id) => {
  navigate(`/credit-note/view/${id}`);
};

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans relative select-none">
      {/* Top Header Row */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Credit Notes</h1>

        
      </div>

      {/* Stats Cards */}


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
                  placeholder="Search Credit Notes"
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
            Create Credit Note
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      {/* Credit Notes Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f1f3f5] text-gray-600 text-xs font-semibold uppercase border-b border-gray-200">
             

              <th className="py-3 px-4">Date</th>

              <th className="py-3 px-4">Credit Note Number</th>

              <th className="py-3 px-4">Party Name</th>

              <th className="py-3 px-4">Invoice No</th>

              <th className="py-3 px-4">Amount</th>

              <th className="py-3 px-4">Status</th>

              <th className="py-3 px-4 w-12"></th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-500">
                  Loading credit notes...
                </td>
              </tr>
            ) : creditNotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  No credit notes found
                </td>
              </tr>
            ) : (
              creditNotes.map((creditNote, index) => (
                <tr
                  key={creditNote._id}
                  onClick={() =>
                    handleViewCreditNote(
                      creditNote._id
                    )
                  }

                className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                  activeMenuIndex === index ? "bg-slate-50" : ""
                }`}
              >
                  

                <td className="py-4 px-4 text-gray-500">
                  {formatDate(creditNote.creditNoteDate)}
                </td>

                                <td className="py-4 px-4 font-medium text-gray-700">
                  {creditNote.fullCreditNoteNumber}
                </td>

                <td className="py-4 px-4 font-medium text-gray-800">
                  {creditNote.party?.name}
                </td>

                <td className="py-4 px-4 text-gray-700">
                  {creditNote.salesInvoiceNumber}
                </td>

                <td className="py-4 px-4 font-semibold text-gray-800">
                  ₹ {Number(
                      creditNote.invoiceData?.totalAmount || 0
                    ).toLocaleString("en-IN")}
                </td>

                  <td className="py-4 px-4">
                    <span
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      creditNote.status === "Refunded"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : creditNote.status === "Unpaid"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {creditNote.status}
                  </span>
                  </td>

                  <td className="py-4 px-4 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActionMenu(index, e);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuIndex === index && (
                      <div className="absolute right-12 top-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            handleViewCreditNote(
                              creditNote._id
                            );

                            setActiveMenuIndex(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FileText size={16} />
                          View
                        </button>
                        {/* <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCreditNote(
                            creditNote._id
                          );
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit size={16} />
                        Edit
                      </button> */}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCreditNote(
                              creditNote._id
                            );
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2
                            size={16}
                            className="text-red-500"
                          />
                          Delete
                        </button>

                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
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
