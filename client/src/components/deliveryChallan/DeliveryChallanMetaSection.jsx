import React from "react";

export default function DeliveryChallanMetaSection({
  isEditMode,

  deliveryChallanPrefix,
  setDeliveryChallanPrefix,

  deliveryChallanNumber,
  setDeliveryChallanNumber,

  challanDate,
  setChallanDate,
}) {
  const displayPrefix =
    deliveryChallanPrefix || "";

  return (
    <div className="lg:col-span-5 grid grid-cols-3 gap-3 border-l border-gray-100 pl-4">

      {/* Delivery Challan Prefix */}

      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Delivery Challan Prefix:
        </label>

        <input
          type="text"
          value={displayPrefix}
          disabled={isEditMode}
          onChange={(e) =>
            setDeliveryChallanPrefix(
              e.target.value
            )
          }
          className={`w-full border rounded px-2 py-1.5 outline-none ${
            isEditMode
              ? "bg-gray-200 cursor-not-allowed text-gray-500"
              : "bg-gray-100 border-transparent"
          }`}
        />
      </div>

      {/* Delivery Challan Number */}

      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Delivery Challan Number:
        </label>

        <input
          type="text"
          value={deliveryChallanNumber}
          disabled={isEditMode}
          onChange={(e) =>
            setDeliveryChallanNumber(
              e.target.value
            )
          }
          className={`w-full border rounded px-2 py-1.5 outline-none ${
            isEditMode
              ? "bg-gray-200 cursor-not-allowed text-gray-500"
              : "bg-gray-100 border-transparent"
          }`}
        />
      </div>

      {/* Delivery Challan Date */}

      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Delivery Challan Date:
        </label>

        <input
          type="date"
          value={challanDate}
          onChange={(e) =>
            setChallanDate(
              e.target.value
            )
          }
          className="w-full border border-gray-300 rounded px-2 py-1 outline-none text-gray-700"
        />
      </div>

    </div>
  );
}