import React from "react";

export default function CreditNoteItemsPreview({
  items = [],
  subtotal = 0,
  totalDiscount = 0,
  totalTax = 0,
}) {
  return (
    <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden font-sans">
      <div className="overflow-x-hidden">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th className="p-3 w-[4%] text-center">No</th>

              <th className="p-3 w-[28%]">
                Items / Services
              </th>

              <th className="p-3 w-[12%]">
                HSN / SAC
              </th>

              <th className="p-3 w-[10%]">
                Qty
              </th>

              <th className="p-3 w-[12%]">
                Price / Item (₹)
              </th>

              <th className="p-3 w-[10%]">
                Discount
              </th>

              <th className="p-3 w-[10%]">
                Tax
              </th>

              <th className="p-3 w-[14%]">
                Amount (₹)
              </th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {items.length > 0 ? (
              items.map((item, idx) => {
                const itemPrice =
                  Number(
                    item.salesPrice || 0
                  );

                const itemQty =
                  Number(
                    item.qty || 1
                  );

                const grossAmount =
                  itemPrice * itemQty;

                const discountAmount =
                  Number(
                    item.discountAmount || 0
                  );

                const taxableAmount =
                  grossAmount -
                  discountAmount;

                const taxAmount =
                  Number(
                    item.taxAmount || 0
                  );

                const finalAmount =
                  Number(
                    item.finalAmount ||
                      taxableAmount +
                        taxAmount
                  );

                return (
                  <tr
                    key={
                      item._id || idx
                    }
                    className="border-b border-gray-100 align-top text-gray-700"
                  >
                    {/* Serial Number */}

                    <td className="p-3 text-center text-gray-400 pt-4">
                      {idx + 1}
                    </td>

                    {/* Item */}

                    <td className="p-3 pt-4 break-words">
                      <div className="font-medium text-gray-900 mb-1.5">
                        {item.name}
                      </div>

                      {item.itemCode && (
                        <div className="bg-[#e9ecef] text-gray-600 text-xs px-2 py-1.5 rounded-md inline-block max-w-full border border-gray-100 truncate">
                          {
                            item.itemCode
                          }
                        </div>
                      )}

                      {item.description && (
                        <div className="mt-2 bg-[#e9ecef] text-gray-600 text-xs px-2 py-2 rounded-md border border-gray-100">
                          {
                            item.description
                          }
                        </div>
                      )}
                    </td>

                    {/* HSN */}

                    <td className="p-3 pt-4 text-gray-600 break-all">
                      {item.hsnCode ||
                        item.hsn ||
                        "—"}
                    </td>

                    {/* Qty */}

                    <td className="p-3 pt-4 border-l border-gray-100">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="border border-gray-200 bg-gray-50 text-gray-700 font-medium px-2.5 py-1 rounded text-center min-w-[32px]">
                          {
                            item.qty
                          }
                        </span>

                        <span className="text-xs text-gray-500 font-medium">
                          {item.measuringUnit ===
                          "#133"
                            ? "PCS"
                            : item.measuringUnit ||
                              "PCS"}
                        </span>
                      </div>
                    </td>

                    {/* Price */}

                    <td className="p-3 pt-4">
                      <div className="bg-[#e9ecef] text-gray-700 font-medium px-2.5 py-1 rounded inline-block w-full max-w-[100px] text-right">
                        {itemPrice.toFixed(
                          2
                        )}
                      </div>
                    </td>

                    {/* Discount */}

                    <td className="p-3 pt-4 border-l border-gray-100">
                      <div className="space-y-1">
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 font-semibold text-xs px-2.5 py-1.5 rounded-md inline-block">
                          ₹{" "}
                          {discountAmount.toFixed(
                            2
                          )}
                        </div>

                        <div className="text-[11px] text-gray-400 font-medium">
                          {item.discountOnSalesPrice ||
                            0}
                          % OFF
                        </div>
                      </div>
                    </td>

                    {/* Tax */}

                    <td className="p-3 pt-4 text-gray-600">
                      <div className="border border-gray-200 rounded px-2 py-1 w-20 bg-white text-gray-700 text-sm mb-1">
                        {item.tax ||
                          item.gstTaxRate ||
                          0}
                        %
                      </div>

                      <div className="text-[11px] text-gray-500 pl-1 font-medium">
                        ₹{" "}
                        {taxAmount.toFixed(
                          2
                        )}
                      </div>
                    </td>

                    {/* Amount */}

                    <td className="p-3 pt-4">
                      <div className="bg-[#e9ecef]/60 text-gray-800 font-semibold px-2.5 py-1 rounded inline-block w-full max-w-[110px] text-right">
                        ₹{" "}
                        {finalAmount.toFixed(
                          2
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-12 text-gray-400 text-sm font-medium"
                >
                  No items found
                </td>
              </tr>
            )}

            {/* Summary Row */}

            <tr className="bg-[#f8f9fa] border-t border-b border-gray-200 font-semibold text-gray-600 text-sm">
              <td
                colSpan="5"
                className="p-3 text-right text-xs uppercase tracking-wider font-bold text-gray-500"
              >
                Subtotal
              </td>

              <td className="p-3 text-gray-700 font-medium">
                ₹{" "}
                {Number(
                  totalDiscount
                ).toFixed(2)}
              </td>

              <td className="p-3 text-gray-700 font-medium">
                ₹{" "}
                {Number(
                  totalTax
                ).toFixed(2)}
              </td>

              <td className="p-3 text-gray-900 font-bold text-base">
                ₹{" "}
                {Number(
                  subtotal
                ).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}