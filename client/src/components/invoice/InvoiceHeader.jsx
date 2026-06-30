
import { ArrowLeft, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InvoiceHeader({
  isEditMode,
  handleBackRedirect,
  handleSaveInvoice,
  title,
}) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">

      <div className="px-6 py-4 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <button
            onClick={handleBackRedirect}
            className="w-11 h-11 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div>

            <h1 className="text-2xl font-bold text-slate-800">

              {title ||
                (isEditMode
                  ? "Update Sales Invoice"
                  : "Create Sales Invoice")}

            </h1>

            <p className="text-sm text-slate-500">

              Create and manage customer invoices

            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => navigate("/sales-settings")}
            className="flex items-center gap-2 border border-slate-300 px-4 h-11 rounded-xl hover:bg-slate-100 transition"
          >

            <Settings size={17} />

            Settings

          </button>

          <button
            className="h-11 px-5 rounded-xl border border-slate-300 text-slate-500 cursor-not-allowed"
          >
            Save & New
          </button>

          <button
            onClick={handleSaveInvoice}
            className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition"
          >

            {isEditMode
              ? "Update Invoice"
              : "Save Invoice"}

          </button>

        </div>

      </div>

    </header>
  );
}