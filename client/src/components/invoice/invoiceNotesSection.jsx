 

export default function InvoiceNotesSection({
  settings,
  notes,
  setNotes,
  isNotesOpen,
  setIsNotesOpen,
  isTermsOpen,
  setIsTermsOpen,
  termsKey = "salesInvoice",
  showTermsKey = "invoicePreferences",
}) {
  const terms =
  settings?.termsAndConditions?.[termsKey] || [];
  
  const showTerms =
  settings?.[showTermsKey]?.showTermsAndConditions ?? true;
  console.log("termsKey =", termsKey);
console.log("terms =", settings?.termsAndConditions?.[termsKey]);
  return (
    <div className="space-y-4">

      {/* NOTES */}

      <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">

        <div className="flex justify-between items-center">

          <button
            onClick={() =>
              setIsNotesOpen(!isNotesOpen)
            }
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            {isNotesOpen
              ? "Hide Notes"
              : "+ Add Notes"}
          </button>

        </div>

        {isNotesOpen && (

          <textarea
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            placeholder="Enter invoice notes..."
            className="mt-3 w-full h-24 border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-indigo-500 resize-none"
          />

        )}

      </div>

      {/* TERMS */}

      {showTerms && (

        <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">

          <div className="flex justify-between items-center mb-3">

            <button
              onClick={() =>
                setIsTermsOpen(!isTermsOpen)
              }
              className="text-blue-600 font-medium text-sm hover:underline"
            >
              {isTermsOpen
                ? "Hide Terms & Conditions"
                : "Show Terms & Conditions"}
            </button>

          </div>

          {isTermsOpen && (
            
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">

              {terms.length > 0 ? (

                terms.map((term, index) => (
                  <li key={index}>
                    {term}
                  </li>
                ))

              ) : (

                <p className="text-gray-400">
                  No Terms & Conditions configured.
                </p>

              )}

            </ol>

          )}

        </div>

      )}

    </div>
  );
}
