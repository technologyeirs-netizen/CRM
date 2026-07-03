export default function InvoiceMetaSection({
  settings,

  isEditMode,

  invoicePrefix,
  setInvoicePrefix,

  invoiceNumber,
  setInvoiceNumber,

  invoiceDate,
  setInvoiceDate,

  paymentTerms,
  setPaymentTerms,

  dueDate,
  setDueDate,
}) {
  const displayPrefix = invoicePrefix || "";

  return (
    <div className="lg:col-span-5 grid grid-cols-3 gap-3 border-l border-gray-100 pl-4">

      {/* Invoice Prefix */}

      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Invoice Prefix:
        </label>

        <input
          type="text"
          value={displayPrefix}
          disabled={isEditMode}
          onChange={(e) =>
            setInvoicePrefix(e.target.value)
          }
          className={`w-full border rounded px-2 py-1.5 outline-none ${
            isEditMode
              ? "bg-gray-200 cursor-not-allowed text-gray-500"
              : "bg-gray-100 border-transparent"
          }`}
        />
      </div>

      {/* Invoice Number */}

      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Invoice Number:
        </label>

        <input
          type="text"
          value={invoiceNumber}
          disabled={isEditMode}
          onChange={(e) =>
            setInvoiceNumber(e.target.value)
          }
          className={`w-full border rounded px-2 py-1.5 outline-none ${
            isEditMode
              ? "bg-gray-200 cursor-not-allowed text-gray-500"
              : "bg-gray-100 border-transparent"
          }`}
        />
      </div>

      {/* Invoice Date */}

      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Sales Invoice Date:
        </label>

        <input
          type="date"
          value={invoiceDate}
          onChange={(e) =>
            setInvoiceDate(e.target.value)
          }
          className="w-full border border-gray-300 rounded px-2 py-1 outline-none text-gray-700"
        />
      </div>

      {/* Payment Section */}

      <div className="col-span-3 border border-dashed border-gray-300 rounded p-3 mt-2 grid grid-cols-2 gap-3">

        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Payment Terms:
          </label>

          <div className="flex items-center border border-gray-300 rounded overflow-hidden">

            <input
              type="number"
              value={
                paymentTerms ??
                settings?.invoicePreferences?.defaultPaymentTerms ??
                0
              }
              onChange={(e) =>
                setPaymentTerms(
                  Number(e.target.value)
                )
              }
              className="w-full px-2 py-1 outline-none text-right"
            />

            <span className="bg-gray-100 px-2 py-1 text-xs text-gray-500 border-l">
              days
            </span>

          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Due Date:
          </label>

          <input
            type="date"
            value={dueDate}
            onChange={(e) =>
              setDueDate(e.target.value)
            }
            className="w-full border border-gray-300 rounded px-2 py-1 outline-none text-gray-700"
          />
        </div>

      </div>

    </div>
  );
}