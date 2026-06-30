 

export default function InvoiceSummarySection({
  // Discount
  globalDiscount,
  setGlobalDiscount,
  isDiscountOpen,
  setIsDiscountOpen,

  // Additional Charges
  additionalCharges,
  setAdditionalCharges,
  isAdditionalChargesOpen,
  setIsAdditionalChargesOpen,

  // Calculations
  taxableAmount,
  totalAmount,
  balanceAmount,
  roundOffDifference,
  tcsAmount,

  // TCS
  applyTCS,
  setApplyTCS,
  selectedTCS,
  setSelectedTCS,
  tcsRates,

  // Round Off
  autoRoundOff,
  setAutoRoundOff,

  // Payment
  markAsPaid,
  setMarkAsPaid,
  amountReceived,
  setAmountReceived,
  paymentMode,
  setPaymentMode,
}) {
  return (
<div className="lg:col-span-6 bg-white border border-gray-200 rounded-md p-4 shadow-sm space-y-4">
            <div className="space-y-3">
              {/* Discount Input Block toggled open ready */}
              <div className="border border-gray-100 rounded p-2.5 bg-gray-50/50">
           
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-gray-600">
                    Discount Allocation
                  </span>
                  <button
                    onClick={() => setIsDiscountOpen(!isDiscountOpen)}
                    className="text-[11px] text-gray-400 hover:text-gray-600"
                  >
                    {isDiscountOpen ? "Minimize" : "Expand"}
                  </button>
                </div>
                {isDiscountOpen && (
                  <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden w-full max-w-xs">
                    <span className="bg-gray-50 px-2.5 text-gray-400 text-xs border-r">
                      %
                    </span>
                    <input
                      type="number"
                    value={globalDiscount}
onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs outline-none font-medium text-right"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              {/* Additional Charges Input Block toggled open ready */}
              <div className="border border-gray-100 rounded p-2.5 bg-gray-50/50">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-gray-600">
                    Additional Charges (Freight, Shipping, etc.)
                  </span>
                  <button
                    onClick={() =>
                      setIsAdditionalChargesOpen(!isAdditionalChargesOpen)
                    }
                    className="text-[11px] text-gray-400 hover:text-gray-600"
                  >
                    {isAdditionalChargesOpen ? "Minimize" : "Expand"}
                  </button>
                </div>
                {isAdditionalChargesOpen && (
                  <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden w-full max-w-xs">
                    <span className="bg-gray-50 px-2.5 text-gray-400 text-xs border-r">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={additionalCharges}
                      onChange={(e) =>
                        setAdditionalCharges(Number(e.target.value))
                      }
                      className="w-full px-2 py-1 text-xs outline-none font-medium text-right"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              {/* Live Taxable Amount Display */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-500 font-medium text-xs">
                  Taxable Amount
                </span>
                <span className="font-mono font-bold text-sm text-gray-800">
                  ₹ {taxableAmount}
                </span>
              </div>
            </div>

            {/* TCS Checkbox */}
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyTCS}
                    onChange={(e) => setApplyTCS(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Apply TCS
                </label>
              </div>

              {applyTCS && (
  <div className="space-y-3">

    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        Select TCS Rate
      </label>

      <select
        value={selectedTCS?.label || ""}
        onChange={(e) => {
          const selected = tcsRates.find(
            (tcs) => tcs.label === e.target.value
          );

          setSelectedTCS(selected);
        }}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
      >
        <option value="">Choose TCS Rate</option>

        {tcsRates.map((tcs, index) => (
          <option key={index} value={tcs.label}>
            {tcs.label}
          </option>
        ))}
      </select>
    </div>

    {selectedTCS && (
      <div className="flex justify-between items-center border-t pt-2">
        <span className="text-sm text-gray-500">
          TCS Amount ({selectedTCS.rate}%)
        </span>

        <span className="font-bold text-indigo-600">
          ₹ {tcsAmount.toFixed(2)}
        </span>
      </div>
    )}
  </div>
)}
            </div>

            <hr className="border-gray-100" />

            {/* Auto roundoff block */}
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRoundOff}
                    onChange={(e) => setAutoRoundOff(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Auto Round Off
                </label>

                <span className="text-sm font-semibold text-emerald-600">
                  ₹ {roundOffDifference.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Total Amount Header Box */}
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="font-bold text-gray-700 text-base">
                Total Amount
              </span>
              <input
                type="text"
                value={`₹ ${totalAmount}`}
                disabled
                className="bg-gray-200 border border-gray-300 text-right px-3 py-1.5 rounded text-gray-700 font-bold w-48 text-sm outline-none"
              />
            </div>

            <div className="flex justify-end">
              <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer">
                <span>Mark as fully paid</span>
               <input
  type="checkbox"
  checked={markAsPaid}
  onChange={(e) => {
    const checked = e.target.checked;

    setMarkAsPaid(checked);

    if (checked) {
      setAmountReceived(totalAmount);
    } else {
      setAmountReceived(0);
    }
  }}
  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
/>
              </label>
            </div>

            {/* Amount Received Entry row wrapper */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                Amount Received
              </span>
              <div className="flex items-center border border-gray-300 rounded overflow-hidden w-64 bg-gray-50">
                <span className="px-2.5 text-gray-400 text-xs">₹</span>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-sm bg-white outline-none font-semibold text-gray-800 text-right"
                />
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="bg-gray-50 border-l px-2 py-1.5 text-xs outline-none text-gray-600 font-medium"
                >
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
            </div>

            {/* Dynamic Balance Amount */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
              <span className="text-green-600 font-semibold">
                Balance Amount
              </span>
              <span className="text-green-600 font-bold text-sm font-mono">
                ₹ {balanceAmount}
              </span>
            </div>

            {/* Authorized Signatory signature canvas */}
            <div className="pt-6 flex flex-col items-end justify-center text-center">
              <p className="text-xs text-gray-400 mb-2">
                Authorized signatory for{" "}
                <span className="font-semibold text-gray-700">
                  EIRS TECHNOLOGY
                </span>
              </p>
              <div className="h-14 w-40 border-b border-gray-300 flex items-center justify-center opacity-70 italic font-serif text-gray-500 text-lg">
                Authorized Sign
              </div>
            </div>
          </div>
  );
}