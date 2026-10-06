import React, { useLayoutEffect, useRef, useState } from "react";
import { toWords } from "number-to-words";

export default function InvoiceTemplate({ invoice }) {

    const subtotal = invoice.subtotal || invoice.items.reduce(
        (sum, item) => sum + item.finalAmount,
        0
    );
    const amountInWords =
  toWords(Math.round(invoice.totalAmount))
    .replace(/\b\w/g, (c) => c.toUpperCase()) +
  " Rupees Only";

    // ---------- one-page fit ----------
    // Rows now take only the height they need. Few items -> a filler row
    // pushes the totals/footer to the bottom of the A4 page. Many items ->
    // spacing & font shrink step by step until everything fits one page.
    const A4_PX = Math.floor((297 * 96) / 25.4) - 2;

    const itemCount = invoice.items?.length || 0;
    const baseLevel =
        itemCount <= 8 ? 0 :
        itemCount <= 14 ? 1 :
        itemCount <= 20 ? 2 :
        itemCount <= 28 ? 3 :
        itemCount <= 38 ? 4 : 5;

    const MAX_LEVEL = 5;

    // stable signature so we only re-fit when the document really changes
    const sig = [
        invoice._id,
        itemCount,
        invoice.totalAmount,
        invoice.termsAndConditions?.length || 0,
    ].join("|");

    const [extraLevel, setExtraLevel] = useState(0);
    const [fillerPx, setFillerPx] = useState(0);

    const rootRef = useRef(null);
    const fillerRef = useRef(null);

    const level = Math.min(MAX_LEVEL, baseLevel + extraLevel);

    const DENSITY = [
        { font: 14, py: 8 },
        { font: 13, py: 5 },
        { font: 12, py: 3 },
        { font: 11, py: 2 },
        { font: 10, py: 1 },
        { font: 9, py: 0 },
    ][level];

    const cellStyle = {
        paddingTop: DENSITY.py,
        paddingBottom: DENSITY.py,
        paddingLeft: 6,
        paddingRight: 6,
    };

    useLayoutEffect(() => {
        setExtraLevel(0);
    }, [sig]);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const currentFiller = fillerRef.current?.offsetHeight || 0;
        const contentHeight = root.offsetHeight - currentFiller;

        if (contentHeight > A4_PX && level < MAX_LEVEL) {
            setExtraLevel((e) => e + 1);
            return;
        }

        setFillerPx(Math.max(0, A4_PX - contentHeight));
    }, [sig, level]);

    return (

        <div
            id="invoice-template"
            ref={rootRef}
            className="bg-white w-[210mm] shadow-xl p-2 rounded text-sm"
            style={{ fontSize: DENSITY.font }}
        >

            {/* ================= HEADER ================= */}

            <div className="border border-black">

                <div className="grid grid-cols-2">

                    {/* LEFT SIDE */}

                    <div className="border-r border-black p-4">

                        <div className="flex gap-4">

                            {invoice.company?.logo && (

                                <img
                                    src={invoice.company.logo}
                                    alt=""
                                    className="w-28 h-28 object-contain flex-shrink-0"
                                />

                            )}

                            <div className="flex-1">

                                <h1 className="text-2xl font-bold uppercase">

                                    {invoice.company?.name}

                                </h1>

                                <p>

                                    {invoice.company?.address?.street}

                                </p>

                                <p>

                                    {invoice.company?.address?.city},{" "}
                                    {invoice.company?.address?.state},{" "}
                                    {invoice.company?.address?.country}{" "}
                                    {invoice.company?.address?.pincode}

                                </p>

                                <div className="mt-2">

                                    <div className="flex">

                                        <b className="w-20">GSTIN:</b>

                                        <span>{invoice.company?.gstin}</span>

                                    </div>

                                    <div className="flex">

                                        <b className="w-20">PAN:</b>

                                        <span>{invoice.company?.panNumber}</span>

                                    </div>

                                    <div className="flex">

                                        <b className="w-20">Mobile:</b>

                                        <span>{invoice.company?.mobile}</span>

                                    </div>

                                    <div className="flex">

                                        <b className="w-20">Email:</b>

                                        <span>{invoice.company?.email}</span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* RIGHT SIDE */}

                    <div className="flex items-center justify-center p-4">

                        <div className="grid grid-cols-2 w-full text-center">

                            <div>

                                <p className="font-bold">

                                    Invoice No.

                                </p>

                                <p>

                                    {invoice.fullInvoiceNumber}

                                </p>

                            </div>

                            <div>

                                <p className="font-bold">

                                    Invoice Date

                                </p>

                                <p>

                                    {new Date(invoice.invoiceDate).toLocaleDateString()}

                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>



            {/* ================= BILL TO ================= */}

            <div className="border-l border-r border-b border-black">

                <div className="grid grid-cols-2">

                    <div className="border-r border-black p-3">

                        <h2 className="font-bold">

                            BILL TO

                        </h2>

                        <h3 className="font-bold text-lg">

                            {invoice.party?.name}

                        </h3>

                        <p>

                            Address :
                            {" "}
                            {invoice.party?.address}

                        </p>

                        <p>

                            Mobile :
                            {" "}
                            {invoice.party?.phone}

                        </p>

                        <p>

                            Email :
                            {" "}
                            {invoice.party?.email}

                        </p>

                    </div>

                    <div className="p-3">

                        <h2 className="font-bold">

                            SHIP TO

                        </h2>

                        <h3 className="font-bold text-lg">

                            {invoice.party?.name}

                        </h3>

                        <p>

                            Address :
                            {" "}
                            {invoice.party?.address}

                        </p>

                    </div>

                </div>

            </div>


            {/* ================= ITEMS TABLE ================= */}

            <table className="w-full border border-collapse table-fixed">

                <thead>

                    <tr className="bg-gray-100 text-sm">

                        <th style={cellStyle} className="border w-[7%]">

                            S.NO.

                        </th>

                        <th style={cellStyle} className="border text-left w-[34%]">

                            ITEMS

                        </th>

                        <th style={cellStyle} className="border w-[9%]">

                            HSN

                        </th>

                        <th style={cellStyle} className="border w-[6%]">

                            QTY.

                        </th>

                        <th style={cellStyle} className="border w-[12%]">

                            RATE

                        </th>

                        <th style={cellStyle} className="border w-[10%]">

                            TAX

                        </th>

                        <th style={cellStyle} className="border w-[12%]">

                            AMOUNT

                        </th>

                    </tr>

                </thead>

                <tbody>

                    {

                        invoice.items.map((item,index)=>(

                            <tr
                                key={index}
                            >

                                <td style={cellStyle} className="border text-center align-top">

                                    {index+1}

                                </td>

                                <td style={cellStyle} className="border align-top">

                                    <div className="font-semibold">

                                        {item.name}

                                    </div>

                                    {

                                        item.itemCode &&

                                        <div className="text-xs text-gray-500 mt-1">

                                            {item.itemCode}

                                        </div>

                                    }

                                </td>

                                <td style={cellStyle} className="border text-center align-top">

                                    {item.hsnCode}

                                </td>

                                <td style={cellStyle} className="border text-center align-top">

                                    {item.qty} PCS

                                </td>

                                <td style={cellStyle} className="border text-center align-top">

                                    ₹ {Number(item.salesPrice).toLocaleString()}

                                </td>

                                <td style={cellStyle} className="border text-center align-top">

                                    ₹ {Number(item.taxAmount).toLocaleString()}

                                    <br/>

                                    <span className="text-xs">

                                        ({item.tax}%)

                                    </span>

                                </td>

                                <td style={cellStyle} className="border text-center align-top pt-2 font-semibold">

                                    ₹ {Number(item.finalAmount).toLocaleString()}

                                </td>

                            </tr>

                        ))

                    }

                    {

                        fillerPx > 4 && (

                            <tr ref={fillerRef} style={{ height: fillerPx }}>

                                {[0,1,2,3,4,5,6].map((i)=>(

                                    <td
                                        key={i}
                                        className="border"
                                        style={{ padding: 0 }}
                                    ></td>

                                ))}

                            </tr>

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

                                invoice.items.reduce(

                                    (sum,item)=>sum+item.qty,

                                    0

                                )

                            }

                        </td>

                        <td className="border"></td>

                        <td className="border text-center py-1 text-xs font-semibold">

                            ₹ {Number(invoice.totalTax).toLocaleString()}

                        </td>

                        <td className="border text-center py-1 text-xs font-semibold">

                            ₹ {Number(invoice.totalAmount).toLocaleString()}

                        </td>

                    </tr>

                    <tr>

                        <td className="border"></td>

                        <td className="border text-right pr-2 py-1 text-xs font-semibold">
                            RECEIVED AMOUNT

                        </td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border text-center py-1 text-xs font-semibold">

                            ₹ {Number(invoice.amountReceived).toLocaleString()}

                        </td>

                    </tr>

                    <tr>

                        <td className="border"></td>

                        <td className="border text-right pr-2 py-1 text-xs font-semibold">

                            BALANCE AMOUNT

                        </td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border text-center py-1 text-xs font-semibold">

                            ₹ {Number(invoice.balanceAmount).toLocaleString()}

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

                            ₹ {Number(invoice.totalDiscount).toLocaleString()}

                        </td>

                    </tr>

                    <tr>

                        <td className="border"></td>

                        <td className="border text-right pr-2 py-1 text-xs font-semibold">

                            ROUND OFF

                        </td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border"></td>

                        <td className="border text-center py-1 text-xs font-semibold">

                            ₹ {Number(invoice.roundOffDifference).toLocaleString()}

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

        {/* Amount in words */}

        <tr>

            <td
                colSpan={2}
                className="border p-2"
            >

                <div className="font-bold text-sm">

                    Total Amount (in words)

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

                    invoice.termsAndConditions?.map((term,index)=>(

                        <div
                            key={index}
                            className="mb-1"
                        >

                            {index+1}. {term}

                        </div>

                    ))

                }

            </td>

            {/* RIGHT */}

            <td
                className="border p-2 align-bottom text-center w-[35%]"
            >

                <div className="h-20 flex items-end justify-center">

                    {

                        invoice.signature?.imageUrl && (

                            <img
                                src={invoice.signature.imageUrl}
                                alt=""
                                className="max-h-16 object-contain"
                            />

                        )

                    }

                </div>

                <div className="mt-2">

                    Authorised Signatory For

                </div>

                <div className="font-semibold uppercase">

                    {invoice.company?.name}

                </div>

            </td>

        </tr>

    </tbody>

</table>

        </div>

    );

}