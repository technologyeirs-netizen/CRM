import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { clientService } from "../../services/clientService";
import { itemService } from "../../services/itemService";
import { categoryService } from "../../services/categoryService";
import { salesSettingService } from "../../services/salesSettingService";
import { deliveryChallanService } from "../../services/deliveryChallanService";
import InvoiceHeader from "../../components/invoice/InvoiceHeader";
import SalesInvoicePartySection from "../../components/invoice/SalesInvoicePartySection";
import InvoiceNotesSection from "../../components/invoice/invoiceNotesSection";
import InvoiceBankDetailsSection from "../../components/invoice/InvoiceBankDetailsSection";
import InvoiceItemModal from "../../components/invoice/InvoiceItemModal";
import InvoiceGodownModal from "../../components/invoice/InvoiceGodownModal";
import InvoiceFloatingHelp from "../../components/invoice/InvoiceFloatingHelp";
import InvoiceMetaSection from "../../components/invoice/InvoiceMetaSection";
import { useInvoiceCalculations } from "../../hooks/useInvoiceCalculations";
import InvoiceItemsTable from "../../components/invoice/InvoiceItemsTable";
import DeliveryChallanMetaSection from "../../components/deliveryChallan/DeliveryChallanMetaSection";
import DeliveryChallanSummarySection from "../../components/deliveryChallan/DeliveryChallanSummarySection";
export default function CreateDeliveryChallanPage() {
  const navigate = useNavigate();
  const { id: deliveryChallanId } = useParams();
  // =========================
  // MODE
  // =========================
  console.log("deliveryChallanId:", deliveryChallanId);
  const [isEditMode, setIsEditMode] = useState(false);

  // =========================
  // SETTINGS
  // =========================

  const [salesSettings, setSalesSettings] = useState(null);
  
  // =========================
  // CLIENTS
  // =========================

  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const [clientFilters, setClientFilters] = useState({
    search: "",
    page: 1,
    limit: 20,
  });

  const [selectedParty, setSelectedParty] =
    useState(null);

  const [showPartyDropdown, setShowPartyDropdown] =
    useState(false);

  // =========================
  // CATEGORIES
  // =========================

  const [categories, setCategories] = useState([]);

  // =========================
  // ITEMS
  // =========================

  const [itemsApiList, setItemsApiList] =
    useState([]);

  const [itemsLoading, setItemsLoading] =
    useState(false);

  const [itemFilters, setItemFilters] = useState({
    search: "",
    page: 1,
    limit: 200,
  });

  const [
    deliveryChallanItems,
    setDeliveryChallanItems,
  ] = useState([]);

  // =========================
  // ITEM MODALS
  // =========================

  const [showItemModal, setShowItemModal] =
    useState(false);

  const [showGodownModal, setShowGodownModal] =
    useState(false);

  const [
    selectedItemForGodown,
    setSelectedItemForGodown,
  ] = useState(null);

  const [godownQty, setGodownQty] = useState(1);

  // =========================
  // DELIVERY CHALLAN DETAILS
  // =========================

  const [
    deliveryChallanPrefix,
    setDeliveryChallanPrefix,
  ] = useState("");

  const [
    deliveryChallanNumber,
    setDeliveryChallanNumber,
  ] = useState("");

  const [challanDate, setChallanDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // =========================
  // NOTES
  // =========================

  const [notes, setNotes] = useState("");

  const [isNotesOpen, setIsNotesOpen] =
    useState(true);

  const [isTermsOpen, setIsTermsOpen] =
    useState(true);

  // =========================
  // BANK DETAILS
  // =========================

  const [
    selectedBankDetails,
    setSelectedBankDetails,
  ] = useState(null);

  // =========================
  // DISCOUNT
  // =========================

  const [
    globalDiscount,
    setGlobalDiscount,
  ] = useState(0);

  const [
    isDiscountOpen,
    setIsDiscountOpen,
  ] = useState(true);

  // =========================
  // ADDITIONAL CHARGES
  // =========================

  const [
    additionalCharges,
    setAdditionalCharges,
  ] = useState(0);

  const [
    isAdditionalChargesOpen,
    setIsAdditionalChargesOpen,
  ] = useState(true);

  // =========================
  // TCS
  // =========================

  const [applyTCS, setApplyTCS] =
    useState(false);

  const [selectedTCS, setSelectedTCS] =
    useState(null);

  // =========================
  // ROUND OFF
  // =========================

  const [
    autoRoundOff,
    setAutoRoundOff,
  ] = useState(false);

  // =========================
  // TCS LIST
  // =========================

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

  // =========================
  // CALCULATIONS
  // =========================

  const {
    subtotal,
    taxableAmount,
    tcsAmount,
    roundOffDifference,
    totalAmount,
    totalDiscount,
    totalTax,
  } = useInvoiceCalculations({
    invoiceItems: deliveryChallanItems,
    globalDiscount,
    additionalCharges,
    applyTCS,
    selectedTCS,
    autoRoundOff,
    amountReceived: 0,
  });

  // =========================
  // FETCH FUNCTIONS
  // =========================

  const fetchSalesSettings = useCallback(async () => {
  try {
    const { data } = await salesSettingService.get();

    setSalesSettings(data.setting);

    const defaultBank =
      data.setting?.bankAccounts?.find(
        (bank) =>
          String(bank._id) ===
          String(
            data.setting.deliveryChallanPreferences
              ?.defaultBankAccountId ||
              data.setting.invoicePreferences
                ?.defaultBankAccountId
          )
      ) || data.setting?.bankAccounts?.[0];

    setSelectedBankDetails(defaultBank);
  } catch (error) {
    console.log(error);

    toast.error("Failed to load Sales Settings");
  }
}, []);

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

    const itemList = Array.isArray(data?.items)
      ? data.items
      : [];

    setItemsApiList(itemList);
  } catch (error) {
    toast.error("Failed to load items");
    setItemsApiList([]);
  }

  setItemsLoading(false);
}, [itemFilters]);

  const fetchCategories = useCallback(async () => {
  try {
    const { data } =
      await categoryService.getAll({
        page: 1,
        limit: 200,
      });

    setCategories(
      Array.isArray(data?.categories)
        ? data.categories
        : []
    );
  } catch (error) {
    toast.error("Failed to load categories");
    setCategories([]);
  }
}, []);

  const fetchSingleDeliveryChallan = useCallback(async () => {
  console.log("ID =", deliveryChallanId);
    if (!deliveryChallanId) return;

  try {
    const { data } =
      await deliveryChallanService.getById(
        deliveryChallanId
      );
      console.log("API RESPONSE =", data);
    const challan = data?.deliveryChallan;
console.log("CHALLAN =", challan);
    if (!challan) return;

    console.log("EDIT CHALLAN =>", challan);

    // =========================
    // PARTY
    // =========================

    setSelectedParty({
      _id:
        challan.party?.clientId || "",

      firstName:
        challan.party?.name || "",

      lastName: "",

      name:
        challan.party?.name || "",

      phone:
        challan.party?.phone || "",

      email:
        challan.party?.email || "",

      address:
        challan.party?.address || "",

      balance:
        challan.party?.balance || 0,
    });

    // =========================
    // DELIVERY CHALLAN DETAILS
    // =========================

    setDeliveryChallanPrefix(
      challan.deliveryChallanPrefix || ""
    );

    setDeliveryChallanNumber(
      challan.deliveryChallanNumber || ""
    );

    setChallanDate(
      challan.challanDate
        ? new Date(challan.challanDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

    // =========================
    // ITEMS
    // =========================

    setDeliveryChallanItems(
      Array.isArray(challan.items)
        ? challan.items
        : []
    );
    console.log("Items from API:", challan.items);

    // =========================
    // NOTES
    // =========================

    setNotes(challan.notes || "");

    // =========================
    // BANK
    // =========================

    setSelectedBankDetails(
      challan.bankDetails || null
    );

    // =========================
    // DISCOUNT
    // =========================

    setGlobalDiscount(
      Number(challan.globalDiscount || 0)
    );

    // =========================
    // ADDITIONAL CHARGES
    // =========================

    setAdditionalCharges(
      Number(challan.additionalCharges || 0)
    );

    // =========================
    // TCS
    // =========================

    setApplyTCS(
      Boolean(challan.applyTCS)
    );

    setSelectedTCS(
      challan.selectedTCS || null
    );

    // =========================
    // ROUND OFF
    // =========================

    setAutoRoundOff(
      Boolean(challan.autoRoundOff)
    );

  } catch (error) {

    console.log(
      "FETCH DELIVERY CHALLAN ERROR =>",
      error
    );

    toast.error(
      "Failed to fetch Delivery Challan"
    );

  }
}, [deliveryChallanId]);
useEffect(() => {
  console.log(
    "deliveryChallanItems updated:",
    deliveryChallanItems
  );
}, [deliveryChallanItems]);
  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
  fetchCategories();
  fetchItems();
  fetchClients();
  fetchSalesSettings();

  if (deliveryChallanId) {
    setIsEditMode(true);
    fetchSingleDeliveryChallan();
  }
}, [
  deliveryChallanId,
  fetchCategories,
  fetchItems,
  fetchClients,
  fetchSalesSettings,
  fetchSingleDeliveryChallan,
]);

  // =========================
  // CLOSE PARTY DROPDOWN
  // =========================

  useEffect(() => {
    const close = () =>
      setShowPartyDropdown(false);

    window.addEventListener("click", close);

    return () => {
      window.removeEventListener(
        "click",
        close
      );
    };
  }, []);

  // =========================
  // KEYBOARD SHORTCUTS
  // =========================
  useEffect(() => {
  if (!salesSettings) return;

  setAutoRoundOff(
    salesSettings?.invoicePreferences
      ?.autoRoundOff || false
  );
}, [salesSettings]);

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

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, []);

  // =========================
  // AUTO NUMBER
  // =========================

  useEffect(() => {
    if (deliveryChallanId) return;

    const pref =
      salesSettings?.deliveryChallanPreferences;

    if (!pref) return;

    setDeliveryChallanPrefix(
      `${pref.deliveryChallanPrefix || ""}${
        pref.financialYear || ""
      }/`
    );

    setDeliveryChallanNumber(
      String(
        pref.currentDeliveryChallanNumber ?? 1
      ).padStart(4, "0")
    );

    setAutoRoundOff(
      salesSettings?.invoicePreferences
        ?.autoRoundOff || false
    );
  }, [salesSettings, deliveryChallanId]);

  // =========================
  // PAYLOAD
  // =========================

  const payload = {};

  // =========================
  // HANDLERS
  // =========================

  const handleSaveDeliveryChallan = async () => {
  try {
    if (!selectedParty) {
      return toast.error("Please select party");
    }

    if (
      !deliveryChallanItems ||
      deliveryChallanItems.length === 0
    ) {
      return toast.error("Please add items");
    }

    const payload = {
      party: {
        _id: selectedParty?._id,
        name:
        selectedParty?.name ||
        `${selectedParty?.firstName || ""} ${
          selectedParty?.lastName || ""
        }`.trim(),
        phone: selectedParty?.phone || "",
        email: selectedParty?.email || "",
        address: selectedParty?.address || "",
        balance: selectedParty?.balance || 0,
      },

      deliveryChallanPrefix,
      deliveryChallanNumber,
      challanDate,

      deliveryChallanItems,

      notes,

      termsAndConditions:
        salesSettings?.termsAndConditions?.deliveryChallan || [],

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

      status: "Open",
    };

    if (isEditMode) {
      await deliveryChallanService.update(
        deliveryChallanId,
        payload
      );

      toast.success(
        "Delivery Challan Updated Successfully"
      );
    } else {
      await deliveryChallanService.create(payload);

      toast.success(
        "Delivery Challan Created Successfully"
      );
    }

    setTimeout(() => {
      navigate("/delivery-challan");
    }, 1000);
  } catch (error) {
    console.error(
      "SAVE DELIVERY CHALLAN ERROR:",
      error
    );

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Failed to save delivery challan";

    toast.error(message, {
      duration: 4000,
    });
  }
};

  const handleAddItemClick = (item) => {
  if (!item) return;

  // Same item already added?
  const existingItem = deliveryChallanItems.find(
    (i) =>
      i._id === item._id ||
      i.itemCode === item.itemCode
  );

  if (existingItem) {
    setDeliveryChallanItems((prev) =>
      prev.map((i) =>
        i._id === item._id ||
        i.itemCode === item.itemCode
          ? {
              ...i,
              qty: Number(i.qty || 1) + 1,
            }
          : i
      )
    );
  } else {
    setDeliveryChallanItems((prev) => [
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

  const handleConfirmGodownAdd = () => {};

  const handleBackRedirect = () => {
    navigate("/delivery-challan");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 text-sm font-sans relative antialiased">

        {/* HEADER */}
        <InvoiceHeader
        title={
            isEditMode
            ? "Update Delivery Challan"
            : "Create Delivery Challan"
        }
        isEditMode={isEditMode}
        handleBackRedirect={handleBackRedirect}
        handleSaveInvoice={handleSaveDeliveryChallan}
        />

        {/* MAIN */}
        <main className="p-4 max-w-[1600px] mx-auto space-y-4">

        {/* PARTY + META */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white p-4 rounded-md border border-gray-200 shadow-sm">

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

            <DeliveryChallanMetaSection
            isEditMode={isEditMode}

            deliveryChallanPrefix={deliveryChallanPrefix}
            setDeliveryChallanPrefix={setDeliveryChallanPrefix}

            deliveryChallanNumber={deliveryChallanNumber}
            setDeliveryChallanNumber={setDeliveryChallanNumber}

            challanDate={challanDate}
            setChallanDate={setChallanDate}
            />

        </div>

        {/* ITEMS */}

        <InvoiceItemsTable
            invoiceItems={deliveryChallanItems}
            setInvoiceItems={setDeliveryChallanItems}
            globalDiscount={globalDiscount}
            totalDiscount={totalDiscount}
            totalTax={totalTax}
            subtotal={subtotal}
            setShowItemModal={setShowItemModal}
            documentType="deliveryChallan"
        />

        {/* BOTTOM */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

            {/* LEFT */}

            <div className="lg:col-span-6 space-y-4">

            <InvoiceNotesSection
                settings={salesSettings}

                notes={notes}
                setNotes={setNotes}

                isNotesOpen={isNotesOpen}
                setIsNotesOpen={setIsNotesOpen}

                isTermsOpen={isTermsOpen}
                setIsTermsOpen={setIsTermsOpen}

                termsKey="deliveryChallan"
            />

            <InvoiceBankDetailsSection
                settings={salesSettings}
                selectedBankDetails={selectedBankDetails}
                setSelectedBankDetails={setSelectedBankDetails}
                documentType="deliveryChallan"
            />

            </div>

            {/* RIGHT */}
            <DeliveryChallanSummarySection
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

                tcsAmount={tcsAmount}

                applyTCS={applyTCS}
                setApplyTCS={setApplyTCS}

                selectedTCS={selectedTCS}
                setSelectedTCS={setSelectedTCS}

                tcsRates={tcsRates}

                autoRoundOff={autoRoundOff}
                setAutoRoundOff={setAutoRoundOff}
            />
            

        </div>

        </main>

        <InvoiceFloatingHelp />

        {/* ITEM MODAL */}

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

        {/* GODOWN MODAL */}

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