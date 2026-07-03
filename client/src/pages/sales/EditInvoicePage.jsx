import React, { useState } from "react";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function EditInvoicePage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([
    {
      name: "Website Development",
      qty: 1,
      price: 15000,
    },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        qty: 1,
        price: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index,
    field,
    value
  ) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const total = items.reduce(
    (acc, item) =>
      acc + item.qty * item.price,
    0
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Edit Invoice
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Update invoice details
            </p>
          </div>
        </div>

        <button className="h-11 px-5 rounded-2xl bg-[#5b3df5] hover:bg-[#4c30dd] text-white flex items-center gap-2 shadow-lg">
          <Save size={16} />
          Save Changes
        </button>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-5">
            Invoice Details
          </h2>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-600">
                Customer Name
              </label>

              <input
                type="text"
                defaultValue="ADITYA DWIVEDI"
                className="w-full h-12 rounded-2xl border border-slate-200 px-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Invoice Number
              </label>

              <input
                type="text"
                defaultValue="ET/SL/25-26/224"
                className="w-full h-12 rounded-2xl border border-slate-200 px-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Status
              </label>

              <select className="w-full h-12 rounded-2xl border border-slate-200 px-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Paid</option>
                <option>Unpaid</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="bg-gradient-to-br from-[#5b3df5] to-[#7d65ff] rounded-3xl p-6 text-white shadow-xl">
          <h2 className="text-lg font-bold">
            Invoice Summary
          </h2>

          <div className="mt-8 space-y-5">
            <div className="flex justify-between">
              <span className="opacity-80">
                Total Items
              </span>

              <span className="font-semibold">
                {items.length}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="opacity-80">Subtotal</span>

              <span className="font-semibold">
                ₹ {total.toLocaleString()}
              </span>
            </div>

            <div className="border-t border-white/20 pt-5 flex justify-between text-2xl font-bold">
              <span>Total</span>

              <span>
                ₹ {total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            Invoice Items
          </h2>

          <button
            onClick={addItem}
            className="h-11 px-5 rounded-2xl bg-[#5b3df5] hover:bg-[#4c30dd] text-white flex items-center gap-2"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        <div className="p-6 space-y-5">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end border border-slate-200 rounded-3xl p-5"
            >
              <div className="xl:col-span-5">
                <label className="text-sm font-medium text-slate-600">
                  Item Name
                </label>

                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "name",
                      e.target.value
                    )
                  }
                  className="w-full h-12 rounded-2xl border border-slate-200 px-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="xl:col-span-2">
                <label className="text-sm font-medium text-slate-600">
                  Qty
                </label>

                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "qty",
                      Number(e.target.value)
                    )
                  }
                  className="w-full h-12 rounded-2xl border border-slate-200 px-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="xl:col-span-3">
                <label className="text-sm font-medium text-slate-600">
                  Price
                </label>

                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "price",
                      Number(e.target.value)
                    )
                  }
                  className="w-full h-12 rounded-2xl border border-slate-200 px-4 mt-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="xl:col-span-2">
                <button
                  onClick={() => removeItem(index)}
                  className="w-full h-12 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}