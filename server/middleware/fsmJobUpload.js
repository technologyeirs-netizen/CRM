const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Before/after work photo seedha Cloudinary pe upload hoti hai (folder job id ke hisaab se)
const createJobPhotoUpload = (stage) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req) => ({
      folder: `fsm-jobs/${req.params.id}`,
      resource_type: 'image',
      public_id: `${stage}-${Date.now()}`,
    }),
  });

  const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for job photos'));
    }
    cb(null, true);
  };

  return multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }).single('photo');
};

module.exports = {
  uploadBeforePhoto: createJobPhotoUpload('before'),
  uploadAfterPhoto: createJobPhotoUpload('after'),
};
