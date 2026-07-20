const express = require('express');
const router = express.Router();
const {
  signup,
  uploadDocuments,
  sendOtp,
  verifyOtpAndLogin,
  getMyProfile,
  toggleActiveStatus,
} = require('../controllers/fsmController');
const { uploadFsmDocuments } = require('../middleware/fsmUpload');
const { protectFsm } = require('../middleware/fsmAuth');

router.post('/signup', signup);
router.post('/:id/upload-documents', uploadFsmDocuments, uploadDocuments);

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpAndLogin);

router.get('/me', protectFsm, getMyProfile);
router.put('/toggle-active', protectFsm, toggleActiveStatus);

module.exports = router;
