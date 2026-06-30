import { Trash2 } from "lucide-react";

export default function InvoiceItemsTable({
  invoiceItems,
  setInvoiceItems,
  globalDiscount,
  totalDiscount,
  totalTax,
  subtotal,
  setShowItemModal,
  
}) {
    console.log("invoiceItems state =>", invoiceItems);
  return (
     <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden font-sans">
              <div className="overflow-x-hidden">
                <table className="w-full text-left border-separate border-spacing-0 ">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="p-3 w-[4%] text-center">No</th>
                      <th className="p-3 w-[28%]">Items/ Services</th>
                      <th className="p-3 w-[12%]">HSN/ SAC</th>
                      <th className="p-3 w-[10%]">Qty</th>
                      <th className="p-3 w-[12%]">Price/Item (₹)</th>
                      <th className="p-3 w-[10%]">Discount</th>
                      <th className="p-3 w-[10%]">Tax</th>
                      <th className="p-3 w-[14%]">Amount (₹)</th>
                      <th className="p-3 w-[4%] text-center"></th>
                    </tr>
                  </thead>
    
                  <tbody className="text-sm">
                    {/* ITEMS LIST */}
                    {invoiceItems.length > 0 ? (
                      invoiceItems.map((item, idx) => {
                        // PRICE
                        const itemPrice = item.salesPrice || 0;
                        const itemQty = item.qty || 1;
    
                        // GROSS
                        const grossAmount = itemPrice * itemQty;
    
                        // DISCOUNT
                       const itemDiscountAmount =
      (grossAmount * (item.discountOnSalesPrice || 0)) / 100;
    
    const globalDiscountAmount =
      (grossAmount * (globalDiscount || 0)) / 100;
    
    const calculatedDiscountAmount =
      itemDiscountAmount + globalDiscountAmount;
    
                        // TAXABLE
                        const itemTaxableAmount =
                          grossAmount - calculatedDiscountAmount;
    
                        // TAX
                        const calculatedTaxAmount =
                          (itemTaxableAmount * (item.tax || item.gstTaxRate || 0)) /
                          100;
    
                        // FINAL
                        const finalAmount = itemTaxableAmount + calculatedTaxAmount;
    
                        return (
                          <tr
                            key={item._id}
                            className="border-b border-gray-100 align-top hover:bg-indigo-50/30 text-gray-700 transition-colors"
                          >
                            {/* Serial Number */}
                            <td className="p-3 text-center text-gray-400 pt-4">
                              {idx + 1}
                            </td>
    
                            {/* Item Name + Item Code Container */}
                            <td className="p-3 pt-4 break-words">
                              <div className="font-medium text-gray-900 mb-1.5">
                                {item.name}
                              </div>
    
                              {item.itemCode && (
                                <div className="bg-[#e9ecef] text-gray-600 text-xs px-2 py-1.5 rounded-md inline-block max-w-full font-normal border border-gray-100 truncate">
                                  {item.itemCode}
                                </div>
                              )}
                            </td>
    
                            {/* HSN Code from API */}
                            <td className="p-3 pt-4 text-gray-600 font-normal break-all">
                              {item.hsnCode || item.hsn || "—"}
                            </td>
    
                            {/* Qty Box with Dynamic Measuring Unit */}
                            <td className="p-3 pt-4 border-l border-gray-100">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="border border-gray-200 bg-gray-50 text-gray-700 font-medium px-2.5 py-1 rounded text-center min-w-[32px]">
                                  {item.qty || 1}
                                </span>
    
                                <span className="text-xs text-gray-500 font-medium truncate">
                                  {item.measuringUnit === "#133"
                                    ? "PCS"
                                    : item.measuringUnit || "PCS"}
                                </span>
                              </div>
                            </td>
    
                            {/* Price/Item Box styling */}
                            <td className="p-3 pt-4">
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-medium px-2.5 py-1 rounded inline-block w-full max-w-[100px] text-right border border-transparent">
                                {(item.salesPrice || 0).toFixed(2)}
                              </div>
                            </td>
    
                            {/* Discount from API fields */}
                            {/* Discount Display Only */}
                            <td className="p-3 pt-4 border-l border-gray-100">
                              <div className="space-y-1">
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 font-semibold text-xs px-2.5 py-1.5 rounded-md inline-block">
                                  ₹ {calculatedDiscountAmount.toFixed(2)}
                                </div>
    
                                <div className="text-[11px] text-gray-400 font-medium">
      {item.discountOnSalesPrice || 0}% + {globalDiscount || 0}% OFF
    </div>
                              </div>
                            </td>
    
                            {/* Tax Field Box & Calculated Field */}
                            <td className="p-3 pt-4 text-gray-600">
                              {/* Tax % */}
                              <div className="border border-gray-200 rounded px-2 py-1 w-20 bg-white text-gray-700 text-sm mb-1">
                                {item.tax || item.gstTaxRate || 0}%
                              </div>
    
                              {/* Tax ₹ */}
                              <div className="text-[11px] text-gray-500 pl-1 font-medium">
                                ₹ {calculatedTaxAmount.toFixed(2)}
                              </div>
                            </td>
    
                            {/* Total Calculated Item Amount */}
                            <td className="p-3 pt-4">
                              <div className="bg-[#e9ecef]/60 text-gray-800 font-semibold px-2.5 py-1 rounded inline-block w-full max-w-[110px] text-right">
                                ₹ {finalAmount.toFixed(2)}
                              </div>
                            </td>
    
                            {/* Actions/Delete Button */}
                            <td className="p-3 pt-4 text-center">
                              <button
                                onClick={() =>
                                  setInvoiceItems(
                                    invoiceItems.filter((i) => i._id !== item._id),
                                  )
                                }
                                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="text-center py-12 text-gray-400 text-sm font-medium"
                        >
                          No items added yet
                        </td>
                      </tr>
                    )}
    
                    {/* SUBTOTAL (Matching Color Alignment) */}
                    <tr className="bg-[#f8f9fa] border-t border-b border-gray-200 font-semibold text-gray-600 text-sm">
                      <td
                        colSpan="5"
                        className="p-3 text-right text-xs uppercase tracking-wider font-bold text-gray-500 pt-3.5"
                      >
                        Subtotal
                      </td>
                      <td className="p-3 text-gray-700 font-medium pt-3.5">
                        ₹ {totalDiscount.toFixed(2)}
                      </td>
    
                      <td className="p-3 text-gray-700 font-medium pt-3.5">
                        ₹ {totalTax.toFixed(2)}
                      </td>
    
                      <td className="p-3 text-gray-900 font-bold text-base pt-3">
                        ₹ {subtotal.toFixed(2)}
                      </td>
                    </tr>
    
                    {/* ACTION BUTTON FOOTER BAR */}
                    <tr>
                      <td colSpan="9" className="p-0">
                        <div className="flex items-center justify-between p-3 bg-white gap-4">
                          <button
                            onClick={() => setShowItemModal(true)}
                            className="flex-1 h-12 border-2 border-dashed border-blue-400 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50/60 font-semibold transition-all"
                          >
                            + Add Item
                          </button>
    
                          <button
                            onClick={() => setShowItemModal(true)}
                            className="border border-gray-300 rounded-md px-5 h-12 flex items-center justify-center space-x-2.5 text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                          >
                            <span className="text-lg">🖨️</span>
                            <span className="font-medium text-sm whitespace-nowrap">
                              Scan Barcode
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
  );
}