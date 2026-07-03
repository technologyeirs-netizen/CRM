import React from "react";

export default function CreditNoteSummary({
  invoice,
}) {
  if (!invoice) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">

      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-800">
          Invoice Summary
        </h3>
      </div>

      <div className="p-4 space-y-3 text-sm">

        <div className="flex justify-between">
          <span>Invoice No.</span>

          <span className="font-medium">
            {invoice.fullInvoiceNumber}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Subtotal</span>

          <span>
            ₹{" "}
            {Number(
              invoice.subtotal || 0
            ).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Taxable Amount</span>

          <span>
            ₹{" "}
            {Number(
              invoice.taxableAmount || 0
            ).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Total Discount</span>

          <span>
            ₹{" "}
            {Number(
              invoice.totalDiscount || 0
            ).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Total Tax</span>

          <span>
            ₹{" "}
            {Number(
              invoice.totalTax || 0
            ).toLocaleString()}
          </span>
        </div>

        <div className="border-t pt-3 flex justify-between text-lg font-bold">
          <span>Total Amount</span>

          <span>
            ₹{" "}
            {Number(
              invoice.totalAmount || 0
            ).toLocaleString()}
          </span>
        </div>

      </div>

    </div>
  );
}