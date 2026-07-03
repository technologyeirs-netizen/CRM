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

import { deliveryChallanService } from "../../services/deliveryChallanService";

import DeliveryChallanTemplate from "../../components/deliveryChallanTemplate/DeliveryChallanTemplate";

export default function ViewDeliveryChallanPage() {

  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const [
    deliveryChallan,
    setDeliveryChallan,
  ] = useState(null);

  useEffect(() => {

    if (id) {
      loadDeliveryChallan();
    }

  }, [id]);

  const loadDeliveryChallan =
    async () => {

      try {

        const res =
          await deliveryChallanService.getById(
            id
          );

        console.log(
          "LOAD DELIVERY CHALLAN RES =>",
          res
        );

        setDeliveryChallan(
          res.data.deliveryChallan
        );

      } catch (error) {

        console.log(
          "LOAD DELIVERY CHALLAN ERROR =>",
          error
        );

      }

    };

  if (!deliveryChallan) {

    return (
      <div className="p-10">
        Loading...
      </div>
    );

  }

  const generateFileName =
    () => {

      const customer =
        deliveryChallan.party?.name
          ?.trim()
          ?.replace(/\s+/g, "_")
          ?.toUpperCase();

      const challanNumber =
        deliveryChallan.fullDeliveryChallanNumber?.replace(
          /\//g,
          "_"
        );

      return `${customer}_Delivery_Challan_${challanNumber}`;

    };

  const downloadPDF =
    () => {

      const element =
        document.getElementById(
          "delivery-challan-template"
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

  const printDeliveryChallan =
    () => {

      const element =
        document.getElementById(
          "delivery-challan-template"
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
              Delivery Challan Details
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              View complete delivery challan information
            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={
              printDeliveryChallan
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

            <button
                onClick={() =>
                navigate(
                    `/delivery-challan/edit/${deliveryChallan._id}`
                )
                }
                className="h-11 px-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium"
            >
                Edit Delivery Challan
            </button>

        </div>

      </div>

      <div className="flex justify-center">

        <DeliveryChallanTemplate
          deliveryChallan={
            deliveryChallan
          }
        />

      </div>

    </div>

  );

}