const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const IMAGE_FIELDS = ['aadharCard', 'panCard', 'drivingLicense', 'passportPhoto', 'eirsIdCard'];
const VIDEO_FIELDS = ['videoClip'];

// Files seedha Cloudinary pe upload honge, disk pe kuch save nahi hoga
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const fsmId = req.params.id;
    const isVideo = VIDEO_FIELDS.includes(file.fieldname);

    return {
      folder: `fsm-documents/${fsmId}`,
      resource_type: isVideo ? 'video' : 'image',
      public_id: `${file.fieldname}-${Date.now()}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (IMAGE_FIELDS.includes(file.fieldname) && !file.mimetype.startsWith('image/')) {
    return cb(new Error(`${file.fieldname} must be an image file`));
  }
  if (VIDEO_FIELDS.includes(file.fieldname) && !file.mimetype.startsWith('video/')) {
    return cb(new Error(`${file.fieldname} must be a video file`));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per file
});

// Sabhi 6 documents ek hi request me multipart/form-data se aayenge
const uploadFsmDocuments = upload.fields([
  { name: 'aadharCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'videoClip', maxCount: 1 },
  { name: 'eirsIdCard', maxCount: 1 },
]);

module.exports = { uploadFsmDocuments };
