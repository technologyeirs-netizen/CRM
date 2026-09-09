export default function QuotationPreferenceSection({
  settings,
  setSettings,
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Sales Quotation Preferences
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Quotation Prefix
          </label>

          <input
            type="text"
            value={
              settings.quotationPreferences?.quotationPrefix || ""
            }
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                quotationPreferences: {
                  ...prev.quotationPreferences,
                  quotationPrefix: e.target.value,
                },
              }))
            }
            className="w-full h-11 rounded-xl border border-slate-300 px-4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Financial Year
          </label>

          <input
            type="text"
            value={
              settings.quotationPreferences?.financialYear || ""
            }
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                quotationPreferences: {
                  ...prev.quotationPreferences,
                  financialYear: e.target.value,
                },
              }))
            }
            className="w-full h-11 rounded-xl border border-slate-300 px-4"
            placeholder="26-27"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Current Quotation Number
          </label>

          <input
            type="number"
            value={
              settings.quotationPreferences?.currentQuotationNumber || 1
            }
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                quotationPreferences: {
                  ...prev.quotationPreferences,
                  currentQuotationNumber: Number(e.target.value),
                },
              }))
            }
            className="w-full h-11 rounded-xl border border-slate-300 px-4"
          />
        </div>

      </div>
    </div>
  );
}
