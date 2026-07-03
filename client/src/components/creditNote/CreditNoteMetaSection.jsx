export default function CreditNoteMetaSection({
  creditNotePrefix,
  creditNoteNumber,
  creditNoteDate,
  setCreditNoteDate,
}) {
  return (
    <div className="bg-white border rounded-lg p-4">

      <div className="grid grid-cols-3 gap-4">

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Credit Note Prefix
          </label>

          <input
            value={creditNotePrefix}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Credit Note Number
          </label>

          <input
            value={creditNoteNumber}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Credit Note Date
          </label>

          <input
            type="date"
            value={creditNoteDate}
            disabled
            className="w-full border rounded px-3 py-2"
          />
        </div>

      </div>

    </div>
  );
}