const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const FsmUserSchema = new mongoose.Schema(
  {
    // ----- Step 1: Basic signup details -----
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    alternateNumber: { type: String, trim: true },

    accountHolderName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, required: true, uppercase: true, trim: true },

    // ----- Step 2: Documents (stored on Cloudinary) -----
    documents: {
      aadharCard: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
      },
      panCard: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
      },
      drivingLicense: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
      },
      passportPhoto: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
      },
      videoClip: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
        duration: { type: Number, default: null },
      },
      eirsIdCard: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
      },
    },
    documentsSubmitted: { type: Boolean, default: false },

    // ----- Admin approval -----
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: null },
    reviewedAt: { type: Date, default: null },

    // ----- Availability toggle (FSM app "online/offline" switch) -----
    // Sirf approved FSM hi isko true kar sakta hai
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Sign JWT for FSM login (same JWT_SECRET as rest of the CRM, alag role tag ke saath)
FsmUserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: 'fsm' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = mongoose.model('FsmUser', FsmUserSchema);
