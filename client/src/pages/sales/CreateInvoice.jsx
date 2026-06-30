// File Name: CreateSalesInvoicePage.jsx
 

import { salesInvoiceService } from "../../services/salesInvoiceService";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { salesSettingService } from "../../services/salesSettingService";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { clientService } from "../../services/clientService";
import { itemService } from "../../services/itemService";
import { categoryService } from "../../services/categoryService";
import InvoiceHeader from "../../components/invoice/InvoiceHeader";
import SalesInvoicePartySection from "../../components/invoice/SalesInvoicePartySection";
import InvoiceMetaSection from "../../components/invoice/InvoiceMetaSection";
import InvoiceItemsTable from "../../components/invoice/InvoiceItemsTable";
import { useInvoiceCalculations } from "../../hooks/useInvoiceCalculations";
import InvoiceSummarySection from "../../components/invoice/InvoiceSummarySection";
import InvoiceNotesSection from "../../components/invoice/InvoiceNotesSection";
import InvoiceBankDetailsSection from "../../components/invoice/InvoiceBankDetailsSection";
import InvoiceItemModal from "../../components/invoice/InvoiceItemModal";
import InvoiceGodownModal from "../../components/invoice/InvoiceGodownModal";
import InvoiceFloatingHelp from "../../components/invoice/InvoiceFloatingHelp";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

// service import

