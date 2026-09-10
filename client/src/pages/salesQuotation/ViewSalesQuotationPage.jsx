import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { ArrowLeft, Download, Printer, ArrowRightLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { salesQuotationService } from "../../services/salesQuotationService";
import InvoiceTemplate from "../../components/invoiceTemplate/InvoiceTemplate";
import { toast } from "react-hot-toast";

export default function ViewSalesQuotationPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [quotation, setQuotation] = useState(null);

  useEffect(() => {
    if (id) {
      loadQuotation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadQuotation = async () => {
    try {
      const res = await salesQuotationService.getById(id);
      setQuotation(res.data.quotation);
    } catch (error) {
      console.log("LOAD SALES QUOTATION ERROR =>", error);
    }
  };

  const handleConvertToInvoice = async () => {
    try {
      const ok = window.confirm(
        "Convert this quotation to a Sales Invoice? This will deduct the item quantities from stock."
      );
      if (!ok) return;

      const res = await salesQuotationService.convertToInvoice(id, {});

      if (res.data.success) {
        toast.success("Quotation converted to Sales Invoice successfully");
        navigate("/invoice");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to convert quotation to invoice"
      );
    }
  };

  if (!quotation) {
    return <div className="p-10">Loading...</div>;
  }

  // The InvoiceTemplate is reused as-is (same layout, same fields).
  // We only remap the quotation's field names onto the names the
  // template already expects (fullInvoiceNumber / invoiceDate).
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
              Sales Quotation Details
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              {quotation.status === "Converted"
                ? `Converted to Invoice ${quotation.convertedInvoiceNumber}`
                : "Item quantity has not been deducted from stock yet"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {quotation.status !== "Converted" && (
            <button
              onClick={handleConvertToInvoice}
              className="h-11 px-5 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
            >
              <ArrowRightLeft size={16} />
              Convert to Invoice
            </button>
          )}

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
