const mongoose = require('mongoose');
const Banner = require('../models/AppBanner');
const cloudinary = require('../config/cloudinary');

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ placement: 1, sortOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: banners.length, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const data = req.body;
    if (!data.image) {
      return res.status(400).json({ success: false, message: 'Banner image is required' });
    }
    const banner = await Banner.create({
      title: data.title || '',
      subtitle: data.subtitle || '',
      image: data.image,
      imagePublicId: data.imagePublicId || '',
      linkType: data.linkType || 'none',
      linkValue: data.linkValue || '',
      placement: data.placement || 'home_carousel',
      sortOrder: Number(data.sortOrder) || 0,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      startsAt: data.startsAt || null,
      endsAt: data.endsAt || null,
    });
    res.status(201).json({ success: true, message: 'Banner created successfully', banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const data = req.body;
    const update = {
      title: data.title,
      subtitle: data.subtitle,
      image: data.image,
      imagePublicId: data.imagePublicId,
      linkType: data.linkType,
      linkValue: data.linkValue,
      placement: data.placement,
      sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
      isActive: data.isActive,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
    };
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const banner = await Banner.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.status(200).json({ success: true, message: 'Banner updated successfully', banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    if (banner.imagePublicId) {
      await cloudinary.uploader.destroy(banner.imagePublicId).catch(() => {});
    }

    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reorderBanners = async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'order must be an array' });
    }
    await Promise.all(
      order.map(({ id, sortOrder }) =>
        mongoose.Types.ObjectId.isValid(id)
          ? Banner.findByIdAndUpdate(id, { sortOrder: Number(sortOrder) || 0 })
          : Promise.resolve()
      )
    );
    res.status(200).json({ success: true, message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
