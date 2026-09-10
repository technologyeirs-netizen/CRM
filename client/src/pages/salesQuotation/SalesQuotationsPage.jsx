import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  FileText,
  Edit,
  Trash2,
  HelpCircle,
  ArrowRightLeft,
} from "lucide-react";

import { salesQuotationService } from "../../services/salesQuotationService";
import { toast } from "react-hot-toast";

export default function SalesQuotationsPage() {
  const navigate = useNavigate();

  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const menuRef = useRef(null);

  const fetchQuotations = async () => {
    try {
      setLoading(true);

      const response = await salesQuotationService.getAll({ page, limit });

      setQuotations(response?.data?.quotations || []);

      const total = response?.data?.total || 0;
      setTotalPages(Math.ceil(total / limit) || 1);
    } catch (error) {
      console.error("FETCH SALES QUOTATIONS ERROR =>", error);
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuIndex(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const toggleActionMenu = (index, e) => {
    e.stopPropagation();
    setActiveMenuIndex((prev) => (prev === index ? null : index));
  };

  const handleViewQuotation = (id) => {
    navigate(`/sales-quotations/view/${id}`);
  };

  const handleEditQuotation = (id) => {
    navigate(`/sales-quotations/create?id=${id}`);
  };

  const handleCreateQuotationRedirect = () => {
    navigate("/sales-quotations/create");
  };

  const handleDeleteQuotation = async (id) => {
    try {
      const ok = window.confirm("Are you sure you want to delete this quotation?");
      if (!ok) return;

      await salesQuotationService.remove(id);

      setQuotations((prev) => prev.filter((item) => item._id !== id));

      toast.success("Quotation deleted successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete quotation"
      );
    }
  };

  // =========================
  // CONVERT QUOTATION TO INVOICE
  // (this is what actually deducts item stock)
  // =========================
  const handleConvertToInvoice = async (id) => {
    try {
      const ok = window.confirm(
        "Convert this quotation to a Sales Invoice? This will deduct the item quantities from stock."
      );
      if (!ok) return;

      const res = await salesQuotationService.convertToInvoice(id, {});

      if (res.data.success) {
        toast.success("Quotation converted to Sales Invoice successfully");

        setActiveMenuIndex(null);

        navigate("/invoice");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to convert quotation to invoice"
      );
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans relative select-none">
      {/* Top Header Row */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Sales Quotations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Item quantity is not reduced when a quotation is created -
            it is only deducted once the quotation is converted to an
            invoice.
          </p>
        </div>

        <button
          onClick={handleCreateQuotationRedirect}
          className="bg-[#4f46e5] text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-[#4338ca] transition-colors whitespace-nowrap h-[40px]"
        >
          Create Sales Quotation
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f1f3f5] text-gray-600 text-xs font-semibold uppercase border-b border-gray-200">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Quotation Number</th>
              <th className="py-3 px-4">Party Name</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 w-12"></th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">
                  Loading quotations...
                </td>
              </tr>
            ) : quotations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  No quotations found
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
                    {formatDate(quotation.date)}
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-semibold text-indigo-600 hover:underline">
                      {quotation.quotationNumber}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-medium text-gray-800">
                    {quotation.partyName}
                  </td>

                  <td className="py-4 px-4 font-semibold text-gray-800">
                    ₹ {Number(quotation.amount || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        quotation.status === "Converted"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      }`}
                    >
                      {quotation.status}
                    </span>
                    {quotation.status === "Converted" &&
                      quotation.convertedInvoiceNumber && (
                        <div className="text-[11px] text-gray-400 font-normal mt-1">
                          Invoice: {quotation.convertedInvoiceNumber}
                        </div>
                      )}
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
                        className="absolute right-12 top-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 divide-y divide-gray-50"
                      >
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewQuotation(quotation._id);
                              setActiveMenuIndex(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <FileText size={16} className="text-gray-500" />
                            View
                          </button>
                        </div>

                        {quotation.status !== "Converted" && (
                          <>
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditQuotation(quotation._id);
                                  setActiveMenuIndex(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit size={16} className="text-gray-500" />
                                Edit
                              </button>
                            </div>

                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConvertToInvoice(quotation._id);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <ArrowRightLeft
                                  size={16}
                                  className="text-gray-500"
                                />
                                Convert to Invoice
                              </button>
                            </div>

                            <div className="py-1">
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
                          </>
                        )}
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
