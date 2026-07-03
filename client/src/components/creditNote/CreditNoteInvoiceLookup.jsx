import { useMemo, useState } from "react";

export default function CreditNoteInvoiceLookup({
  salesInvoices,
  selectedInvoiceId,
  setSelectedInvoiceId,
}) {
  const [search, setSearch] = useState("");

  const filteredInvoices = useMemo(() => {
    return salesInvoices.filter((invoice) =>
      invoice.invoiceNumber
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [salesInvoices, search]);

  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">
          Link To Invoice
        </h3>

        {selectedInvoiceId && (
          <span className="text-green-600 text-sm">
            Invoice Selected
          </span>
        )}
      </div>

      <input
        type="text"
        placeholder="Search invoice..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 text-sm">
                Invoice No
              </th>

              <th className="text-left px-3 py-2 text-sm">
                Date
              </th>

              <th className="text-right px-3 py-2 text-sm">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-6 text-gray-500"
                >
                  No invoices found
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr
                  key={invoice._id}
                  onClick={() =>
                    handleSelectInvoice(
                      invoice._id
                    )
                  }
                  className={`cursor-pointer border-t hover:bg-indigo-50 ${
                    selectedInvoiceId ===
                    invoice._id
                      ? "bg-indigo-100"
                      : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    {invoice.invoiceNumber}
                  </td>

                  <td className="px-3 py-2">
                    {invoice.date
                      ? new Date(
                          invoice.date
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-3 py-2 text-right">
                    ₹
                    {Number(
                      invoice.amount || 0
                    ).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}