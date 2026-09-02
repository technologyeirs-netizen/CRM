import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { convertedQuotationService } from "../../services/convertedQuotationService";
import InvoiceTemplate from "../../components/invoiceTemplate/InvoiceTemplate";

export default function ViewConvertedQuotationPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [quotation, setQuotation] = useState(null);

  useEffect(() => {
    if (id) {
      loadQuotation();
    }
  }, [id]);

  const loadQuotation = async () => {
    try {
      const res = await convertedQuotationService.getById(id);
      setQuotation(res.data.quotation);
    } catch (error) {
      console.log("LOAD CONVERTED QUOTATION ERROR =>", error);
    }
  };

  if (!quotation) {
    return <div className="p-10">Loading...</div>;
  }

  // The InvoiceTemplate is reused as-is (same layout, same fields).
  // We only remap the quotation's field names onto the names the
  // template already expects (fullInvoiceNumber / invoiceDate),
  // everything else in the template stays untouched.
  const templateData = {
    ...quotation,
    fullInvoiceNumber: quotation.fullQuotationNumber,
    invoiceDate: quotation.quotationDate,
  };

  const generateFileName = () => {
    const customer = quotation.party?.name
      ?.trim()
      ?.replace(/\s+/g, "_")
      ?.toUpperCase();

    const quotationNo = quotation.fullQuotationNumber?.replace(/\//g, "_");

    return `${customer}_Quotation_${quotationNo}`;
  };

  const downloadPDF = () => {
    const element = document.getElementById("invoice-template");

    const opt = {
      margin: 0,
      filename: `${generateFileName()}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const printQuotation = () => {
    const element = document.getElementById("invoice-template");

    const opt = {
      margin: 0,
      filename: "temp.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        window.open(pdf.output("bloburl"), "_blank");
      });
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Converted Quotation Details
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              Converted from Invoice {quotation.salesInvoiceNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={printQuotation}
            className="h-11 px-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium"
          >
            <Printer size={16} />
            Print
          </button>

          <button
            onClick={downloadPDF}
            className="h-11 px-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <InvoiceTemplate invoice={templateData} />
      </div>
    </div>
  );
}
