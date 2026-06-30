import React from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SalesSettingHeader({
handleSave,
saving,
}) {
const navigate = useNavigate();

return ( <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

  <div className="px-8 py-6 flex items-center justify-between">

    <div className="flex items-center gap-5">

      <button
        onClick={() => navigate(-1)}
        className="w-12 h-12 rounded-2xl border border-slate-200 hover:bg-slate-100 transition flex items-center justify-center"
      >
        <ArrowLeft size={20} />
      </button>

      <div>

        <h1 className="text-4xl font-bold text-slate-800">
          Sales Settings
        </h1>

        <p className="text-base text-slate-500 mt-1">
          Configure Company, Bank Accounts & Invoice Settings
        </p>

      </div>

    </div>

    <button
      disabled={saving}
      onClick={handleSave}
      className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white flex items-center gap-3 shadow-lg transition"
    >
      <Save size={18} />

      {saving
        ? "Saving..."
        : "Save Settings"}

    </button>

  </div>

</div>


);
}
