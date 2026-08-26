// Talks directly to the SAME "banners" collection that web-backend's
// bannerSchema uses. Banners are app-only (carousel / promo strip on the
// mobile app home screen) — the website does not read this collection.
const mongoose = require('mongoose');

const AppBannerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    subtitle: { type: String, trim: true, default: '' },
    image: { type: String, required: true },
    imagePublicId: { type: String, default: '' },
    linkType: {
      type: String,
      enum: ['none', 'product', 'category', 'subcategory', 'service', 'url'],
      default: 'none',
    },
    linkValue: { type: String, trim: true, default: '' },
    placement: {
      type: String,
      enum: ['home_carousel', 'promo_strip'],
      default: 'home_carousel',
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AppBanner', AppBannerSchema, 'banners');