export default function CreateSalesInvoicePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const invoiceId = searchParams.get("id");
  // --- Modals & UI States ---

  // CLIENT API STATES
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const [clientFilters, setClientFilters] = useState({
    search: "",
    page: 1,
    limit: 20,
  });

  const [categories, setCategories] = useState([]);

  const [itemsApiList, setItemsApiList] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [itemFilters, setItemFilters] = useState({
    search: "",
    page: 1,
    limit: 200,
  });
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [godownQty, setGodownQty] = useState(1);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showGodownModal, setShowGodownModal] = useState(false);
  const [selectedItemForGodown, setSelectedItemForGodown] = useState(null);
  const [selectedTCS, setSelectedTCS] = useState(null);
  const [markAsPaid, setMarkAsPaid] = useState(false);

  // --- Dynamic Visibility Controls for Bottom Fields ---
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isDiscountOpen, setIsDiscountOpen] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [isAdditionalChargesOpen, setIsAdditionalChargesOpen] = useState(true);
  const [salesSettings, setSalesSettings] = useState(null);
  console.log("salesSettings =", salesSettings);
  // --- Invoice Core States (Bind your API Data here) ---
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("2026-05-21");
  const [paymentTerms, setPaymentTerms] = useState(30);
  const [dueDate, setDueDate] = useState("2026-06-20");

  // Invoice items array that builds up the billing table
  const [invoiceItems, setInvoiceItems] = useState([]);

  // Footer fields
  const [notes, setNotes] = useState("");
  const [isTermsOpen, setIsTermsOpen] = useState(true);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [applyTCS, setApplyTCS] = useState(false);
  const [autoRoundOff, setAutoRoundOff] = useState(false);
  const [amountReceived, setAmountReceived] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [paymentMode, setPaymentMode] = useState("Cash");

  // --- API Search / Dummy List placeholders ---

  const tcsRates = [
    {
      label: "0.1% Scrap",
      rate: 0.1,
    },
    {
      label: "0.75% Timber Wood",
      rate: 0.75,
    },
    {
      label: "1% Liquor for Human Consumption",
      rate: 1,
    },
    {
      label: "1% Parking Lot / Toll Plaza",
      rate: 1,
    },
    {
      label: "2% Minerals & Coal",
      rate: 2,
    },
    {
      label: "5% Overseas Tour Package",
      rate: 5,
    },
    {
      label: "0.1% Motor Vehicle Above Limit",
      rate: 0.1,
    },
  ];

  const fetchClients = useCallback(async () => {
    setClientsLoading(true);

    try {
      const { data } = await clientService.getAll(clientFilters);

      const clientList = Array.isArray(data?.clients)
        ? data.clients
        : Array.isArray(data?.items)
          ? data.items
          : [];

      setClients(clientList);
    } catch (error) {
      toast.error("Failed to load clients");
      setClients([]);
    }

    setClientsLoading(false);
  }, [clientFilters]);

  const fetchItems = useCallback(async () => {
    setItemsLoading(true);

    try {
      const { data } = await itemService.getAll(itemFilters);

      const itemList = Array.isArray(data?.items) ? data.items : [];

      setItemsApiList(itemList);
    } catch (error) {
      toast.error("Failed to load items");
      setItemsApiList([]);
    }

    setItemsLoading(false);
  }, [itemFilters]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await categoryService.getAll({
        page: 1,
        limit: 200,
      });

      setCategories(Array.isArray(data?.categories) ? data.categories : []);
    } catch (error) {
      toast.error("Failed to load categories");
      setCategories([]);
    }
  }, []);

  const fetchSalesSettings = useCallback(async () => {
    try {
      const { data } =
        await salesSettingService.get();
         console.log(data.setting);
      setSalesSettings(data.setting);

const defaultBank =
  data.setting?.bankAccounts?.find(
    bank =>
      String(bank._id) ===
      String(
        data.setting.invoicePreferences
          ?.defaultBankAccountId
      )
  ) || data.setting?.bankAccounts?.[0];

setSelectedBankDetails(defaultBank);
    } catch (error) {
      console.log(error);

      toast.error(
        "Failed to load Sales Settings"
      );
    }
  }, []);
  useEffect(() => {
    if (!salesSettings) return;

    setPaymentTerms(
      salesSettings?.invoicePreferences
        ?.defaultPaymentTerms || 0
    );

    setPaymentMode(
      salesSettings?.invoicePreferences
        ?.defaultPaymentMode || "Cash"
    );

    setAutoRoundOff(
      salesSettings?.invoicePreferences
        ?.autoRoundOff || false
    );
  }, [salesSettings]);
  useEffect(() => {
    fetchCategories();
    fetchItems();
    fetchClients();
    fetchSalesSettings();

    if (invoiceId) {
      setIsEditMode(true); // ADD THIS
      fetchSingleInvoice();
    }
  }, [invoiceId]);

  useEffect(() => {
    const close = () => setShowPartyDropdown(false);

    window.addEventListener("click", close);

    return () => {
      window.removeEventListener("click", close);
    };
  }, []);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F7") {
        e.preventDefault();
        setShowItemModal(true);
      }
      if (e.key === "Escape") {
        setShowItemModal(false);
        setShowGodownModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Handle Back Redirection ---
  const handleBackRedirect = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/invoice";
    }
  };
  // ================================
  // AUTO INVOICE GENERATOR
  // ================================
