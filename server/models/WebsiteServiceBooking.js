// Talks directly to the SAME service-bookings collection the website/app use.
const mongoose = require('mongoose');

const WebsiteServiceBookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'WebsiteService' },
    serviceName: { type: String, required: true, trim: true },
    servicePrice: { type: Number, default: 0 },
    customerName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    address: { type: String, required: true, trim: true },
    preferredDate: { type: Date, default: null },
    notes: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['NotStarted', 'Pending', 'Completed', 'Failed', 'Cancelled'],
      default: 'NotStarted',
    },
    paymentMethod: { type: String, default: 'Razorpay' },
    currency: { type: String, default: 'INR' },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'WebsiteServiceBooking',
  WebsiteServiceBookingSchema,
  'servicebookings'
);
