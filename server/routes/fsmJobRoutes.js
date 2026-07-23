const express = require('express');
const router = express.Router();
const {
  getMyJobs,
  getMyJobById,
  acceptJob,
  startService,
  verifyStartOtp,
  uploadBeforePhoto,
  uploadAfterPhoto,
  requestCompleteOtp,
  verifyCompleteOtp,
} = require('../controllers/fsmJobController');
const { protectFsm } = require('../middleware/fsmAuth');
const { uploadBeforePhoto: beforePhotoUpload, uploadAfterPhoto: afterPhotoUpload } = require('../middleware/fsmJobUpload');

// Sabhi routes FSM (service man) login se protected hain
router.get('/', protectFsm, getMyJobs);
router.get('/:id', protectFsm, getMyJobById);

router.put('/:id/accept', protectFsm, acceptJob);
router.put('/:id/start-service', protectFsm, startService);
router.post('/:id/verify-start-otp', protectFsm, verifyStartOtp);

router.post('/:id/before-photo', protectFsm, beforePhotoUpload, uploadBeforePhoto);
router.post('/:id/after-photo', protectFsm, afterPhotoUpload, uploadAfterPhoto);

router.put('/:id/request-complete-otp', protectFsm, requestCompleteOtp);
router.post('/:id/verify-complete-otp', protectFsm, verifyCompleteOtp);

module.exports = router;