useEffect(() => {
  if (invoiceId) return;

  const pref = salesSettings?.invoicePreferences;

  if (!pref) return;

  setInvoicePrefix(
  `${pref.invoicePrefix || ""}${
    pref.financialYear || ""
  }/`
);

  setInvoiceNumber(
    String(pref.currentInvoiceNumber ?? 1).padStart(4, "0")
  );

  setPaymentTerms(pref.defaultPaymentTerms ?? 0);

  setPaymentMode(pref.defaultPaymentMode ?? "Cash");

  setAutoRoundOff(pref.autoRoundOff ?? false);
}, [salesSettings, invoiceId]);


  // --- Real-time Math Calculations ---
  // --- Real-time Math Calculations ---

  const {
    subtotal,
    taxableAmount,
    tcsAmount,
    roundOffDifference,
    totalAmount,
    balanceAmount,
    totalDiscount,
    totalTax,
  } = useInvoiceCalculations({
    invoiceItems,
    globalDiscount,
    additionalCharges,
    applyTCS,
    selectedTCS,
    autoRoundOff,
    amountReceived,
  });

  const invoiceStatus =
    Number(amountReceived) >= Number(totalAmount) ? "Paid" : "Unpaid";

  const payload = {
    party: {
      _id: selectedParty?._id,
      name: `${selectedParty?.firstName || ""} ${selectedParty?.lastName || ""}`.trim(),
      phone: selectedParty?.phone || "",
      email: selectedParty?.email || "",
      address: selectedParty?.address || "",
      balance: selectedParty?.balance || 0,
    },

    invoicePrefix,
    invoiceNumber,
    fullInvoiceNumber: `${invoicePrefix}${invoiceNumber}`,
    invoiceDate,
    paymentTerms,
    dueDate,

    invoiceItems,

    notes,

    globalDiscount,
    additionalCharges,

    applyTCS,
    selectedTCS,

    autoRoundOff,
    roundOffDifference,

    subtotal,
    taxableAmount,
    totalDiscount,
    totalTax,
    tcsAmount,
    totalAmount,

    amountReceived,
    balanceAmount,

    paymentMode,

    status: invoiceStatus,

    markAsPaid,
  };

  const handleSaveInvoice = async () => {
  try {
    if (!selectedParty) {
      return toast.error("Please select party");
    }

    if (!invoiceItems || invoiceItems.length === 0) {
      return toast.error("Please add items");
    }

    const payload = {
      party: {
        _id: selectedParty?._id,
        name: `${selectedParty?.firstName || ""} ${
          selectedParty?.lastName || ""
        }`.trim(),
        phone: selectedParty?.phone || "",
        email: selectedParty?.email || "",
        address: selectedParty?.address || "",
        balance: selectedParty?.balance || 0,
      },

      invoicePrefix,
      invoiceNumber,
      invoiceDate,
      paymentTerms,
      dueDate,

      invoiceItems,

      notes,

      termsAndConditions:
        salesSettings?.termsAndConditions?.salesInvoice || [],

      company: salesSettings?.company || {},

      bankDetails: selectedBankDetails || {},

      signature: salesSettings?.signature || {},

      globalDiscount,
      additionalCharges,

      applyTCS,
      selectedTCS,

      autoRoundOff,
      roundOffDifference,

      subtotal,
      taxableAmount,
      totalDiscount,
      totalTax,
      tcsAmount,
      totalAmount,

      amountReceived,
      balanceAmount,

      paymentMode,

      status: invoiceStatus,
      markAsPaid,
    };

    if (isEditMode) {
      await salesInvoiceService.update(invoiceId, payload);

      toast.success("Invoice Updated Successfully");
    } else {
      await salesInvoiceService.create(payload);

      toast.success("Invoice Created Successfully");
    }

    setTimeout(() => {
      navigate("/invoice");
    }, 1000);
  } catch (error) {
  console.error("SAVE INVOICE ERROR:", error);

  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Failed to save invoice";

  toast.error(message, {
    duration: 4000,
  });
}
};

  const fetchSingleInvoice = useCallback(async () => {
    try {
      if (!invoiceId) return;

      const { data } = await salesInvoiceService.getById(invoiceId);

      const invoice = data?.invoice;

      if (!invoice) return;

      // PARTY
      setSelectedParty({
        _id: invoice?.party?._id || invoice?.party?.clientId,

        firstName: invoice?.party?.name?.split(" ")[0] || "",

        lastName: invoice?.party?.name?.split(" ")?.slice(1)?.join(" ") || "",

        phone: invoice?.party?.phone || "",

        email: invoice?.party?.email || "",

        address: invoice?.party?.address || "",

        balance: invoice?.party?.balance || 0,
      });

      // ITEMS
      const formattedItems = (invoice?.items || []).map(
  (item, index) => ({
    _id:
      item?.itemId ||
      item?._id ||
      `${Date.now()}-${index}`,

    name: item?.name || "",

    itemCode: item?.itemCode || "",

    hsnCode: item?.hsnCode || "",

    qty: Number(item?.qty || 1),

    salesPrice: Number(item?.salesPrice || 0),

    purchasePrice: Number(item?.purchasePrice || 0),

    discountOnSalesPrice: Number(
      item?.discountOnSalesPrice || 0
    ),

    tax: Number(
      item?.tax || item?.gstTaxRate || 0
    ),

    measuringUnit:
      item?.measuringUnit || "PCS",
  })
);

      setInvoiceItems(formattedItems);
      console.log("Invoice Loaded");

      console.log(invoice);

      console.log(formattedItems);
      console.log(invoice?.invoiceItems);

      // BASIC FIELDS
      setInvoicePrefix(invoice?.invoicePrefix || "");

      setInvoiceNumber(String(invoice?.invoiceNumber ?? ""));

      setInvoiceDate(invoice?.invoiceDate?.split("T")[0]);

      setPaymentTerms(invoice?.paymentTerms || 0);

      setDueDate(invoice?.dueDate?.split("T")[0]);

      setNotes(invoice?.notes || "");

      setGlobalDiscount(invoice?.globalDiscount || 0);

      setAdditionalCharges(invoice?.additionalCharges || 0);

      setApplyTCS(invoice?.applyTCS || false);

      setSelectedTCS(invoice?.selectedTCS || null);

      setAutoRoundOff(invoice?.autoRoundOff || false);

      setAmountReceived(invoice?.amountReceived || 0);

      setPaymentMode(invoice?.paymentMode || "Cash");

      setMarkAsPaid(invoice?.markAsFullyPaid || false);
      setSelectedBankDetails(invoice.bankDetails);
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch invoice");
    }
  }, [invoiceId]);


  // ===============================
