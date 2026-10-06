import html2pdf from "html2pdf.js";
import { jsPDF } from "jspdf";

// A4 size in mm
const A4_W = 210;
const A4_H = 297;

/**
 * Renders the element to a canvas and puts it on a SINGLE A4 page.
 * If the content is taller than one page (lots of items) it is scaled
 * down to fit, so the print/PDF never spills onto a second page.
 */
const buildSinglePagePdf = async (elementId = "invoice-template") => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found`);

  const canvas = await html2pdf()
    .set({ html2canvas: { scale: 2, useCORS: true } })
    .from(element)
    .toCanvas()
    .get("canvas")
    .then((c) => c);

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  let w = A4_W;
  let h = (canvas.height * w) / canvas.width;

  if (h > A4_H) {
    h = A4_H;
    w = (canvas.width * h) / canvas.height;
  }

  const x = (A4_W - w) / 2;

  pdf.addImage(canvas.toDataURL("image/jpeg", 1), "JPEG", x, 0, w, h);

  return pdf;
};

export const downloadInvoicePdf = async (fileName, elementId) => {
  const pdf = await buildSinglePagePdf(elementId);
  pdf.save(`${fileName}.pdf`);
};

export const openInvoicePdf = async (elementId) => {
  // open the tab first (inside the click) so the popup blocker doesn't stop it
  const win = window.open("", "_blank");
  try {
    const pdf = await buildSinglePagePdf(elementId);
    const url = pdf.output("bloburl");
    if (win) win.location.href = url;
    else window.open(url, "_blank");
  } catch (err) {
    if (win) win.close();
    throw err;
  }
};
