import React from "react";
import SingleImageUploader from "../common/SingleImageUploader";

export default function CompanySection({
  settings,
  setSettings,
}) {
  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value,
      },
    }));
  };

  const handleAddressChange = (
    field,
    value
  ) => {
    setSettings((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        address: {
          ...prev.company.address,
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Company Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="text-sm font-medium text-slate-600">
            Company Name
          </label>

          <input
            type="text"
            value={settings.company?.name || ""}
            onChange={(e) =>
              handleChange(
                "name",
                e.target.value
              )
            }
            className="w-full h-11 rounded-xl border border-slate-300 px-4 mt-2"
          />
        </div>

        <div className="md:col-span-2">

          <SingleImageUploader
            title="Company Logo"
            subtitle="Only one logo is allowed."
            image={settings.company.logo}
            onChange={(img) =>
              handleChange("logo", img)
            }
          />

        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">
            Mobile
          </label>

          <input
            type="text"
            value={settings.company?.mobile || ""}
            onChange={(e) =>
              handleChange(
                "mobile",
                e.target.value
              )
            }
            className="w-full h-11 rounded-xl border border-slate-300 px-4 mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">
            Email
          </label>

          <input
            type="text"
            value={settings.company?.email || ""}
            onChange={(e) =>
              handleChange(
                "email",
                e.target.value
              )
            }
            className="w-full h-11 rounded-xl border border-slate-300 px-4 mt-2"
          />
        </div>


        <div>
          <label className="text-sm font-medium text-slate-600">
            GSTIN
          </label>

          <input
            type="text"
            value={settings.company?.gstin || ""}
            onChange={(e) =>
              handleChange(
                "gstin",
                e.target.value
              )
            }
            className="w-full h-11 rounded-xl border border-slate-300 px-4 mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">
            PAN Number
          </label>

          <input
            type="text"
            value={settings.company?.panNumber || ""}
            onChange={(e) =>
              handleChange(
                "panNumber",
                e.target.value
              )
            }
            className="w-full h-11 rounded-xl border border-slate-300 px-4 mt-2"
          />
        </div>

      </div>

      <div className="mt-8">

        <h3 className="font-semibold text-slate-700 mb-4">
          Address
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <input
            placeholder="Street"
            value={
              settings.company?.address?.street || ""
            }
            onChange={(e) =>
              handleAddressChange(
                "street",
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-300 px-4"
          />

          <input
            placeholder="City"
            value={
              settings.company.address.city
            }
            onChange={(e) =>
              handleAddressChange(
                "city",
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-300 px-4"
          />

          <input
            placeholder="State"
            value={
              settings.company.address.state
            }
            onChange={(e) =>
              handleAddressChange(
                "state",
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-300 px-4"
          />

          <input
            placeholder="Pincode"
            value={
              settings.company.address.pincode
            }
            onChange={(e) =>
              handleAddressChange(
                "pincode",
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-300 px-4"
          />

          <input
            placeholder="Country"
            value={
              settings.company.address.country
            }
            onChange={(e) =>
              handleAddressChange(
                "country",
                e.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-300 px-4 md:col-span-2"
          />

        </div>

      </div>

    </div>
  );
}