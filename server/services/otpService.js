const FsmOtp = require('../models/FsmOtp');
const { sendEmail } = require('./emailService');

const OTP_EXPIRY_MINUTES = 5;

const generateSixDigitOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generates OTP, saves it in DB and sends it to the given email.
 * Future: add generateAndSendOtpToPhone(phone) here using an SMS provider,
 * both can be called from fsmController based on login type.
 */
const generateAndSendOtpToEmail = async (email) => {
  const otp = generateSixDigitOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // purane otp hata do taaki ek time pe ek hi valid otp rahe
  await FsmOtp.deleteMany({ email });
  await FsmOtp.create({ email, otp, expiresAt });

  await sendEmail({
    to: email,
    subject: 'Your FSM App Login OTP',
    text: `Your OTP is ${otp}. It is valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.`,
  });

  return otp;
};

/**
 * Verifies OTP against DB record. Returns true/false.
 */
const verifyEmailOtp = async (email, otp) => {
  const record = await FsmOtp.findOne({ email: email.toLowerCase(), otp });

  if (!record) return false;

  if (record.expiresAt < new Date()) {
    await FsmOtp.deleteOne({ _id: record._id });
    return false;
  }

  await FsmOtp.deleteOne({ _id: record._id }); // ek baar use hone ke baad OTP invalid
  return true;
};

module.exports = { generateAndSendOtpToEmail, verifyEmailOtp };
