const express = require('express');
const router = express.Router();
const { applyLeave, getMyLeaves, cancelMyLeave } = require('../controllers/fsmLeaveController');
const { protectFsm } = require('../middleware/fsmAuth');

// Sabhi routes FSM (service man) login se protected hain
router.post('/', protectFsm, applyLeave);
router.get('/', protectFsm, getMyLeaves);
router.put('/:id/cancel', protectFsm, cancelMyLeave);

module.exports = router;