// ADD ITEM FROM MODAL
// ===============================
const handleAddItemClick = (item) => {
  if (!item) return;

  // Same item already added?
  const existingItem = invoiceItems.find(
    (i) =>
      i._id === item._id ||
      i.itemCode === item.itemCode
  );

  if (existingItem) {
    setInvoiceItems((prev) =>
      prev.map((i) =>
        i._id === item._id
          ? {
              ...i,
              qty: Number(i.qty || 1) + 1,
            }
          : i
      )
    );
  } else {
    setInvoiceItems((prev) => [
      ...prev,
      {
        _id: item._id,

        name: item.name || "",

        itemCode: item.itemCode || "",

        hsnCode: item.hsnCode || "",

        qty: 1,

        salesPrice: Number(item.salesPrice || 0),

        purchasePrice: Number(item.purchasePrice || 0),

        discountOnSalesPrice: Number(
          item.discountOnSalesPrice || 0
        ),

        tax: Number(
          item.tax ||
            item.gstTaxRate ||
            item.gst ||
            0
        ),

        measuringUnit:
          item.measuringUnit === "#133"
            ? "PCS"
            : item.measuringUnit || "PCS",
      },
    ]);
  }

  setShowItemModal(false);
};

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 text-sm font-sans relative antialiased">
      {/* HEADER BAR */}
      <InvoiceHeader
        isEditMode={isEditMode}
        handleBackRedirect={handleBackRedirect}
        handleSaveInvoice={handleSaveInvoice}
      />

      {/* CORE WORKSPACE */}
      <main className="p-4 max-w-[1600px] mx-auto space-y-4">
        {/* TOP PANEL: PARTY INFO & METADATA SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white p-4 rounded-md border border-gray-200 shadow-sm">
          {/* BILL TO SELECTION */}
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

          {/* INVOICE METADATA CONTROL FIELDS */}
          <InvoiceMetaSection
            settings={salesSettings}
            isEditMode={isEditMode}
            invoicePrefix={invoicePrefix}
            setInvoicePrefix={setInvoicePrefix}

            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}

            invoiceDate={invoiceDate}
            setInvoiceDate={setInvoiceDate}

            paymentTerms={paymentTerms}
            setPaymentTerms={setPaymentTerms}

            dueDate={dueDate}
            setDueDate={setDueDate}
          />
        </div>

        {/* ITEMS TABLE */}

        {/* ITEMS TABLE */}

        <InvoiceItemsTable
          invoiceItems={invoiceItems}
          setInvoiceItems={setInvoiceItems}
          globalDiscount={globalDiscount}
          totalDiscount={totalDiscount}
          totalTax={totalTax}
          subtotal={subtotal}
          setShowItemModal={setShowItemModal}
        />

        {/* BOTTOM SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT SIDE: NOTES & BANK DETAILS */}
          <div className="lg:col-span-6 space-y-4">
            {/* Notes Section wrapper toggled open directly */}
            <InvoiceNotesSection
              settings={salesSettings}

              notes={notes}
              setNotes={setNotes}

              isNotesOpen={isNotesOpen}
              setIsNotesOpen={setIsNotesOpen}

              isTermsOpen={isTermsOpen}
              setIsTermsOpen={setIsTermsOpen}
            />

            {/* Fixed Terms and Conditions Block */}

            {/* Bank details panel box */}

            <InvoiceBankDetailsSection
                settings={salesSettings}
                selectedBankDetails={selectedBankDetails}
                setSelectedBankDetails={setSelectedBankDetails}
              />
          </div>

          {/* RIGHT SIDE: LIVE CALCULATION FIELDS (DISCOUNT & ADDITIONAL CHARGES) */}
          <InvoiceSummarySection
            settings={salesSettings}
            globalDiscount={globalDiscount}
            setGlobalDiscount={setGlobalDiscount}
            isDiscountOpen={isDiscountOpen}
            setIsDiscountOpen={setIsDiscountOpen}
            additionalCharges={additionalCharges}
            setAdditionalCharges={setAdditionalCharges}
            isAdditionalChargesOpen={isAdditionalChargesOpen}
            setIsAdditionalChargesOpen={setIsAdditionalChargesOpen}
            taxableAmount={taxableAmount}
            totalAmount={totalAmount}
            balanceAmount={balanceAmount}
            roundOffDifference={roundOffDifference}
            tcsAmount={tcsAmount}
            applyTCS={applyTCS}
            setApplyTCS={setApplyTCS}
            selectedTCS={selectedTCS}
            setSelectedTCS={setSelectedTCS}
            tcsRates={tcsRates}
            autoRoundOff={autoRoundOff}
            setAutoRoundOff={setAutoRoundOff}
            markAsPaid={markAsPaid}
            setMarkAsPaid={setMarkAsPaid}
            amountReceived={amountReceived}
            setAmountReceived={setAmountReceived}
            paymentMode={paymentMode}
            setPaymentMode={setPaymentMode}
          />
        </div>
      </main>

      {/* FIXED FLOATING HELP ICON */}
      <InvoiceFloatingHelp />

      {/* OVERLAY MODAL 1: SEARCH ITEMS DRAWER PANEL (F7 TRIGGER) */}
      {showItemModal && (
        <InvoiceItemModal
          showItemModal={showItemModal}
          setShowItemModal={setShowItemModal}
          itemFilters={itemFilters}
          setItemFilters={setItemFilters}
          categories={categories}
          itemsLoading={itemsLoading}
          itemsApiList={itemsApiList}
          handleAddItemClick={handleAddItemClick}
        />
      )}

      {/* OVERLAY MODAL 2: GODOWN SUB-ALLOCATION ROUTE */}
      {showGodownModal && selectedItemForGodown && (
        <InvoiceGodownModal
          showGodownModal={showGodownModal}
          selectedItemForGodown={selectedItemForGodown}
          setShowGodownModal={setShowGodownModal}
          setSelectedItemForGodown={setSelectedItemForGodown}
          godownQty={godownQty}
          setGodownQty={setGodownQty}
          handleConfirmGodownAdd={handleConfirmGodownAdd}
        />
      )}
    </div>
  );
}
