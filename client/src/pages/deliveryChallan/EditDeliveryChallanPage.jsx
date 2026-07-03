import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { clientService } from "../../services/clientService";
import { itemService } from "../../services/itemService";
import { categoryService } from "../../services/categoryService";
import { salesSettingService } from "../../services/salesSettingService";
import { deliveryChallanService } from "../../services/deliveryChallanService";

import InvoiceHeader from "../../components/invoice/InvoiceHeader";
import SalesInvoicePartySection from "../../components/invoice/SalesInvoicePartySection";
import InvoiceNotesSection from "../../components/invoice/InvoiceNotesSection";
import InvoiceBankDetailsSection from "../../components/invoice/InvoiceBankDetailsSection";
import InvoiceItemModal from "../../components/invoice/InvoiceItemModal";
import InvoiceGodownModal from "../../components/invoice/InvoiceGodownModal";
import InvoiceFloatingHelp from "../../components/invoice/InvoiceFloatingHelp";
import InvoiceItemsTable from "../../components/invoice/InvoiceItemsTable";

import DeliveryChallanMetaSection from "../../components/deliveryChallan/DeliveryChallanMetaSection";
import DeliveryChallanSummarySection from "../../components/deliveryChallan/DeliveryChallanSummarySection";

import { useInvoiceCalculations } from "../../hooks/useInvoiceCalculations";

export default function EditDeliveryChallanPage() {

  const navigate = useNavigate();

  const { id } = useParams();
  // =========================
    // PAGE
    // =========================

    const [isLoading, setIsLoading] =
    useState(true);

    const [isSaving, setIsSaving] =
    useState(false);

    const [
    deliveryChallan,
    setDeliveryChallan,
    ] = useState(null);
  // =========================
  // SETTINGS
  // =========================

  const [salesSettings, setSalesSettings] =
    useState(null);

  // =========================
  // CLIENTS
  // =========================

  const [clients, setClients] = useState([]);

  const [clientsLoading, setClientsLoading] =
    useState(false);

  const [clientFilters, setClientFilters] =
    useState({
      search: "",
      page: 1,
      limit: 20,
    });

  const [selectedParty, setSelectedParty] =
    useState(null);

  const [
    showPartyDropdown,
    setShowPartyDropdown,
  ] = useState(false);

  // =========================
  // CATEGORIES
  // =========================

  const [categories, setCategories] =
    useState([]);

  // =========================
  // ITEMS
  // =========================

  const [itemsApiList, setItemsApiList] =
    useState([]);

  const [itemsLoading, setItemsLoading] =
    useState(false);

  const [itemFilters, setItemFilters] =
    useState({
      search: "",
      page: 1,
      limit: 200,
    });

  const [
    deliveryChallanItems,
    setDeliveryChallanItems,
  ] = useState([]);

  // =========================
  // MODALS
  // =========================

  const [showItemModal, setShowItemModal] =
    useState(false);

  const [
    showGodownModal,
    setShowGodownModal,
  ] = useState(false);

  const [
    selectedItemForGodown,
    setSelectedItemForGodown,
  ] = useState(null);

  const [godownQty, setGodownQty] =
    useState(1);

  // =========================
  // DELIVERY CHALLAN
  // =========================

  const [
    deliveryChallanPrefix,
    setDeliveryChallanPrefix,
  ] = useState("");

  const [
    deliveryChallanNumber,
    setDeliveryChallanNumber,
  ] = useState("");

  const [challanDate, setChallanDate] =
    useState("");

  const [status, setStatus] =
  useState("Open");

  // =========================
  // NOTES
  // =========================

  const [notes, setNotes] =
    useState("");

  const [isNotesOpen, setIsNotesOpen] =
    useState(true);

  const [isTermsOpen, setIsTermsOpen] =
    useState(true);

  // =========================
  // BANK
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

  const fetchSalesSettings =
    useCallback(async () => {}, []);

  const fetchClients =
    useCallback(async () => {}, [clientFilters]);

  const fetchItems =
    useCallback(async () => {}, [itemFilters]);

  const fetchCategories =
    useCallback(async () => {}, []);

  const fetchSingleDeliveryChallan =
    useCallback(async () => {}, [id]);

  // =========================
  // EFFECTS
  // =========================

  useEffect(() => {

    fetchSalesSettings();

    fetchClients();

    fetchItems();

    fetchCategories();

    fetchSingleDeliveryChallan();

  }, [
    fetchSalesSettings,
    fetchClients,
    fetchItems,
    fetchCategories,
    fetchSingleDeliveryChallan,
  ]);

  useEffect(() => {

    const close = () =>
      setShowPartyDropdown(false);

    window.addEventListener(
      "click",
      close
    );

    return () =>
      window.removeEventListener(
        "click",
        close
      );

  }, []);

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
  // HANDLERS
  // =========================

  const handleSaveDeliveryChallan =
    async () => {};

  const handleAddItemClick =
    (item) => {};

  const handleConfirmGodownAdd =
    () => {};

  const handleBackRedirect =
    () => {
      navigate("/delivery-challan");
    };

  return (
    <></>
  );

}