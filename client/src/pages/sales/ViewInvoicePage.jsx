import React, { useEffect, useState } from "react";
import InvoiceTemplate from "../../components/invoiceTemplate/InvoiceTemplate";
import html2pdf from "html2pdf.js";
import {
  ArrowLeft,
  Download,
  Printer,
  Pencil,
  Calendar,
  User,
  Receipt,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { salesInvoiceService } from "../../services/salesInvoiceService";
export default function ViewInvoicePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);

useEffect(() => {
  loadInvoice();
}, []);

const loadInvoice = async () => {
  const res = await salesInvoiceService.getById(id);
  setInvoice(res.data.invoice);
};

  if (!invoice) {
    return <div>Loading...</div>;
  }

  const subtotal = invoice.items.reduce(
    (acc, item) => acc + item.qty * item.salesPrice,
    0
  );
  const generateFileName = () => {
  const customer = invoice.party?.name
    ?.trim()
    .replace(/\s+/g, "_")
    .toUpperCase();

  const invoiceNo = invoice.fullInvoiceNumber
    ?.replace(/\//g, "_");

  return `${customer}_Invoice_${invoiceNo}`;
};

const downloadPDF = () => {
  const element = document.getElementById("invoice-template");

  const opt = {
    margin: 0,
    filename: `${generateFileName()}.pdf`,
    image: {
      type: "jpeg",
      quality: 1,
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
  };

  html2pdf().set(opt).from(element).save();
};

const printInvoice = () => {
  const element = document.getElementById("invoice-template");

  const opt = {
    margin: 0,
    filename: "temp.pdf",
    image: {
      type: "jpeg",
      quality: 1,
    },
    html2canvas: {
      scale: 2,
      useCORS: true,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
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
              Invoice Details
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              View complete invoice information
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={printInvoice}
            className="h-11 px-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium"
          >
            <Printer size={16} />
            Print
          </button>

          <button 
            className="h-11 px-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium"
            onClick={downloadPDF}>
            <Download size={16} />
            Download
          </button>

          <button
            onClick={() =>
              navigate(`/invoice/create?id=${invoice._id}`)
            }
             className="h-11 px-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium">
            Edit Invoice
          </button>
        </div>
      </div>
      <div className="flex justify-center">
          <InvoiceTemplate
              invoice={invoice}
          />
      </div>
    </div>
  );
}