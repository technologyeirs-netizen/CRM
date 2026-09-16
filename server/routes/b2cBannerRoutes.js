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

router.get('/', protect, authorize('admin', 'b2c'), getBanners);

router.post(
  '/upload-image',
  protect,
  authorize('admin', 'b2c'),
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

router.post('/', protect, authorize('admin', 'b2c'), createBanner);
router.put('/reorder', protect, authorize('admin', 'b2c'), reorderBanners);
router.put('/:id', protect, authorize('admin', 'b2c'), updateBanner);
router.delete('/:id', protect, authorize('admin', 'b2c'), deleteBanner);

module.exports = router;
