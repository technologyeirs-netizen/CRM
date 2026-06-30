import React from "react";
import { toWords } from "number-to-words";

export default function DeliveryChallanTemplate({
  deliveryChallan,
}) {

  const subtotal =
    deliveryChallan.subtotal ||
    deliveryChallan.items.reduce(
      (sum, item) =>
        sum + item.finalAmount,
      0
    );

  const amountInWords =
    toWords(
      Math.round(
        deliveryChallan.totalAmount
      )
    )
      .replace(
        /\b\w/g,
        (c) => c.toUpperCase()
      ) +
    " Rupees Only";

  return (

    <div
      id="delivery-challan-template"
      className="bg-white w-[210mm] min-h-[297mm] shadow-xl p-2 rounded text-sm"
    >
        {/* ================= HEADER ================= */}



        <div className="border border-black">

        <div className="grid grid-cols-2">

            {/* LEFT */}

            <div className="border-r border-black p-4">

            <div className="flex gap-4">

                {deliveryChallan.company?.logo && (

                <img
                    src={deliveryChallan.company.logo}
                    alt=""
                    className="w-24 h-24 object-contain flex-shrink-0"
                />

                )}

                <div className="flex-1">

                <h2 className="text-2xl font-bold uppercase">

                    {deliveryChallan.company?.name}

                </h2>

                <p>

                    {deliveryChallan.company?.address?.street}

                </p>

                <p>

                    {deliveryChallan.company?.address?.city},{" "}
                    {deliveryChallan.company?.address?.state},{" "}
                    {deliveryChallan.company?.address?.country}{" "}
                    {deliveryChallan.company?.address?.pincode}

                </p>

                <div className="grid grid-cols-2 mt-2 text-sm gap-y-1">

                    <div>

                    <b>GSTIN:</b>{" "}
                    {deliveryChallan.company?.gstin}

                    </div>

                    <div>

                    <b>Mobile:</b>{" "}
                    {deliveryChallan.company?.mobile}

                    </div>

                    <div>

                    <b>PAN:</b>{" "}
                    {deliveryChallan.company?.panNumber}

                    </div>

                    <div>

                    <b>Email:</b>{" "}
                    {deliveryChallan.company?.email}

                    </div>

                </div>

                </div>

            </div>

            </div>

            {/* RIGHT */}

            <div className="flex items-center justify-center">

            <div className="grid grid-cols-2 w-full text-center">

                <div>

                <p className="font-bold">

                    Challan No.

                </p>

                <p>

                    {
                    deliveryChallan.fullDeliveryChallanNumber
                    }

                </p>

                </div>

                <div>

                <p className="font-bold">

                    Challan Date

                </p>

                <p>

                    {new Date(
                    deliveryChallan.challanDate
                    ).toLocaleDateString("en-GB")}

                </p>

                </div>

            </div>

            </div>

        </div>

        </div>


        {/* ================= BILL TO / SHIP TO ================= */}

        <div className="border-l border-r border-b border-black">

        <div className="grid grid-cols-2">

            {/* BILL TO */}

            <div className="border-r border-black p-3">

            <h2 className="font-bold uppercase mb-2">

                BILL TO

            </h2>

            <h3 className="font-bold">

                {deliveryChallan.party?.name}

            </h3>

            <p>

                Address:{" "}
                {deliveryChallan.party?.address}

            </p>

            <p>

                Place of Supply:{" "}
                {deliveryChallan.company?.address?.state}

            </p>

            </div>

            {/* SHIP TO */}

            <div className="p-3">

            <h2 className="font-bold uppercase mb-2">

                SHIP TO

            </h2>

            <h3 className="font-bold">

                {deliveryChallan.party?.name}

            </h3>

            <p>

                Address:{" "}
                {deliveryChallan.party?.address}

            </p>

            </div>

        </div>

        </div>


            {/* ================= ITEMS TABLE ================= */}

            <table className="w-full border border-collapse table-fixed">

                <thead>

                    <tr className="bg-gray-100 text-sm">

                        <th className="border p-2 w-[7%]">
                            S.NO.
                        </th>

                        <th className="border p-2 text-left w-[34%]">
                            ITEMS
                        </th>

                        <th className="border p-2 w-[9%]">
                            HSN
                        </th>

                        <th className="border p-2 w-[8%]">
                            QTY.
                        </th>

                        <th className="border p-2 w-[12%]">
                            RATE
                        </th>

                        <th className="border p-2 w-[10%]">
                            TAX
                        </th>

                        <th className="border p-2 w-[12%]">
                            AMOUNT
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {

                        deliveryChallan.items.map(
                            (item, index) => (

                                <tr key={index}>

                                    <td className="border text-center align-top py-2">

                                        {index + 1}

                                    </td>

                                    <td className="border p-2 align-top">

                                        <div className="font-semibold">

                                            {item.name}

                                        </div>

                                        {

                                            item.itemCode && (

                                                <div className="text-xs text-gray-500 mt-1">

                                                    {item.itemCode}

                                                </div>

                                            )

                                        }

                                    </td>

                                    <td className="border text-center align-top py-2">

                                        {item.hsnCode}

                                    </td>

                                    <td className="border text-center align-top py-2">

                                        {item.qty} {item.measuringUnit || "PCS"}

                                    </td>

                                    <td className="border text-center align-top py-2">

                                        ₹ {Number(
                                            item.salesPrice
                                        ).toLocaleString()}

                                    </td>

                                    <td className="border text-center align-top py-2">

                                        ₹ {Number(
                                            item.taxAmount || 0
                                        ).toLocaleString()}

                                        <br />

                                        <span className="text-xs">

                                            ({item.gstTaxRate || 0}%)

                                        </span>

                                    </td>

                                    <td className="border text-center align-top py-2 font-semibold">

                                        ₹ {Number(
                                            item.finalAmount
                                        ).toLocaleString()}

                                    </td>

                                </tr>

                            )

                        )

                    }

                </tbody>

                <tfoot>

                    <tr className="font-bold">

                        <td className="border"></td>

                        <td className="border text-right pr-2 py-2">

                            TOTAL

                        </td>

                        <td className="border"></td>

                        <td className="border text-center">

                            {

                                deliveryChallan.items.reduce(

                                    (sum, item) => sum + Number(item.qty || 0),

                                    0

                                )

                            }

                        </td>

                        <td className="border"></td>

                        <td className="border text-center">

                            ₹ {Number(
                                deliveryChallan.totalTax || 0
                            ).toLocaleString()}

                        </td>

                        <td className="border text-center">

                            ₹ {Number(
                                deliveryChallan.totalAmount || 0
                            ).toLocaleString()}

                        </td>

                    </tr>

                </tfoot>

            </table>
            {/* GST TABLE */}



            {/* Terms + Signature */}

            

            {/* ================= FOOTER ================= */}

            <table className="w-full border border-collapse text-xs">

                <tbody>

                    {/* Amount In Words */}

                    <tr>

                        <td
                            colSpan={2}
                            className="border p-2"
                        >

                            <div className="font-bold text-sm">

                                Delivery Challan Amount (In Words)

                            </div>

                            <div className="mt-1">

                                {amountInWords}

                            </div>

                        </td>

                    </tr>

                    {/* Terms + Signature */}

                    <tr>


                        <td
                            className="border p-2 align-top w-[65%]"
                        >

                            <div className="font-bold text-sm mb-2">

                                Terms and Conditions

                            </div>

                            {

                                deliveryChallan.termsAndConditions?.length
                                    ? deliveryChallan.termsAndConditions.map(
                                        (term, index) => (

                                            <div
                                                key={index}
                                                className="mb-1"
                                            >

                                                {index + 1}. {term}

                                            </div>

                                        )
                                    )
                                    : (

                                        <div>

                                            No Terms And Conditions Available

                                        </div>

                                    )

                            }

                            {

                                deliveryChallan.notes && (

                                    <div className="mt-5">

                                        <div className="font-bold text-sm mb-2">

                                            Notes

                                        </div>

                                        <div>

                                            {deliveryChallan.notes}

                                        </div>

                                    </div>

                                )

                            }

                        </td>


                        <td
                            className="border p-2 align-bottom text-center w-[35%]"
                        >

                            <div className="mb-2 font-semibold">

                                For

                            </div>

                            <div className="font-bold uppercase mb-6">

                                {deliveryChallan.company?.name}

                            </div>

                            <div className="h-20 flex items-end justify-center">

                                {

                                    deliveryChallan.signature?.imageUrl && (

                                        <img
                                            src={deliveryChallan.signature.imageUrl}
                                            alt="Signature"
                                            className="max-h-16 object-contain"
                                        />

                                    )

                                }

                            </div>

                            <div className="mt-2">

                                Authorised Signatory

                            </div>

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    );

}