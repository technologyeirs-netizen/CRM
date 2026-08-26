import React, { useState } from 'react';
import { X, UploadCloud, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { b2cBannerService } from '../../services/b2cBannerService';

// Unlike SingleImageUploader (which inlines a base64 data URL), this actually
// uploads the file to Cloudinary and stores the CDN url + public_id — banners
// are fetched by the app on every launch, so they need to be small/optimized,
// not raw base64 blobs.
export default function BannerImageUploader({
  image,
  onChange, // (url, publicId) => void
  aspectHint = '16:9 recommended',
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await b2cBannerService.uploadImage(file);
      onChange(res.data.url, res.data.public_id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    }
    setUploading(false);
  };

  return (
    <div className="space-y-3">
      {!image ? (
        <label className="border-2 border-dashed border-indigo-300 rounded-2xl h-40 flex flex-col justify-center items-center cursor-pointer hover:bg-indigo-50 transition">
          <input hidden type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
          {uploading ? (
            <Loader size={32} className="text-indigo-600 animate-spin" />
          ) : (
            <>
              <UploadCloud size={32} className="text-indigo-600" />
              <span className="mt-2 font-medium">Click to upload banner image</span>
              <span className="text-sm text-slate-500">{aspectHint}</span>
            </>
          )}
        </label>
      ) : (
        <div className="relative w-full">
          <img src={image} alt="" className="rounded-2xl border object-cover w-full h-40" />
          <button
            type="button"
            onClick={() => onChange('', '')}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
