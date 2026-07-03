import React from "react";

export default function InvoicePreferenceSection({
  settings,
  setSettings,
}) {
  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,

      invoicePreferences: {
        ...prev.invoicePreferences,
        [field]: value,
      },
    }));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Invoice Preferences
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Invoice Prefix
          </label>

          <input
            type="text"
            value={
              settings.invoicePreferences
                ?.invoicePrefix || ""
            }
            onChange={(e) =>
              handleChange(
                "invoicePrefix",
                e.target.value
              )
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
              settings.invoicePreferences
                ?.financialYear || ""
            }
            onChange={(e) =>
              handleChange(
                "financialYear",
                e.target.value
              )
            }
            placeholder="25-26"
            className="w-full h-11 rounded-xl border border-slate-300 px-4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Current Invoice Number
          </label>

          <input
            type="number"
            value={
              settings.invoicePreferences
                ?.currentInvoiceNumber || 1
            }
            onChange={(e) =>
              handleChange(
                "currentInvoiceNumber",
                Number(e.target.value)
              )
            }
            className="w-full h-11 rounded-xl border border-slate-300 px-4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Default Payment Terms (Days)
          </label>

          <input
            type="number"
            value={
              settings.invoicePreferences
                ?.defaultPaymentTerms || 0
            }
            onChange={(e) =>
              handleChange(
                "defaultPaymentTerms",
                Number(e.target.value)
              )
            }
            className="w-full h-11 rounded-xl border border-slate-300 px-4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Default Payment Mode
          </label>

          <select
            value={
              settings.invoicePreferences
                ?.defaultPaymentMode || "Cash"
            }
            onChange={(e) =>
              handleChange(
                "defaultPaymentMode",
                e.target.value
              )
            }
            className="w-full h-11 rounded-xl border border-slate-300 px-4"
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Cheque</option>
            <option>Bank Transfer</option>
          </select>
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Default Template
          </label>

          <select
            value={
              settings.invoicePreferences
                ?.defaultTemplate || "classic"
            }
            onChange={(e) =>
              handleChange(
                "defaultTemplate",
                e.target.value
              )
            }
            className="w-full h-11 rounded-xl border border-slate-300 px-4"
          >
            <option value="classic">
              Classic
            </option>

            <option value="modern">
              Modern
            </option>

            <option value="minimal">
              Minimal
            </option>
          </select>
        </div> */}

      </div>

      {/* <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mt-8">

        {[
          {
            key: "showLogo",
            label: "Show Logo",
          },
          {
            key: "showSignature",
            label: "Show Signature",
          },
          {
            key: "showBankDetails",
            label: "Show Bank",
          },
          {
            key: "showTermsAndConditions",
            label: "Show Terms",
          },
          {
            key: "autoRoundOff",
            label: "Auto Round Off",
          },
        ].map((item) => (
          <div
            key={item.key}
            className="border rounded-2xl p-4 flex items-center justify-between"
          >
            <span className="text-sm font-medium">
              {item.label}
            </span>

            <input
              type="checkbox"
              checked={
                settings.invoicePreferences?.[
                  item.key
                ] || false
              }
              onChange={(e) =>
                handleChange(
                  item.key,
                  e.target.checked
                )
              }
            />
          </div>
        ))}

      </div> */}

    </div>
  );
}