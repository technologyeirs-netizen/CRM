import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  FileText,
  Trash2,
  HelpCircle,
} from "lucide-react";

import { convertedQuotationService } from "../../services/convertedQuotationService";
import { toast } from "react-hot-toast";

export default function ConvertedQuotationsPage() {
  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);

  // PAGINATION (client side, matches CreditNote list pattern)
  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPages = 1;

  const menuRef = useRef(null);

  const fetchQuotations = async () => {
    try {
      setLoading(true);

      const response = await convertedQuotationService.getAll();

      setQuotations(response.data.quotations || []);
    } catch (error) {
      console.error("FETCH CONVERTED QUOTATIONS ERROR =>", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuIndex(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  // MENU
  // =========================
  const toggleActionMenu = (index, e) => {
    e.stopPropagation();

    setActiveMenuIndex((prev) => (prev === index ? null : index));
  };

  // =========================
  // VIEW
  // =========================
  const handleViewQuotation = (id) => {
    navigate(`/converted-quotations/view/${id}`);
  };

  // =========================
  // DELETE
  // =========================
  const handleDeleteQuotation = async (id) => {
    try {
      const ok = window.confirm(
        "Delete this converted quotation? The stock deducted for it will be restored."
      );
      if (!ok) return;

      await convertedQuotationService.delete(id);

      setQuotations((prev) => prev.filter((item) => item._id !== id));

      toast.success("Converted quotation deleted");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete quotation"
      );
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans relative select-none">
      {/* Top Header Row */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Converted Quotations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Invoices that were converted to a quotation. Converting an
            invoice deducts its item quantities from stock.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f1f3f5] text-gray-600 text-xs font-semibold uppercase border-b border-gray-200">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Quotation Number</th>
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
                  Loading converted quotations...
                </td>
              </tr>
            ) : quotations.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  No converted quotations found. Convert an invoice from the
                  Invoices page to see it here.
                </td>
              </tr>
            ) : (
              quotations.map((quotation, index) => (
                <tr
                  key={quotation._id}
                  onClick={() => handleViewQuotation(quotation._id)}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                    activeMenuIndex === index ? "bg-slate-50" : ""
                  }`}
                >
                  <td className="py-4 px-4 text-gray-500">
                    {formatDate(quotation.quotationDate)}
                  </td>

                  <td className="py-4 px-4 font-medium text-gray-700">
                    {quotation.fullQuotationNumber}
                  </td>

                  <td className="py-4 px-4 font-medium text-gray-800">
                    {quotation.party?.name}
                  </td>

                  <td className="py-4 px-4 text-gray-700">
                    {quotation.salesInvoiceNumber}
                  </td>

                  <td className="py-4 px-4 font-semibold text-gray-800">
                    ₹{" "}
                    {Number(quotation.totalAmount || 0).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {quotation.status}
                    </span>
                  </td>

                  <td
                    className="py-4 px-4 text-right relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => toggleActionMenu(index, e)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuIndex === index && (
                      <div
                        ref={menuRef}
                        className="absolute right-12 top-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewQuotation(quotation._id);
                            setActiveMenuIndex(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FileText size={16} />
                          View
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuotation(quotation._id);
                            setActiveMenuIndex(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} className="text-red-500" />
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
