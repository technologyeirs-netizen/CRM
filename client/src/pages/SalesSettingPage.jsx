import React, {
  useEffect,
  useState,
} from "react";
import CreditNotePreferenceSection from "../components/salesSetting/CreditNotePreferenceSection";
import DeliveryChallanPreferenceSection from "../components/salesSetting/DeliveryChallanPreferenceSection";
import InvoicePreferenceSection from "../components/salesSetting/InvoicePreferenceSection";
import { salesSettingService } from "../services/salesSettingService";
import { toast } from "react-hot-toast";
import SalesSettingHeader from "../components/salesSetting/SalesSettingHeader";
import CompanySection from "../components/salesSetting/CompanySection";
import SignatureSection from "../components/salesSetting/SignatureSection";
import BankAccountSection from "../components/salesSetting/BankAccountSection";
import TermsConditionSection from "../components/salesSetting/TermsConditionSection";

export default function SalesSettingPage() {
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [settings, setSettings] =
    useState({
      company: {
        logo: "",

        name: "",

        mobile: "",

        email: "",

        website: "",

        gstin: "",

        panNumber: "",

        businessType: "",

        registrationType: "",

        address: {
          street: "",

          city: "",

          state: "",

          pincode: "",

          country: "",
        },
      },

      signature: {
        imageUrl: "",
      },

      bankAccounts: [],

      invoicePreferences: {

  invoicePrefix: "",

  financialYear: "",

  currentInvoiceNumber: 1,

  defaultPaymentTerms: 0,

  defaultPaymentMode: "Cash",

  defaultTemplate: "classic",

  showLogo: true,

  showSignature: true,

  showBankDetails: true,

  showTermsAndConditions: true,

  autoRoundOff: false,

        },

      creditNotePreferences: {

        creditNotePrefix: "ET/CN/",

        financialYear: "",

        currentCreditNoteNumber: 1,

      },

      deliveryChallanPreferences: {

        deliveryChallanPrefix: "ET/DC/",

        financialYear: "",

        currentDeliveryChallanNumber: 1,

      },

      termsAndConditions: {
        salesInvoice: "",

        creditNote: "",

        debitNote: "",

        deliveryChallan: "",

        proformaInvoice: "",

        purchaseInvoice: "",

        purchaseReturn: "",
      },
    });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
  try {
    const res = await salesSettingService.get();

    if (res.data?.setting) {
      setSettings((prev) => ({
        ...prev,
        ...res.data.setting,

        company: {
          ...prev.company,
          ...(res.data.setting.company || {}),

          address: {
            ...prev.company.address,
            ...(res.data.setting.company?.address || {}),
          },
        },

        signature: {
          ...prev.signature,
          ...(res.data.setting.signature || {}),
        },

        termsAndConditions: {
          ...prev.termsAndConditions,
          ...(res.data.setting.termsAndConditions || {}),
        },

        bankAccounts:
          res.data.setting.bankAccounts || [],

        invoicePreferences: {
          ...prev.invoicePreferences,
          ...(res.data.setting.invoicePreferences || {}),
        },
        creditNotePreferences: {
          ...prev.creditNotePreferences,
          ...(res.data.setting.creditNotePreferences || {}),
        },
        deliveryChallanPreferences: {
          ...prev.deliveryChallanPreferences,
          ...(res.data.setting.deliveryChallanPreferences || {}),
        },
        
      }));
    }
  } catch (err) {
    console.log(err);

    toast.error("Failed To Load Settings");
  } finally {
    setLoading(false);
  }
};

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await salesSettingService.update(
        settings
      );



        setSettings(res.data.setting);

      toast.success("Settings Updated Successfully");
    } catch (err) {
      console.log(err);

      toast.error("Failed To Save Settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">

      <div className="bg-white rounded-3xl shadow-lg px-10 py-8">

        <div className="text-2xl font-bold text-slate-700">
          Loading Sales Settings...
        </div>

      </div>

    </div>
  );
}

  return (
    <div className="min-h-screen bg-slate-100">

      <SalesSettingHeader
        handleSave={handleSave}
        saving={saving}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        <CompanySection
          settings={settings}
          setSettings={setSettings}
        />

        <SignatureSection
          settings={settings}
          setSettings={setSettings}
        />

        <BankAccountSection
          settings={settings}
          setSettings={setSettings}
        />
        <InvoicePreferenceSection
          settings={settings}
          setSettings={setSettings}
        />
        <CreditNotePreferenceSection
            settings={settings}
            setSettings={setSettings}
          />
          <DeliveryChallanPreferenceSection
              settings={settings}
              setSettings={setSettings}
          />
        <TermsConditionSection
          settings={settings}
          setSettings={setSettings}
        />

      </div>

    </div>
  );
}