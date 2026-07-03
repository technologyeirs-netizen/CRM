import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function BankAccountSection({
  settings,
  setSettings,
}) {
  const addBank = () => {
  setSettings((prev) => ({
    ...prev,

    bankAccounts: [
      ...prev.bankAccounts,

      {
        _id: crypto.randomUUID(),

        accountName: "",
        accountHolder: "",
        accountNumber: "",
        bankName: "",
        ifsc: "",
        branchName: "",
        upiId: "",

        showDetails: false,

        expanded: true,
      },
    ],
  }));
};

  const removeBank = (index) => {
    setSettings((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateField = (
    index,
    field,
    value
  ) => {
    const updated = [...settings.bankAccounts];

    updated[index][field] = value;

    setSettings((prev) => ({
      ...prev,
      bankAccounts: updated,
    }));
  };

  const setDefault = (bankId) => {
  setSettings((prev) => ({
    ...prev,

    invoicePreferences: {
      ...prev.invoicePreferences,
      defaultBankAccountId: bankId,
    },
  }));
};

const toggleExpand = (index) => {
  const updated = [...settings.bankAccounts];

  updated[index].expanded =
    !updated[index].expanded;

  setSettings((prev) => ({
    ...prev,
    bankAccounts: updated,
  }));
};

const toggleDetails = (index) => {
  const updated = [...settings.bankAccounts];

  updated[index].showDetails =
    !updated[index].showDetails;

  setSettings((prev) => ({
    ...prev,
    bankAccounts: updated,
  }));
};

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-bold text-slate-800">
          Bank Accounts
        </h2>

        <button
          onClick={addBank}
          className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
        >
          <Plus size={16} />

          Add Account

        </button>

      </div>

      <div className="space-y-6">

  {settings.bankAccounts.length === 0 ? (

    <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center">

      <div className="text-6xl mb-4">
        🏦
      </div>

      <h3 className="text-2xl font-bold text-slate-700">

        No Bank Accounts

      </h3>

      <p className="text-slate-500 mt-2">

        Click "Add Account" to create your first account.

      </p>

    </div>

  ) : (

    settings.bankAccounts.map(
      (bank, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-2xl p-5"
            >
              <div className="flex justify-between items-center mb-5">

                <div
                  className="cursor-pointer flex-1"
                  onClick={() => toggleExpand(index)}
                >
                  <h3 className="text-lg font-bold text-slate-800">

                    {bank.accountName || "Untitled Account"}

                  </h3>

                  <p className="text-sm text-slate-500 mt-1">

                    {bank.accountNumber || bank.upiId || "Tap to edit"}

                  </p>

                  {settings.invoicePreferences.defaultBankAccountId ===
                    bank._id && (

                    <span className="inline-block mt-2 px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs">

                      Default

                    </span>

                  )}

                </div>

                <button
                  onClick={() =>
                    removeBank(index)
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>

              </div>
              {bank.expanded && (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <input
                  placeholder="Account Name"
                  value={bank.accountName}
                  onChange={(e) =>
                    updateField(
                      index,
                      "accountName",
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-300 px-4"
                />
                <div className="md:col-span-2 flex items-center justify-between border rounded-xl px-4 py-3">

                <span className="font-medium text-slate-700">
                  Add Bank Details
                </span>

                <button
                  type="button"
                  onClick={() => toggleDetails(index)}
                  className={`w-14 h-8 rounded-full transition ${
                    bank.showDetails
                      ? "bg-indigo-600"
                      : "bg-slate-300"
                  }`}
                >

                  <div
                    className={`w-6 h-6 rounded-full bg-white mt-1 transition ${
                      bank.showDetails
                        ? "ml-7"
                        : "ml-1"
                    }`}
                  />

                </button>

              </div>
                {bank.showDetails && (
                <>
                <input
                  placeholder="Account Holder"
                  value={bank.accountHolder}
                  onChange={(e) =>
                    updateField(
                      index,
                      "accountHolder",
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-300 px-4"
                />

                <input
                  placeholder="Account Number"
                  value={bank.accountNumber}
                  onChange={(e) =>
                    updateField(
                      index,
                      "accountNumber",
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-300 px-4"
                />

                <input
                  placeholder="Bank Name"
                  value={bank.bankName}
                  onChange={(e) =>
                    updateField(
                      index,
                      "bankName",
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-300 px-4"
                />

                <input
                  placeholder="IFSC Code"
                  value={bank.ifsc}
                  onChange={(e) =>
                    updateField(
                      index,
                      "ifsc",
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-300 px-4"
                />

                <input
                  placeholder="Branch Name"
                  value={bank.branchName}
                  onChange={(e) =>
                    updateField(
                      index,
                      "branchName",
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-300 px-4"
                />

                <input
                  placeholder="UPI ID"
                  value={bank.upiId}
                  onChange={(e) =>
                    updateField(
                      index,
                      "upiId",
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-300 px-4 md:col-span-2"
                />
                </>
                )}
              </div>

              <div className="mt-5 flex items-center gap-3">

                <input
                  type="radio"
                  name="defaultBank"

                  checked={
                    settings.invoicePreferences.defaultBankAccountId ===
                    bank._id
                  }

                  onChange={() =>
                    setDefault(bank._id)
                  }
                />

                <span className="text-sm text-slate-600">
                  Set as Default Account
                </span>

              </div>
              </>
            )}
            </div>
      )
          )
        )}

      </div>
    </div>
  );
}