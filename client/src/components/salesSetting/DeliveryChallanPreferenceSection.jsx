export default function DeliveryChallanPreferenceSection({
  settings,
  setSettings,
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Delivery Challan Preferences
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Delivery Challan Prefix
          </label>

          <input
            type="text"
            value={
              settings.deliveryChallanPreferences
                ?.deliveryChallanPrefix || ""
            }
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                deliveryChallanPreferences: {
                  ...prev.deliveryChallanPreferences,
                  deliveryChallanPrefix: e.target.value,
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
              settings.deliveryChallanPreferences
                ?.financialYear || ""
            }
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                deliveryChallanPreferences: {
                  ...prev.deliveryChallanPreferences,
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
            Current Delivery Challan Number
          </label>

          <input
            type="number"
            value={
              settings.deliveryChallanPreferences
                ?.currentDeliveryChallanNumber || 1
            }
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                deliveryChallanPreferences: {
                  ...prev.deliveryChallanPreferences,
                  currentDeliveryChallanNumber: Number(
                    e.target.value
                  ),
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