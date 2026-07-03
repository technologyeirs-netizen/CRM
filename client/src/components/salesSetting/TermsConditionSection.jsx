import React, { useState } from "react";

const options = [
  {
    label: "Sales Invoice",
    value: "salesInvoice",
  },
  {
    label: "Credit Note",
    value: "creditNote",
  },
  // {
  //   label: "Debit Note",
  //   value: "debitNote",
  // },
  {
    label: "Delivery Challan",
    value: "deliveryChallan",
  },
  // {
  //   label: "Proforma Invoice",
  //   value: "proformaInvoice",
  // },
  // {
  //   label: "Purchase Invoice",
  //   value: "purchaseInvoice",
  // },
  // {
  //   label: "Purchase Return",
  //   value: "purchaseReturn",
  // },
];

export default function TermsConditionSection({
  settings,
  setSettings,
}) {
  const [selectedType, setSelectedType] =
    useState("salesInvoice");

  const handleChange = (value) => {
    setSettings((prev) => ({
      ...prev,

      termsAndConditions: {
        ...prev.termsAndConditions,

        [selectedType]: value,
      },
    }));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Terms & Conditions
      </h2>

      <div className="mb-5">

        <label className="block text-sm font-medium text-slate-600 mb-2">
          Document Type
        </label>

        <select
          value={selectedType}
          onChange={(e) =>
            setSelectedType(e.target.value)
          }
          className="w-full h-11 rounded-xl border border-slate-300 px-4"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

      </div>

      <div>

        <label className="block text-sm font-medium text-slate-600 mb-2">
          Terms & Conditions
        </label>

        <textarea
          rows={12}
          value={
            settings.termsAndConditions[
              selectedType
            ] || ""
          }
          onChange={(e) =>
            handleChange(e.target.value)
          }
          placeholder="Enter terms and conditions here..."
          className="w-full rounded-2xl border border-slate-300 p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <p className="text-xs text-slate-500 mt-3">
          Tip: Press Enter for a new line. The formatting will be preserved when displayed on the invoice.
        </p>

      </div>

    </div>
  );
}