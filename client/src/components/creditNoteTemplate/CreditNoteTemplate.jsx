import React from "react";
import { toWords } from "number-to-words";

export default function CreditNoteTemplate({
  creditNote,
}) {

  const subtotal =
    creditNote.subtotal ||
    creditNote.items.reduce(
      (sum, item) =>
        sum + item.finalAmount,
      0
    );

  const amountInWords =
    toWords(
      Math.round(
        creditNote.totalAmount
      )
    )
      .replace(
        /\b\w/g,
        (c) => c.toUpperCase()
      ) +
    " Rupees Only";

  return (

    <div
      id="credit-note-template"
      className="bg-white w-[210mm] min-h-[297mm] shadow-xl p-2 rounded text-sm"
    >

            {/* ================= HEADER ================= */}

            <div className="border border-black">

            <div className="grid grid-cols-2">

                {/* LEFT SIDE */}

                <div className="border-r border-black p-4">

                    <div className="flex gap-4">

                        {creditNote.company?.logo && (

                            <img
                                src={creditNote.company.logo}
                                alt=""
                                className="w-28 h-28 object-contain flex-shrink-0"
                            />

                        )}

                        <div className="flex-1">

                            <h1 className="text-2xl font-bold uppercase">

                                {creditNote.company?.name}

                            </h1>

                            <p>

                                {creditNote.company?.address?.street}

                            </p>

                            <p>

                                {creditNote.company?.address?.city},{" "}
                                {creditNote.company?.address?.state},{" "}
                                {creditNote.company?.address?.country}{" "}
                                {creditNote.company?.address?.pincode}

                            </p>

                            <div className="mt-2">

                                <div className="flex">

                                    <b className="w-20">
                                        GSTIN:
                                    </b>

                                    <span>
                                        {creditNote.company?.gstin}
                                    </span>

                                </div>

                                <div className="flex">

                                    <b className="w-20">
                                        PAN:
                                    </b>

                                    <span>
                                        {creditNote.company?.panNumber}
                                    </span>

                                </div>

                                <div className="flex">

                                    <b className="w-20">
                                        Mobile:
                                    </b>

                                    <span>
                                        {creditNote.company?.mobile}
                                    </span>

                                </div>

                                <div className="flex">

                                    <b className="w-20">
                                        Email:
                                    </b>

                                    <span>
                                        {creditNote.company?.email}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* RIGHT SIDE */}

                <div className="p-4">

                    <h1 className="text-3xl font-bold text-center mb-6 uppercase">

                        Credit Note

                    </h1>

                    <div className="grid grid-cols-2 w-full text-center">

                        <div>

                            <p className="font-bold">

                                Credit Note No.

                            </p>

                            <p>

                                {creditNote.fullCreditNoteNumber}

                            </p>

                        </div>

                        <div>

                            <p className="font-bold">

                                Credit Note Date

                            </p>

                            <p>

                                {new Date(
                                    creditNote.creditNoteDate
                                ).toLocaleDateString()}

                            </p>

                        </div>

                    </div>

                    <div className="mt-6 text-center">

                        <p className="font-semibold">

                            Against Invoice

                        </p>

                        <p>

                            {creditNote.salesInvoiceNumber}

                        </p>

                    </div>

                </div>

            </div>

        </div>



            {/* ================= BILL TO ================= */}

            <div className="border-l border-r border-b border-black">

                <div className="grid grid-cols-2">

                    {/* CUSTOMER DETAILS */}

                    <div className="border-r border-black p-3">

                        <h2 className="font-bold">

                            CUSTOMER DETAILS

                        </h2>

                        <h3 className="font-bold text-lg">

                            {creditNote.party?.name}

                        </h3>

                        <p>

                            Address :
                            {" "}
                            {creditNote.party?.address}

                        </p>

                        <p>

                            Mobile :
                            {" "}
                            {creditNote.party?.phone}

                        </p>

                        <p>

                            Email :
                            {" "}
                            {creditNote.party?.email}

                        </p>

                    </div>

                    {/* CREDIT NOTE DETAILS */}

                    <div className="p-3">

                        <h2 className="font-bold">

                            CREDIT NOTE DETAILS

                        </h2>

                        <div className="mt-2 space-y-1">

                            <p>

                                <span className="font-semibold">
                                    Credit Note No :
                                </span>
                                {" "}
                                {creditNote.fullCreditNoteNumber}

                            </p>

                            <p>

                                <span className="font-semibold">
                                    Credit Note Date :
                                </span>
                                {" "}
                                {new Date(
                                    creditNote.creditNoteDate
                                ).toLocaleDateString()}

                            </p>

                            <p>

                                <span className="font-semibold">
                                    Against Invoice :
                                </span>
                                {" "}
                                {creditNote.salesInvoiceNumber}

                            </p>

                            <p>

                                <span className="font-semibold">
                                    Status :
                                </span>
                                {" "}
                                {creditNote.status}

                            </p>

                        </div>

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

                        <th className="border p-2 w-[6%]">
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

                        creditNote.items.map(
                            (item,index)=>(

                                <tr
                                    key={index}
                                    className="h-80"
                                >

                                    <td className="border text-center align-top pt-2">

                                        {index+1}

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

                                    <td className="border text-center align-top pt-2">

                                        {item.hsnCode}

                                    </td>

                                    <td className="border text-center align-top pt-2">

                                        {item.qty} PCS

                                    </td>

                                    <td className="border text-center align-top pt-2">

                                        ₹ {Number(
                                            item.salesPrice
                                        ).toLocaleString()}

                                    </td>

                                    <td className="border text-center align-top pt-2">

                                        ₹ {Number(
                                            item.taxAmount
                                        ).toLocaleString()}

                                        <br />

                                        <span className="text-xs">

                                            ({item.gstTaxRate}%)

                                        </span>

                                    </td>

                                    <td className="border text-center align-top pt-2 font-semibold">

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

                        <td className="border text-right pr-2 py-1 text-xs font-semibold">

                            TOTAL

                        </td>

                        <td className="border"></td>

                        <td className="border text-center py-1 text-xs font-semibold">

                            {

                                creditNote.items.reduce(

                                    (sum,item)=>
                                        sum + item.qty,

                                    0

                                )

                            }

                        </td>

                        <td className="border"></td>

                        <td className="border text-center py-1 text-xs font-semibold">

                            ₹ {Number(
                                creditNote.totalTax
                            ).toLocaleString()}

                        </td>

                        <td className="border text-center py-1 text-xs font-semibold">

                            ₹ {Number(
                                creditNote.totalAmount
                            ).toLocaleString()}

                        </td>

                    </tr>

                    <tr>

                        <td className="border"></td>

                        <td className="border text-right pr-2 py-1 text-xs font-semibold">

                            SUBTOTAL

                        </td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border text-center py-1 text-xs font-semibold">

                            ₹ {Number(
                                creditNote.subtotal
                            ).toLocaleString()}

                        </td>

                    </tr>

                    <tr>

                        <td className="border"></td>

                        <td className="border text-right pr-2 py-1 text-xs font-semibold">

                            DISCOUNT

                        </td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border text-center py-1 text-xs font-semibold">

                            ₹ {Number(
                                creditNote.totalDiscount
                            ).toLocaleString()}

                        </td>

                    </tr>

                    <tr>

                        <td className="border"></td>

                        <td className="border text-right pr-2 py-1 text-xs font-semibold">

                            TAXABLE AMOUNT

                        </td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border text-center py-1 text-xs font-semibold">

                            ₹ {Number(
                                creditNote.taxableAmount
                            ).toLocaleString()}

                        </td>

                    </tr>

                    <tr className="font-bold bg-gray-50">

                        <td className="border"></td>

                        <td className="border text-right pr-2 py-2">

                            CREDIT NOTE AMOUNT

                        </td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border text-center py-2">

                            ₹ {Number(
                                creditNote.totalAmount
                            ).toLocaleString()}

                        </td>

                    </tr>

                </tfoot>

            </table>
            {/* GST TABLE */}



{/* Terms + Signature */}

{/* <table className="w-full border-t-0 border border-collapse text-xs">

    <tbody>

        <tr>

            <td className="border p-2 align-top w-[65%]">

                <div className="font-bold mb-2">

                    Terms and Conditions

                </div>

                {invoice.termsAndConditions?.map((term,index)=>(

                    <div key={index}>

                        {index+1}. {term}

                    </div>

                ))}

            </td>

            <td className="border p-2 text-center align-bottom w-[35%]">

                {invoice.signature?.imageUrl && (

                    <img
                        src={invoice.signature.imageUrl}
                        className="h-16 object-contain mx-auto mb-2"
                    />

                )}

                <div>

                    Authorised Signatory For

                </div>

                <div className="font-semibold uppercase">

                    {invoice.company?.name}

                </div>

            </td>

        </tr>

    </tbody>

</table> */}

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

                                Credit Note Amount (In Words)

                            </div>

                            <div className="mt-1">

                                {amountInWords}

                            </div>

                        </td>

                    </tr>

                    {/* Terms + Signature */}

                    <tr>

                        {/* LEFT */}

                        <td
                            className="border p-2 align-top w-[65%]"
                        >

                            <div className="font-bold text-sm mb-2">

                                Terms and Conditions

                            </div>

                            {

                                creditNote.termsAndConditions?.length
                                    ? creditNote.termsAndConditions.map(
                                        (term,index)=>(
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

                                creditNote.notes && (

                                    <div className="mt-5">

                                        <div className="font-bold text-sm mb-2">

                                            Notes

                                        </div>

                                        <div>

                                            {creditNote.notes}

                                        </div>

                                    </div>

                                )

                            }

                        </td>

                        {/* RIGHT */}

                        <td
                            className="border p-2 align-bottom text-center w-[35%]"
                        >

                            <div className="mb-2 font-semibold">

                                For

                            </div>

                            <div className="font-bold uppercase mb-6">

                                {creditNote.company?.name}

                            </div>

                            <div className="h-20 flex items-end justify-center">

                                {

                                    creditNote.signature?.imageUrl && (

                                        <img
                                            src={
                                                creditNote.signature.imageUrl
                                            }
                                            alt=""
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