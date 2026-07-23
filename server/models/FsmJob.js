const mongoose = require('mongoose');

// FsmJob = ek website lead (WebsiteBooking) jo admin ne kisi FSM (service man) ko
// assign kar di ho. Booking ka data yahan snapshot ki tarah copy hota hai taaki
// baad me original booking edit/delete ho jaaye to job ka record safe rahe.
const FsmJobSchema = new mongoose.Schema(
  {
    // Source lead reference (raw "servicebookings" collection ka _id, string me)
    bookingId: { type: String, required: true, index: true },

    // ----- Lead snapshot (website booking se copy) -----
    serviceName: { type: String, default: '', trim: true },
    servicePrice: { type: Number, default: 0 },
    customerName: { type: String, default: '', trim: true },
    customerEmail: { type: String, default: '', trim: true, lowercase: true },
    customerPhone: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    notes: { type: String, default: '' },
    preferredDate: { type: Date, default: null },

    // ----- Assignment -----
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'FsmUser', required: true, index: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // ----- Lifecycle -----
    // pending      -> service man ko abhi abhi assign hui hai, action baaki hai
    // accepted     -> service man ne job accept kar li
    // in_progress  -> start-service OTP verify ho chuka hai, kaam chal raha hai
    // completed    -> complete OTP verify ho chuka hai, job done
    // cancelled    -> admin ne job cancel kar di (dobara assign ki ja sakti hai)
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },

    acceptedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null }, // jab start-service OTP verify hua
    completedAt: { type: Date, default: null },

    // ----- Start-of-work OTP (customer ke email pe) -----
    startOtpVerified: { type: Boolean, default: false },

    // ----- Work photos (Cloudinary) -----
    beforePhoto: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    afterPhoto: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },

    // ----- End-of-work OTP (customer ke email pe) -----
    completeOtpVerified: { type: Boolean, default: false },

    cancelReason: { type: String, default: null },
  },
  { timestamps: true }
);

FsmJobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FsmJob', FsmJobSchema);
