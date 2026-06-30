// File: components/invoice/InvoiceGodownModal.jsx

import { Trash2 } from "lucide-react";

export default function InvoiceGodownModal({
  showGodownModal,
  selectedItemForGodown,
  setShowGodownModal,
  setSelectedItemForGodown,
  godownQty,
  setGodownQty,
  handleConfirmGodownAdd,
}) {
  if (
    !showGodownModal ||
    !selectedItemForGodown
  )
    return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-800">
                Add Item by Godown
              </h3>
              <button
                onClick={() => {
                  setShowGodownModal(false);
                  setSelectedItemForGodown(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Item Name
                </p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">
                  {selectedItemForGodown.name}
                </p>
              </div>

              <div className="border border-gray-100 rounded">
                <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 p-2 text-xs font-semibold text-gray-500">
                  <div className="col-span-8">Godown</div>
                  <div className="col-span-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        setGodownQty((prev) => Math.max(1, prev - 1))
                      }
                      className="w-8 h-8 rounded border border-gray-300"
                    >
                      -
                    </button>

                    <span className="min-w-[30px] text-center font-semibold">
                      {godownQty}
                    </span>

                    <button
                      onClick={() =>
                        setGodownQty((prev) =>
                          Math.min(
                            selectedItemForGodown.openingStock || 0,
                            prev + 1,
                          ),
                        )
                      }
                      className="w-8 h-8 rounded border border-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <div className="col-span-4 text-right">Stock Quantity</div>
                </div>

                <div className="grid grid-cols-12 p-3 text-xs items-center border-b border-gray-50">
                  <div className="col-span-8">
                    <p className="font-semibold text-gray-700">
                      EIRS TECHNOLOGY KRISHNA NA...
                    </p>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Stock: {selectedItemForGodown.openingStock || 0}
                    </p>
                  </div>
                  <div className="col-span-4 text-right">
                    <button
                      onClick={handleConfirmGodownAdd}
                      className="bg-blue-50 text-blue-600 font-semibold px-4 py-1.5 rounded border border-blue-200 hover:bg-blue-600 hover:text-white transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button className="text-blue-600 text-xs font-medium hover:underline">
                  + View All Godowns
                </button>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowGodownModal(false);
                  setSelectedItemForGodown(null);
                }}
                className="border border-gray-300 rounded px-4 py-1.5 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmGodownAdd}
                className="bg-indigo-600 text-white font-medium px-5 py-1.5 rounded text-xs hover:bg-indigo-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
  );
}