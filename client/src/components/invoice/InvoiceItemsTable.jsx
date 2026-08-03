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
  // Update a single field on one invoice item
  const updateItem = (idx, changes) => {
    setInvoiceItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...changes } : it)),
    );
  };

  const handleQtyChange = (idx, item, value) => {
    let qty = Number(value);
    if (!qty || qty < 1) qty = 1;

    const stock = Number(item.availableStock || 0);
    if (stock > 0 && qty > stock) qty = stock;

    updateItem(idx, { qty });
  };

  const handlePriceChange = (idx, value) => {
    let price = Number(value);
    if (isNaN(price) || price < 0) price = 0;

    updateItem(idx, { salesPrice: price });
  };

  const handleDiscountChange = (idx, value) => {
    let discount = Number(value);
    if (isNaN(discount) || discount < 0) discount = 0;
    if (discount > 100) discount = 100;

    updateItem(idx, { discountOnSalesPrice: discount });
  };

  const handleTaxChange = (idx, value) => {
    let tax = Number(value);
    if (isNaN(tax) || tax < 0) tax = 0;

    updateItem(idx, { tax });
  };

  // Editing the final amount directly back-calculates the price/item so
  // that recomputing (price -> discount -> tax -> amount) lands back on
  // the amount the user typed in.
  const handleAmountChange = (idx, item, value) => {
    let finalAmount = Number(value);
    if (isNaN(finalAmount) || finalAmount < 0) finalAmount = 0;

    const qty = item.qty || 1;
    const itemDiscountPct = item.discountOnSalesPrice || 0;
    const globalDiscountPct = globalDiscount || 0;
    const taxPct = item.tax || item.gstTaxRate || 0;

    const discountFactor = 1 - (itemDiscountPct + globalDiscountPct) / 100;
    const taxFactor = 1 + taxPct / 100;
    const combinedFactor = qty * discountFactor * taxFactor;

    let newPrice = item.salesPrice || 0;

    if (combinedFactor > 0) {
      newPrice = finalAmount / combinedFactor;
    }

    if (newPrice < 0) newPrice = 0;

    updateItem(idx, { salesPrice: Number(newPrice.toFixed(2)) });
  };

  return (
     <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden font-sans">
              <div className="overflow-x-hidden">
                <table className="w-full text-left border-separate border-spacing-0 ">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="p-3 w-[4%] text-center">No</th>
                      <th className="p-3 w-[24%]">Items/ Services</th>
                      <th className="p-3 w-[10%]">HSN/ SAC</th>
                      <th className="p-3 w-[9%]">Qty</th>
                      <th className="p-3 w-[11%]">Price/Item (₹)</th>
                      <th className="p-3 w-[11%]">Discount (%)</th>
                      <th className="p-3 w-[9%]">Tax (%)</th>
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

                        const stock = Number(item.availableStock || 0);
    
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

                              {stock > 0 && (
                                <div className="text-[11px] text-gray-400 mt-1">
                                  In stock: {stock}
                                </div>
                              )}
                            </td>
    
                            {/* HSN Code from API */}
                            <td className="p-3 pt-4 text-gray-600 font-normal break-all">
                              {item.hsnCode || item.hsn || "—"}
                            </td>
    
                            {/* Qty - editable */}
                            <td className="p-3 pt-4 border-l border-gray-100">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <input
                                  type="number"
                                  min={1}
                                  max={stock > 0 ? stock : undefined}
                                  value={itemQty}
                                  onChange={(e) =>
                                    handleQtyChange(idx, item, e.target.value)
                                  }
                                  className="border border-gray-200 bg-gray-50 text-gray-700 font-medium px-2 py-1 rounded text-center w-16 outline-none focus:ring-2 focus:ring-indigo-200"
                                />
    
                                <span className="text-xs text-gray-500 font-medium truncate">
                                  {item.measuringUnit === "#133"
                                    ? "PCS"
                                    : item.measuringUnit || "PCS"}
                                </span>
                              </div>
                            </td>
    
                            {/* Price/Item - editable */}
                            <td className="p-3 pt-4">
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={itemPrice}
                                onChange={(e) =>
                                  handlePriceChange(idx, e.target.value)
                                }
                                className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-medium px-2.5 py-1 rounded w-full max-w-[110px] text-right border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-200"
                              />
                            </td>
    
                            {/* Discount - editable */}
                            <td className="p-3 pt-4 border-l border-gray-100">
                              <div className="space-y-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step="0.01"
                                  value={item.discountOnSalesPrice || 0}
                                  onChange={(e) =>
                                    handleDiscountChange(idx, e.target.value)
                                  }
                                  className="border border-rose-100 bg-rose-50 text-rose-600 font-semibold text-xs px-2.5 py-1.5 rounded-md w-20 outline-none focus:ring-2 focus:ring-rose-200"
                                />

                                <div className="text-[11px] text-gray-400 font-medium">
      ₹ {calculatedDiscountAmount.toFixed(2)} ({globalDiscount || 0}% global)
    </div>
                              </div>
                            </td>
    
                            {/* Tax - editable */}
                            <td className="p-3 pt-4 text-gray-600">
                              {/* Tax % */}
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={item.tax || item.gstTaxRate || 0}
                                onChange={(e) =>
                                  handleTaxChange(idx, e.target.value)
                                }
                                className="border border-gray-200 rounded px-2 py-1 w-20 bg-white text-gray-700 text-sm mb-1 outline-none focus:ring-2 focus:ring-indigo-200"
                              />
    
                              {/* Tax ₹ */}
                              <div className="text-[11px] text-gray-500 pl-1 font-medium">
                                ₹ {calculatedTaxAmount.toFixed(2)}
                              </div>
                            </td>
    
                            {/* Total Calculated Item Amount - editable, back-calculates price */}
                            <td className="p-3 pt-4">
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                value={finalAmount.toFixed(2)}
                                onChange={(e) =>
                                  handleAmountChange(idx, item, e.target.value)
                                }
                                className="bg-[#e9ecef]/60 text-gray-800 font-semibold px-2.5 py-1 rounded w-full max-w-[120px] text-right border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-200"
                              />
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
                            + Add Product
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
