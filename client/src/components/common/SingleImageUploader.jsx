import React from "react";
import { X, UploadCloud } from "lucide-react";

export default function SingleImageUploader({
  title = "Upload Image",
  subtitle = "",
  image,
  onChange,
}) {
  const handleUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      onChange(reader.result);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">

      <div>

        <h3 className="font-semibold text-slate-800">
          {title}
        </h3>

        {subtitle && (
          <p className="text-sm text-slate-500 mt-1">
            {subtitle}
          </p>
        )}

      </div>

      {!image ? (

        <label className="border-2 border-dashed border-indigo-300 rounded-2xl h-56 flex flex-col justify-center items-center cursor-pointer hover:bg-indigo-50 transition">

          <input
            hidden
            type="file"
            accept="image/*"
            onChange={handleUpload}
          />

          <UploadCloud
            size={44}
            className="text-indigo-600"
          />

          <span className="mt-4 font-medium">
            Click to upload
          </span>

          <span className="text-sm text-slate-500">
            PNG JPG WEBP
          </span>

        </label>

      ) : (

        <div className="relative w-48">

          <img
            src={image}
            alt=""
            className="rounded-2xl border object-contain h-48 w-48"
          />

          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            <X size={16} />
          </button>

        </div>

      )}

    </div>
  );
}