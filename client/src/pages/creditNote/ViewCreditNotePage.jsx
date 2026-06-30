import React, {
  useEffect,
  useState,
} from "react";

import html2pdf from "html2pdf.js";

import {
  ArrowLeft,
  Download,
  Printer,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { creditNoteService } from "../../services/creditNoteService";

import CreditNoteTemplate from "../../components/creditNoteTemplate/CreditNoteTemplate";

export default function ViewCreditNotePage() {

  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const [creditNote,
    setCreditNote] =
    useState(null);

  useEffect(() => {

    if (id) {
      loadCreditNote();
    }

  }, [id]);

  const loadCreditNote =
    async () => {

      try {

        const res =
          await creditNoteService.getById(
            id
          );
          console.log("LOAD CREDIT NOTE RES =>",
          res);

        setCreditNote(
          res.data.creditNote
        );

      } catch (error) {

        console.log(
          "LOAD CREDIT NOTE ERROR =>",
          error
        );

      }
    };

  if (!creditNote) {

    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  const generateFileName =
    () => {

      const customer =
        creditNote.party?.name
          ?.trim()
          ?.replace(/\s+/g, "_")
          ?.toUpperCase();

      const noteNumber =
        creditNote.fullCreditNoteNumber
          ?.replace(/\//g, "_");

      return `${customer}_Credit_Note_${noteNumber}`;
    };

  const downloadPDF =
    () => {

      const element =
        document.getElementById(
          "credit-note-template"
        );

      const opt = {
        margin: 0,

        filename:
          `${generateFileName()}.pdf`,

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
          orientation:
            "portrait",
        },
      };

      html2pdf()
        .set(opt)
        .from(element)
        .save();
    };

  const printCreditNote =
    () => {

      const element =
        document.getElementById(
          "credit-note-template"
        );

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
          orientation:
            "portrait",
        },
      };

      html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .get("pdf")
        .then((pdf) => {

          window.open(
            pdf.output("bloburl"),
            "_blank"
          );

        });
    };

  return (

    <div className="min-h-screen bg-[#f5f7fb] p-6">

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-6">

        <div className="flex items-center gap-4">

          <button
            onClick={() =>
              navigate(-1)
            }
            className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
          </button>

          <div>

            <h1 className="text-3xl font-bold text-slate-800">
              Credit Note Details
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              View complete credit
              note information
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={
              printCreditNote
            }
            className="h-11 px-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium"
          >
            <Printer size={16} />

            Print
          </button>

          <button
            onClick={
              downloadPDF
            }
            className="h-11 px-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium"
          >
            <Download size={16} />

            Download
          </button>

          {/* <button
            onClick={() =>
              navigate(
                `/credit-note/create?id=${creditNote._id}`
              )
            }
            className="h-11 px-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium"
          >
            Edit Credit Note
          </button> */}

        </div>

      </div>

      <div className="flex justify-center">

        <CreditNoteTemplate
          creditNote={
            creditNote
          }
        />

      </div>

    </div>
  );
}