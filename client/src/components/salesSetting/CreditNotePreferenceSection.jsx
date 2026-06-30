export default function CreditNotePreferenceSection({
  settings,
  setSettings,
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Credit Note Preferences
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Credit Note Prefix
          </label>

          <input
            type="text"
            value={
              settings.creditNotePreferences?.creditNotePrefix || ""
            }
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                creditNotePreferences: {
                  ...prev.creditNotePreferences,
                  creditNotePrefix: e.target.value,
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
              settings.creditNotePreferences?.financialYear || ""
            }
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                creditNotePreferences: {
                  ...prev.creditNotePreferences,
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
            Current Credit Note Number
          </label>

          <input
            type="number"
            value={
              settings.creditNotePreferences?.currentCreditNoteNumber || 1
            }
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                creditNotePreferences: {
                  ...prev.creditNotePreferences,
                  currentCreditNoteNumber: Number(e.target.value),
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