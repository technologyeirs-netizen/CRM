const express = require('express');
const router = express.Router();
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
} = require('../controllers/b2cBannerController');
const { protect, authorize } = require('../middleware/auth');
const { bannerUpload } = require('../config/cloudinary');

router.get('/', protect, authorize('admin'), getBanners);

router.post(
  '/upload-image',
  protect,
  authorize('admin'),
  (req, res, next) => {
    bannerUpload.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
    res.json({ success: true, url: req.file.path, public_id: req.file.filename });
  }
);

router.post('/', protect, authorize('admin'), createBanner);
router.put('/reorder', protect, authorize('admin'), reorderBanners);
router.put('/:id', protect, authorize('admin'), updateBanner);
router.delete('/:id', protect, authorize('admin'), deleteBanner);

module.exports = router;
