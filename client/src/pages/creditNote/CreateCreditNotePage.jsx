
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { clientService } from "../../services/clientService";
import { salesSettingService } from "../../services/salesSettingService";
import { salesInvoiceService } from "../../services/salesInvoiceService";
import { creditNoteService } from "../../services/creditNoteService";
import CreditNoteMetaSection from "../../components/creditNote/CreditNoteMetaSection";
import CreditNoteInvoiceLookup from "../../components/creditNote/CreditNoteInvoiceLookup";
import InvoiceHeader from "../../components/invoice/InvoiceHeader";
import SalesInvoicePartySection from "../../components/invoice/SalesInvoicePartySection";
import InvoiceNotesSection from "../../components/invoice/invoiceNotesSection";
import InvoiceFloatingHelp from "../../components/invoice/InvoiceFloatingHelp";
import CreditNoteItemsPreview from "../../components/creditNote/CreditNoteItemsPreview";
import CreditNoteSummary from "../../components/creditNote/CreditNoteSummary";
export default function CreateCreditNotePage() {
const navigate = useNavigate();
const [searchParams] = useSearchParams();

const creditNoteId = searchParams.get("id");

// =========================
// MODE
// =========================

const [isEditMode, setIsEditMode] =
useState(false);

// =========================
// SETTINGS
// =========================

const [salesSettings, setSalesSettings] =
useState(null);

// =========================
// PARTY
// =========================

const [selectedParty, setSelectedParty] =
useState(null);

const [clients, setClients] =
useState([]);

const [clientsLoading, setClientsLoading] =
useState(false);

const [showPartyDropdown,
setShowPartyDropdown] =
useState(false);

const [clientFilters,
setClientFilters] =
useState({
search: "",
page: 1,
limit: 20,
});

// =========================
// SALES INVOICE LOOKUP
// =========================

const [salesInvoices,
setSalesInvoices] =
useState([]);

const [selectedInvoiceId,
setSelectedInvoiceId] =
useState(null);

const [selectedInvoice,
setSelectedInvoice] =
useState(null);

// =========================
// CREDIT NOTE DETAILS
// =========================

const [creditNotePrefix,
setCreditNotePrefix] =
useState("");

const [creditNoteNumber,
setCreditNoteNumber] =
useState("");

const [creditNoteDate,
setCreditNoteDate] =
useState(
new Date()
.toISOString()
.split("T")[0]
);

// =========================
// ITEMS
// =========================

const [creditNoteItems,
setCreditNoteItems] =
useState([]);

// =========================
// NOTES
// =========================

const [notes, setNotes] =
useState("");

const [isNotesOpen,
setIsNotesOpen] =
useState(true);

const [isTermsOpen,
setIsTermsOpen] =
useState(true);

// =========================
// FETCH SETTINGS
// =========================

const fetchSalesSettings =
useCallback(async () => {
try {
const { data } =
await salesSettingService.get();

    setSalesSettings(data.setting);
  } catch (error) {
    toast.error(
      "Failed to load settings"
    );
  }
}, []);

// =========================
// FETCH CLIENTS
// =========================

const fetchClients =
useCallback(async () => {
try {
setClientsLoading(true);

    const { data } =
      await clientService.getAll(
        clientFilters
      );

    setClients(
      data?.clients || []
    );
  } catch (error) {
    toast.error(
      "Failed to load clients"
    );
  } finally {
    setClientsLoading(false);
  }
}, [clientFilters]);

// =========================
// FETCH INVOICES OF PARTY
// =========================

const fetchPartyInvoices =
useCallback(async (partyId) => {
  try {

    const { data } =
      await salesInvoiceService.getAll();
    console.log("ALL INVOICES =>", data.invoices);
    const filteredInvoices =
      (data?.invoices || []).filter(
        (invoice) =>
          String(invoice.clientId) ===
          String(partyId)
      );

    setSalesInvoices(
      filteredInvoices
    );

  } catch (error) {
    toast.error(
      "Failed to load invoices"
    );
  }
}, []);

// =========================
// AUTO NUMBER
// =========================

useEffect(() => {
if (
!salesSettings ||
creditNoteId
)
return;

const pref =
  salesSettings.creditNotePreferences;

if (!pref) return;

setCreditNotePrefix(
  `${pref.creditNotePrefix || ""}${
    pref.financialYear || ""
  }/`
);

setCreditNoteNumber(
  String(
    pref.currentCreditNoteNumber || 1
  ).padStart(4, "0")
);

}, [salesSettings, creditNoteId]);

// =========================
// INITIAL LOAD
// =========================

useEffect(() => {
fetchSalesSettings();
fetchClients();

if (creditNoteId) {
  setIsEditMode(true);
}

}, []);

// =========================
// PARTY CHANGE
// =========================

useEffect(() => {
  if (!selectedParty?._id) {
    setSalesInvoices([]);
    setSelectedInvoice(null);
    setSelectedInvoiceId(null);
    return;
  }

  setSelectedInvoice(null);
  setSelectedInvoiceId(null);

  setCreditNoteItems([]);
  setNotes("");

  fetchPartyInvoices(
    selectedParty._id
  );

}, [selectedParty, fetchPartyInvoices]);

// =========================
// LOAD SELECTED INVOICE
// =========================

useEffect(() => {

  const fetchInvoice =
    async () => {

      if (!selectedInvoiceId)
        return;

      try {

        const { data } =
          await salesInvoiceService.getById(
            selectedInvoiceId
          );

        const invoice =
          data.invoice;

        setSelectedInvoice(
          invoice
        );

        setCreditNoteItems(
          invoice.items || []
        );

        setNotes(
          invoice.notes || ""
        );

      } catch (error) {

        toast.error(
          "Failed to load invoice"
        );

      }
    };

  fetchInvoice();

}, [selectedInvoiceId]);

// =========================
// SAVE
// =========================

const handleSaveCreditNote =
async () => {
try {
if (!selectedParty) {
return toast.error(
"Please select party"
);
}

    if (!selectedInvoice) {
      return toast.error(
        "Please select invoice"
      );
    }

    const payload = {
      creditNotePrefix,
      creditNoteNumber,
      creditNoteDate,
      notes,
      termsAndConditions:
        salesSettings?.termsAndConditions?.creditNote || [],
    };

    if (isEditMode) {
      await creditNoteService.update(
        creditNoteId,
        payload
      );

      toast.success(
        "Credit Note Updated"
      );
    } else {
      await creditNoteService.createFromInvoice(
        selectedInvoiceId,
        payload
      );

      toast.success(
        "Credit Note Created"
      );
    }

    setTimeout(() => {
      navigate("/credit-note");
    }, 1000);
  } catch (error) {
    toast.error(
      error?.response?.data
        ?.message ||
        "Failed to save credit note"
    );
  }
};

return ( <div className="min-h-screen bg-gray-100">

  <InvoiceHeader
    isEditMode={isEditMode}
    handleBackRedirect={() =>
      navigate("/credit-note")
    }
    title={
      isEditMode
        ? "Update Credit Note"
        : "Create Credit Note"
    }
    handleSaveInvoice={
      handleSaveCreditNote
    }
  />

  <main className="p-4 max-w-[1600px] mx-auto space-y-4">

    {/* PARTY */}

    <SalesInvoicePartySection
      selectedParty={
        selectedParty
      }
      setSelectedParty={
        setSelectedParty
      }
      showPartyDropdown={
        showPartyDropdown
      }
      setShowPartyDropdown={
        setShowPartyDropdown
      }
      clients={clients}
      clientsLoading={
        clientsLoading
      }
      clientFilters={
        clientFilters
      }
      setClientFilters={
        setClientFilters
      }
    />

    <CreditNoteMetaSection
  creditNotePrefix={creditNotePrefix}
  creditNoteNumber={creditNoteNumber}
  creditNoteDate={creditNoteDate}
  setCreditNoteDate={setCreditNoteDate}
/>

<CreditNoteInvoiceLookup
  salesInvoices={salesInvoices}
  selectedInvoiceId={
    selectedInvoiceId
  }
  setSelectedInvoiceId={
    setSelectedInvoiceId
  }
/>

    {/* Items Table */}

{selectedInvoice && (
  <>
    <CreditNoteItemsPreview
      items={creditNoteItems}
      subtotal={selectedInvoice?.subtotal}
      totalDiscount={selectedInvoice?.totalDiscount}
      totalTax={selectedInvoice?.totalTax}
    />

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

      <div className="lg:col-span-6">

        <InvoiceNotesSection
          settings={salesSettings}
          notes={notes}
          setNotes={setNotes}
          isNotesOpen={isNotesOpen}
          setIsNotesOpen={setIsNotesOpen}
          isTermsOpen={isTermsOpen}
          setIsTermsOpen={setIsTermsOpen}
          termsKey="creditNote"
          showTermsKey="creditNotePreferences"
        />

      </div>

      <div className="lg:col-span-6">

        <CreditNoteSummary
          invoice={selectedInvoice}
        />

      </div>

    </div>
  </>
)}

  </main>

  <InvoiceFloatingHelp />
</div>
);
}
