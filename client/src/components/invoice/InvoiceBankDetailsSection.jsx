import React, { useState, useEffect } from "react";

export default function InvoiceBankDetailsSection({
  settings,
  selectedBankDetails,
  setSelectedBankDetails,
}) {
  const defaultBank = selectedBankDetails;

  const [showModal, setShowModal] = useState(false);

  const [selectedId, setSelectedId] = useState(
    selectedBankDetails?.bankId ||
      selectedBankDetails?._id ||
      ""
  );

  useEffect(() => {
    setSelectedId(
      selectedBankDetails?.bankId ||
        selectedBankDetails?._id ||
        ""
    );
  }, [selectedBankDetails]);

  if (
    !settings?.invoicePreferences?.showBankDetails ||
    !defaultBank
  ) {
    return null;
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">

          <h3 className="font-semibold text-gray-700">
            Bank Details
          </h3>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-blue-600 hover:underline text-sm"
          >
            Change Bank
          </button>

        </div>

        <div className="text-xs space-y-2">

          <p>
            <span className="text-gray-400">
              Account Name :
            </span>{" "}

            <span className="font-medium text-gray-700">
              {defaultBank.accountName}
            </span>
          </p>

          <p>
            <span className="text-gray-400">
              Account Holder :
            </span>{" "}

            <span className="font-medium text-gray-700">
              {defaultBank.accountHolder}
            </span>
          </p>

          <p>
            <span className="text-gray-400">
              Account Number :
            </span>{" "}

            <span className="font-medium text-gray-700">
              {defaultBank.accountNumber}
            </span>
          </p>

          <p>
            <span className="text-gray-400">
              Bank Name :
            </span>{" "}

            <span className="font-medium text-gray-700">
              {defaultBank.bankName}
            </span>
          </p>

          <p>
            <span className="text-gray-400">
              IFSC :
            </span>{" "}

            <span className="font-medium text-gray-700">
              {defaultBank.ifsc}
            </span>
          </p>

          {defaultBank.branchName && (
            <p>
              <span className="text-gray-400">
                Branch :
              </span>{" "}

              <span className="font-medium text-gray-700">
                {defaultBank.branchName}
              </span>
            </p>
          )}

          {defaultBank.upiId && (
            <p>
              <span className="text-gray-400">
                UPI :
              </span>{" "}

              <span className="font-medium text-gray-700">
                {defaultBank.upiId}
              </span>
            </p>
          )}

        </div>
      </div>

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl w-[550px] shadow-xl">

            <div className="flex justify-between items-center border-b p-4">

              <h2 className="font-bold text-lg">
                Select Bank Account
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-xl"
              >
                ×
              </button>

            </div>

            <div className="max-h-[400px] overflow-y-auto">

              {settings?.bankAccounts?.map((bank) => (

                <label
                  key={bank._id}
                  className="flex justify-between items-center border-b p-4 cursor-pointer hover:bg-gray-50"
                >

                  <div>

                    <div className="font-semibold">
                      {bank.accountName}
                    </div>

                    <div className="text-sm text-gray-500">
                      {bank.accountHolder}
                    </div>

                    <div className="text-sm text-gray-500">
                      {bank.accountNumber}
                    </div>

                    <div className="text-sm text-gray-500">
                      {bank.bankName}
                    </div>

                    <div className="text-sm text-gray-500">
                      {bank.ifsc}
                    </div>

                  </div>

                  <input
                    type="radio"
                    name="selectedBank"
                    checked={
                      String(selectedId) ===
                      String(bank._id)
                    }
                    onChange={() =>
                      setSelectedId(bank._id)
                    }
                  />

                </label>

              ))}

            </div>

            <div className="flex justify-end gap-3 border-t p-4">

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>

              <button
                onClick={() => {

                  const bank =
                    settings.bankAccounts.find(
                      (b) =>
                        String(b._id) ===
                        String(selectedId)
                    );

                  if (bank) {
                    setSelectedBankDetails(bank);
                  }

                  setShowModal(false);

                }}
                className="px-5 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}
    </>
  );
}

