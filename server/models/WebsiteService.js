// Talks directly to the SAME "services" collection the website/app use.
const mongoose = require('mongoose');

const WebsiteServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    availableDates: { type: [Date], default: [] },
    image: { type: String, default: null },
    features: {
      type: [
        {
          title: String,
          description: String,
          imageUrl: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebsiteService', WebsiteServiceSchema, 'services');
