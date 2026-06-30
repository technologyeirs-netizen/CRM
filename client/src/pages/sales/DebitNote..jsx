import React, { useMemo, useRef, useState } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  CalendarDays,
  Eye,
  Pencil,
  Trash2,
  Download,
  Filter,
  MoreVertical,
  FileText,
  X,
  Check,
} from "lucide-react";

const initialDebitNotes = [
  {
    id: 1,
    date: "2026-05-20",
    debitNo: "DN-2026-001",
    party: "Apex Infosys Pvt Ltd",
    purchaseNo: "PO-1021",
    amount: 12500,
    status: "Paid",
  },
  {
    id: 2,
    date: "2026-05-18",
    debitNo: "DN-2026-002",
    party: "Skyline Traders",
    purchaseNo: "PO-1022",
    amount: 8500,
    status: "Pending",
  },
  {
    id: 3,
    date: "2026-05-15",
    debitNo: "DN-2026-003",
    party: "Moonlight Enterprises",
    purchaseNo: "PO-1023",
    amount: 19200,
    status: "Overdue",
  },
];

const filterOptions = [
  "All Status",
  "Paid",
  "Pending",
  "Overdue",
];

const dateOptions = [
  "Today",
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "Last 365 Days",
];

export default function DebitNotePage() {
  const [search, setSearch] = useState("");
  const [selectedDays, setSelectedDays] =
    useState("Last 365 Days");

  const [selectedFilter, setSelectedFilter] =
    useState("All Status");

  const [showDateDropdown, setShowDateDropdown] =
    useState(false);

  const [showFilterDropdown, setShowFilterDropdown] =
    useState(false);

  const [actionMenu, setActionMenu] =
    useState(null);

  const [notes, setNotes] = useState(
    initialDebitNotes
  );

  const dateRef = useRef();
  const filterRef = useRef();

  /* =========================
      FILTER + SEARCH
  ========================= */

  const filteredData = useMemo(() => {
    let filtered = [...notes];

    if (search) {
      filtered = filtered.filter((item) =>
        `${item.party} ${item.debitNo} ${item.purchaseNo}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (selectedFilter !== "All Status") {
      filtered = filtered.filter(
        (item) =>
          item.status === selectedFilter
      );
    }

    return filtered;
  }, [search, selectedFilter, notes]);

  /* =========================
      DELETE
  ========================= */

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Delete this debit note?"
    );

    if (confirmDelete) {
      setNotes((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }
  };

  /* =========================
      STATUS STYLE
  ========================= */

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";

      case "Pending":
        return "bg-amber-50 text-amber-600 border border-amber-200";

      case "Overdue":
        return "bg-red-50 text-red-600 border border-red-200";

      default:
        return "bg-slate-50 text-slate-600 border border-slate-200";
    }
  };

  /* =========================
      FORMAT DATE
  ========================= */

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-5">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-6">
        <div>
          <h1 className="text-[30px] font-bold text-slate-800">
            Debit Notes
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage supplier debit notes &
            adjustments
          </p>
        </div>

        <button className="h-12 px-6 rounded-2xl bg-[#5b3df5] hover:bg-[#4d31de] text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all">
          <Plus size={18} />
          Create Debit Note
        </button>
      </div>

      {/* ================= FILTER BAR ================= */}

      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm mb-6">
        <div className="flex flex-col xl:flex-row xl:items-center gap-4">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search debit note, party, purchase no..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full h-12 rounded-2xl border border-slate-200 bg-white pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#5b3df5]"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X
                  size={16}
                  className="text-slate-400"
                />
              </button>
            )}
          </div>

          {/* DATE DROPDOWN */}

          <div className="relative" ref={dateRef}>
            <button
              onClick={() =>
                setShowDateDropdown(
                  !showDateDropdown
                )
              }
              className="h-12 px-5 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 hover:bg-slate-50 transition-all"
            >
              <CalendarDays
                size={18}
                className="text-slate-500"
              />

              <span className="text-sm font-medium text-slate-700">
                {selectedDays}
              </span>

              <ChevronDown
                size={16}
                className={`transition-all ${
                  showDateDropdown
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {showDateDropdown && (
              <div className="absolute right-0 mt-3 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                {dateOptions.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSelectedDays(item);
                      setShowDateDropdown(false);
                    }}
                    className="w-full h-12 px-4 flex items-center justify-between hover:bg-slate-50 text-sm"
                  >
                    <span>{item}</span>

                    {selectedDays === item && (
                      <Check
                        size={16}
                        className="text-[#5b3df5]"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FILTER */}

          <div
            className="relative"
            ref={filterRef}
          >
            <button
              onClick={() =>
                setShowFilterDropdown(
                  !showFilterDropdown
                )
              }
              className="h-12 px-5 rounded-2xl border border-slate-200 bg-white flex items-center gap-2 hover:bg-slate-50 transition-all"
            >
              <Filter size={17} />

              <span className="text-sm font-medium">
                {selectedFilter}
              </span>

              <ChevronDown
                size={16}
                className={`transition-all ${
                  showFilterDropdown
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                {filterOptions.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSelectedFilter(item);
                      setShowFilterDropdown(false);
                    }}
                    className="w-full h-12 px-4 flex items-center justify-between hover:bg-slate-50 text-sm"
                  >
                    <span>{item}</span>

                    {selectedFilter === item && (
                      <Check
                        size={16}
                        className="text-[#5b3df5]"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* TOP */}

        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <FileText
                size={20}
                className="text-[#5b3df5]"
              />
            </div>

            <div>
              <h2 className="font-bold text-slate-800 text-lg">
                Debit Note List
              </h2>

              <p className="text-sm text-slate-500">
                Showing {filteredData.length} debit
                notes
              </p>
            </div>
          </div>

          <button className="w-11 h-11 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50">
            <Download size={18} />
          </button>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-[#f8faff] border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  #
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Date
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Debit Note No
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Party Name
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Purchase No
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Amount
                </th>

                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-[#fafcff] transition-all"
                  >
                    <td className="px-6 py-5 text-sm font-medium">
                      {index + 1}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>

                    <td className="px-6 py-5">
                      <span className="font-semibold text-[#5b3df5]">
                        {item.debitNo}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="font-medium text-slate-700">
                        {item.party}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {item.purchaseNo}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <span className="font-bold text-slate-800">
                        ₹{" "}
                        {item.amount.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center">
                          <Eye
                            size={17}
                            className="text-slate-600"
                          />
                        </button>

                        <button className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center">
                          <Pencil
                            size={16}
                            className="text-slate-600"
                          />
                        </button>

                        <button className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center">
                          <Download
                            size={17}
                            className="text-slate-600"
                          />
                        </button>

                        {/* ACTION MENU */}

                        <div className="relative">
                          <button
                            onClick={() =>
                              setActionMenu(
                                actionMenu ===
                                  item.id
                                  ? null
                                  : item.id
                              )
                            }
                            className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                          >
                            <MoreVertical
                              size={16}
                              className="text-slate-600"
                            />
                          </button>

                          {actionMenu === item.id && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                              <button className="w-full h-11 px-4 text-sm flex items-center gap-3 hover:bg-slate-50">
                                <Eye size={15} />
                                View Note
                              </button>

                              <button className="w-full h-11 px-4 text-sm flex items-center gap-3 hover:bg-slate-50">
                                <Pencil size={15} />
                                Edit Note
                              </button>

                              <button className="w-full h-11 px-4 text-sm flex items-center gap-3 hover:bg-slate-50">
                                <Download size={15} />
                                Download PDF
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    item.id
                                  )
                                }
                                className="w-full h-11 px-4 text-sm flex items-center gap-3 hover:bg-red-50 text-red-500"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="py-20 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                        <FileText
                          size={34}
                          className="text-slate-400"
                        />
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-slate-700">
                        No Debit Notes Found
                      </h3>

                      <p className="text-sm text-slate-500 mt-2">
                        Try changing filters or search
                        keyword
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}

        <div className="px-6 py-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredData.length}
            </span>{" "}
            results
          </p>

          <div className="flex items-center gap-2">
            <button className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium">
              Previous
            </button>

            <button className="w-10 h-10 rounded-xl bg-[#5b3df5] text-white text-sm font-semibold">
              1
            </button>

            <button className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}