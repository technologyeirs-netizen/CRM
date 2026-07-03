 

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { clientService } from "../../services/clientService";
import { salesSettingService } from "../../services/salesSettingService";
import { salesInvoiceService } from "../../services/salesInvoiceService";
import { creditNoteService } from "../../services/creditNoteService";

import InvoiceHeader from "../../components/invoice/InvoiceHeader";
import SalesInvoicePartySection from "../../components/invoice/SalesInvoicePartySection";
import InvoiceItemsTable from "../../components/invoice/InvoiceItemsTable";
import InvoiceNotesSection from "../../components/invoice/invoiceNotesSection";
import InvoiceFloatingHelp from "../../components/invoice/InvoiceFloatingHelp";

// import CreditNoteMetaSection from "../../components/creditNote/CreditNoteMetaSection";
// import CreditNoteInvoiceLookup from "../../components/creditNote/CreditNoteInvoiceLookup";

export default function EditCreditNotePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const creditNoteId = searchParams.get("id");

  const [salesSettings, setSalesSettings] =
    useState(null);

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

  const [salesInvoices,
    setSalesInvoices] =
    useState([]);

  const [selectedInvoice,
    setSelectedInvoice] =
    useState(null);

  const [creditNotePrefix,
    setCreditNotePrefix] =
    useState("");

  const [creditNoteNumber,
    setCreditNoteNumber] =
    useState("");

  const [creditNoteDate,
    setCreditNoteDate] =
    useState("");

  const [creditNoteItems,
    setCreditNoteItems] =
    useState([]);

  const [notes, setNotes] =
    useState("");

  const [isNotesOpen,
    setIsNotesOpen] =
    useState(true);

  const [isTermsOpen,
    setIsTermsOpen] =
    useState(true);

    const fetchSalesSettings =
  useCallback(async () => {
    try {
      const { data } =
        await salesSettingService.get();

      setSalesSettings(data.setting);
    } catch {
      toast.error(
        "Failed to load settings"
      );
    }
  }, []);

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
    } catch {
      toast.error(
        "Failed to load clients"
      );
    } finally {
      setClientsLoading(false);
    }
  }, [clientFilters]);

  const fetchPartyInvoices =
  useCallback(async (partyId) => {
    try {
      const { data } =
        await salesInvoiceService.getAll({
          clientId: partyId,
          limit: 500,
        });

      setSalesInvoices(
        data?.invoices || []
      );
    } catch {
      toast.error(
        "Failed to load invoices"
      );
    }
  }, []);

  const fetchSingleCreditNote =
  useCallback(async () => {
    try {
      if (!creditNoteId) return;

      const { data } =
        await creditNoteService.getById(
          creditNoteId
        );

      const note =
        data.creditNote;

      setSelectedParty(
        note.party
      );

      setSelectedInvoice({
        _id: note.salesInvoiceId,
        fullInvoiceNumber:
          note.salesInvoiceNumber,
      });

      setCreditNotePrefix(
        note.creditNotePrefix
      );

      setCreditNoteNumber(
        note.creditNoteNumber
      );

      setCreditNoteDate(
        note.creditNoteDate
          ?.split("T")[0]
      );

      setCreditNoteItems(
        note.items || []
      );

      setNotes(
        note.notes || ""
      );

      if (
        note.party?.clientId
      ) {
        fetchPartyInvoices(
          note.party.clientId
        );
      }
    } catch {
      toast.error(
        "Failed to load credit note"
      );
    }
  }, [
    creditNoteId,
    fetchPartyInvoices,
  ]);

  useEffect(() => {
  fetchSalesSettings();
  fetchClients();
  fetchSingleCreditNote();
}, []);

const handleSaveCreditNote =
  async () => {
    try {
      const payload = {
        salesInvoiceId:
          selectedInvoice?._id,

        salesInvoiceNumber:
          selectedInvoice?.fullInvoiceNumber,

        party: {
          clientId:
            selectedParty?._id,

          name:
            `${selectedParty?.firstName || ""}
             ${selectedParty?.lastName || ""}`.trim(),
        },

        creditNotePrefix,
        creditNoteNumber,
        creditNoteDate,

        items:
          creditNoteItems,

        notes,
      };

      await creditNoteService.update(
        creditNoteId,
        payload
      );

      toast.success(
        "Credit Note Updated"
      );

      setTimeout(() => {
        navigate("/credit-note");
      }, 1000);

    } catch (error) {
      toast.error(
        error?.response?.data
          ?.message ||
          "Failed to update credit note"
      );
    }
  };
  return (
  <div className="min-h-screen bg-gray-100">

    <InvoiceHeader
      isEditMode={true}
      handleBackRedirect={() =>
        navigate("/credit-note")
      }
      handleSaveInvoice={
        handleSaveCreditNote
      }
    />

    <main className="p-4 max-w-[1600px] mx-auto space-y-4">

      <SalesInvoicePartySection
        selectedParty={selectedParty}
        setSelectedParty={setSelectedParty}
        showPartyDropdown={showPartyDropdown}
        setShowPartyDropdown={setShowPartyDropdown}
        clients={clients}
        clientsLoading={clientsLoading}
        clientFilters={clientFilters}
        setClientFilters={setClientFilters}
      />

      <CreditNoteMetaSection
        creditNotePrefix={creditNotePrefix}
        creditNoteNumber={creditNoteNumber}
        creditNoteDate={creditNoteDate}
        setCreditNoteDate={setCreditNoteDate}
      />

      <CreditNoteInvoiceLookup
        salesInvoices={salesInvoices}
        selectedInvoice={selectedInvoice}
        setSelectedInvoice={setSelectedInvoice}
      />

      <InvoiceItemsTable
        invoiceItems={creditNoteItems}
        setInvoiceItems={setCreditNoteItems}
      />

      <InvoiceNotesSection
        settings={salesSettings}
        notes={notes}
        setNotes={setNotes}
        isNotesOpen={isNotesOpen}
        setIsNotesOpen={setIsNotesOpen}
        isTermsOpen={isTermsOpen}
        setIsTermsOpen={setIsTermsOpen}
        termsKey="creditNote"
      />

    </main>

    <InvoiceFloatingHelp />
  </div>
);
}