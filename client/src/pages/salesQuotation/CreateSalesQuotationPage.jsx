// File Name: CreateSalesQuotationPage.jsx
// Mirrors CreateInvoice.jsx (Create Sales Invoice) but for Sales
// Quotations: creating/editing a quotation NEVER touches item stock.
// Stock is only deducted later, when the quotation is converted
// into a Sales Invoice (see SalesQuotationsPage.jsx).

import { salesQuotationService } from "../../services/salesQuotationService";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { salesSettingService } from "../../services/salesSettingService";
import { useNavigate } from "react-router-dom";

import { clientService } from "../../services/clientService";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import InvoiceHeader from "../../components/invoice/InvoiceHeader";
import SalesInvoicePartySection from "../../components/invoice/SalesInvoicePartySection";
import InvoiceItemsTable from "../../components/invoice/InvoiceItemsTable";
import { useInvoiceCalculations } from "../../hooks/useInvoiceCalculations";
import InvoiceSummarySection from "../../components/invoice/InvoiceSummarySection";
import InvoiceNotesSection from "../../components/invoice/invoiceNotesSection";
import InvoiceBankDetailsSection from "../../components/invoice/InvoiceBankDetailsSection";
import InvoiceItemModal from "../../components/invoice/InvoiceItemModal";
import InvoiceGodownModal from "../../components/invoice/InvoiceGodownModal";
import InvoiceFloatingHelp from "../../components/invoice/InvoiceFloatingHelp";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

