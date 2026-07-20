const mongoose = require('mongoose');

const FsmOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB khud expire hone ke baad document delete kar dega (TTL index)
FsmOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('FsmOtp', FsmOtpSchema);
