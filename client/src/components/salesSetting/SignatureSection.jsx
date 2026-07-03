import React from "react";
import SingleImageUploader from "../common/SingleImageUploader";

export default function SignatureSection({
  settings,
  setSettings,
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Authorized Signature
      </h2>

      <SingleImageUploader
        title="Upload Signature"
        subtitle="Only one signature is allowed."
        image={settings.signature.imageUrl}
        onChange={(img) =>
          setSettings((prev) => ({
            ...prev,
            signature: {
              ...prev.signature,
              imageUrl: img,
            },
          }))
        }
      />

    </div>
  );
}