export default function CreateSalesQuotationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const quotationId = searchParams.get("id");

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

  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isDiscountOpen, setIsDiscountOpen] = useState(true);
  const [isAdditionalChargesOpen, setIsAdditionalChargesOpen] = useState(true);
  const [salesSettings, setSalesSettings] = useState(null);

  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const [quotationPrefix, setQuotationPrefix] = useState("");
  const [quotationNumber, setQuotationNumber] = useState("");
  const [quotationDate, setQuotationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Quotation items array that builds up the billing table
  const [quotationItems, setQuotationItems] = useState([]);

  // Footer fields
  const [notes, setNotes] = useState("");
  const [isTermsOpen, setIsTermsOpen] = useState(true);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [autoRoundOff, setAutoRoundOff] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Quotations don't apply TCS or collect payment - kept as inert
  // state only because useInvoiceCalculations / InvoiceSummarySection
  // expect these props to exist.
  const applyTCS = false;
  const selectedTCS = null;
  const amountReceived = 0;

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
      const { data } = await productService.getAll(itemFilters);

      const itemList = Array.isArray(data?.products) ? data.products : [];

      setItemsApiList(itemList);
    } catch (error) {
      toast.error("Failed to load products");
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
      const { data } = await salesSettingService.get();

      setSalesSettings(data.setting);

      const defaultBank =
        data.setting?.bankAccounts?.find(
          (bank) =>
            String(bank._id) ===
            String(data.setting.invoicePreferences?.defaultBankAccountId)
        ) || data.setting?.bankAccounts?.[0];

      setSelectedBankDetails(defaultBank);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load Sales Settings");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchItems();
    fetchClients();
    fetchSalesSettings();

    if (quotationId) {
      setIsEditMode(true);
      fetchSingleQuotation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId]);

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

  const handleBackRedirect = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/sales-quotations";
    }
  };

  // ================================
  // AUTO QUOTATION NUMBER GENERATOR
  // ================================
  useEffect(() => {
    if (quotationId) return;

    const pref = salesSettings?.quotationPreferences;

    if (!pref) return;

    setQuotationPrefix(
      `${pref.quotationPrefix || "ET/QT/"}${pref.financialYear || ""}/`
    );

    setQuotationNumber(
      String(pref.currentQuotationNumber ?? 1).padStart(4, "0")
    );

    setAutoRoundOff(pref.autoRoundOff ?? false);
  }, [salesSettings, quotationId]);

  // --- Real-time Math Calculations ---
  const {
    subtotal,
    taxableAmount,
    roundOffDifference,
    totalAmount,
    totalDiscount,
    totalTax,
  } = useInvoiceCalculations({
    invoiceItems: quotationItems,
    globalDiscount,
    additionalCharges,
    applyTCS,
    selectedTCS,
    autoRoundOff,
    amountReceived,
  });

  const handleSaveQuotation = async () => {
    try {
      if (!selectedParty) {
        return toast.error("Please select party");
      }

      if (!quotationItems || quotationItems.length === 0) {
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

        quotationPrefix,
        quotationNumber,
        quotationDate,

        quotationItems,

        notes,

        termsAndConditions:
          salesSettings?.termsAndConditions?.salesInvoice || [],

        company: salesSettings?.company || {},

        bankDetails: selectedBankDetails || {},

        signature: salesSettings?.signature || {},

        globalDiscount,
        additionalCharges,

        autoRoundOff,
        roundOffDifference,

        subtotal,
        taxableAmount,
        totalDiscount,
        totalTax,
        totalAmount,
      };

      if (isEditMode) {
        await salesQuotationService.update(quotationId, payload);
        toast.success("Quotation Updated Successfully");
      } else {
        await salesQuotationService.create(payload);
        toast.success("Quotation Created Successfully");
      }

      setTimeout(() => {
        navigate("/sales-quotations");
      }, 1000);
    } catch (error) {
      console.error("SAVE QUOTATION ERROR:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save quotation";

      toast.error(message, { duration: 4000 });
    }
  };

  const fetchSingleQuotation = useCallback(async () => {
    try {
      if (!quotationId) return;

      const { data } = await salesQuotationService.getById(quotationId);

      const quotation = data?.quotation;

      if (!quotation) return;

      setSelectedParty({
        _id: quotation?.party?._id || quotation?.party?.clientId,
        firstName: quotation?.party?.name?.split(" ")[0] || "",
        lastName:
          quotation?.party?.name?.split(" ")?.slice(1)?.join(" ") || "",
        phone: quotation?.party?.phone || "",
        email: quotation?.party?.email || "",
        address: quotation?.party?.address || "",
        balance: quotation?.party?.balance || 0,
      });

      const formattedItems = (quotation?.items || []).map((item, index) => ({
        _id: item?.itemId || item?._id || `${Date.now()}-${index}`,
        name: item?.name || "",
        itemCode: item?.itemCode || "",
        hsnCode: item?.hsnCode || "",
        qty: Number(item?.qty || 1),
        salesPrice: Number(item?.salesPrice || 0),
        purchasePrice: Number(item?.purchasePrice || 0),
        discountOnSalesPrice: Number(item?.discountOnSalesPrice || 0),
        tax: Number(item?.tax || item?.gstTaxRate || 0),
        measuringUnit: item?.measuringUnit || "PCS",
      }));

      setQuotationItems(formattedItems);

      setQuotationPrefix(quotation?.quotationPrefix || "");
      setQuotationNumber(String(quotation?.quotationNumber ?? ""));
      setQuotationDate(quotation?.quotationDate?.split("T")[0]);
      setNotes(quotation?.notes || "");
      setGlobalDiscount(quotation?.globalDiscount || 0);
      setAdditionalCharges(quotation?.additionalCharges || 0);
      setAutoRoundOff(quotation?.autoRoundOff || false);
      setSelectedBankDetails(quotation.bankDetails);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch quotation");
    }
  }, [quotationId]);

  // ===============================
  // ADD PRODUCT FROM MODAL
  // ===============================
  const handleAddItemClick = (product, qty = 1) => {
    if (!product) return;

    const addQty = Number(qty) > 0 ? Number(qty) : 1;
    const availableStock = Number(product.stock || 0);

    const existingItem = quotationItems.find((i) => i._id === product._id);

    if (existingItem) {
      setQuotationItems((prev) =>
        prev.map((i) => {
          if (i._id !== product._id) return i;

          // NOTE: a quotation is not a real sale yet, so item
          // quantity here is only ever capped for sanity - it is
          // never deducted from actual product stock.
          let nextQty = Number(i.qty || 1) + addQty;

          if (availableStock > 0 && nextQty > availableStock) {
            nextQty = availableStock;
          }

          return { ...i, qty: nextQty };
        })
      );
    } else {
      setQuotationItems((prev) => [
        ...prev,
        {
          _id: product._id,
          name: product.productName || "",
          itemCode: product.modelNo || "",
          hsnCode: product.hsn || "",
          qty: availableStock > 0 ? Math.min(addQty, availableStock) : addQty,
          salesPrice: Number(product.price || 0),
          purchasePrice: Number(product.purchasePrice || 0),
          discountOnSalesPrice: Number(product.discount || 0),
          tax: Number(product.tax || product.gstTaxRate || 0),
          availableStock,
          measuringUnit: "PCS",
        },
      ]);
    }

    setShowItemModal(false);
  };

  const handleConfirmGodownAdd = () => {
    setShowGodownModal(false);
    setSelectedItemForGodown(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 text-sm font-sans relative antialiased">
      {/* HEADER BAR */}
      <InvoiceHeader
        isEditMode={isEditMode}
        handleBackRedirect={handleBackRedirect}
        handleSaveInvoice={handleSaveQuotation}
        title={isEditMode ? "Update Sales Quotation" : "Create Sales Quotation"}
        subtitle="Quotations don't affect item stock until converted to an invoice"
        saveLabel="Save Quotation"
        updateLabel="Update Quotation"
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

          {/* QUOTATION METADATA CONTROL FIELDS */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-3 border-l border-gray-100 pl-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Quotation Prefix:
              </label>
              <input
                type="text"
                value={quotationPrefix}
                disabled={isEditMode}
                onChange={(e) => setQuotationPrefix(e.target.value)}
                className={`w-full border rounded px-2 py-1.5 outline-none ${
                  isEditMode
                    ? "bg-gray-200 cursor-not-allowed text-gray-500"
                    : "bg-gray-100 border-transparent"
                }`}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Quotation Number:
              </label>
              <input
                type="text"
                value={quotationNumber}
                disabled={isEditMode}
                onChange={(e) => setQuotationNumber(e.target.value)}
                className={`w-full border rounded px-2 py-1.5 outline-none ${
                  isEditMode
                    ? "bg-gray-200 cursor-not-allowed text-gray-500"
                    : "bg-gray-100 border-transparent"
                }`}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Quotation Date:
              </label>
              <input
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 outline-none text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <InvoiceItemsTable
          invoiceItems={quotationItems}
          setInvoiceItems={setQuotationItems}
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
            <InvoiceNotesSection
              settings={salesSettings}
              notes={notes}
              setNotes={setNotes}
              isNotesOpen={isNotesOpen}
              setIsNotesOpen={setIsNotesOpen}
              isTermsOpen={isTermsOpen}
              setIsTermsOpen={setIsTermsOpen}
            />

            <InvoiceBankDetailsSection
              settings={salesSettings}
              selectedBankDetails={selectedBankDetails}
              setSelectedBankDetails={setSelectedBankDetails}
            />
          </div>

          {/* RIGHT SIDE: LIVE CALCULATION FIELDS */}
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
            roundOffDifference={roundOffDifference}
            autoRoundOff={autoRoundOff}
            setAutoRoundOff={setAutoRoundOff}
            hideTCS
            hidePayment
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
