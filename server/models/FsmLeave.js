const mongoose = require('mongoose');

// FsmLeave = ek service man (FsmUser) ki leave/time-off request.
// Service man apni FSM app se "kis din se kis din tak" leave lagata hai,
// aur jab tak wo range chal rahi hai, admin panel me us technician ko
// "On Leave" dikhega + naye lead assign karte waqt dropdown me wo
// assign nahi ho payega.
const FsmLeaveSchema = new mongoose.Schema(
  {
    fsmUser: { type: mongoose.Schema.Types.ObjectId, ref: 'FsmUser', required: true, index: true },

    // Dono dates "date only" ki tarah treat hoti hain (inclusive range).
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },

    reason: { type: String, default: '', trim: true },

    // active    -> leave abhi valid hai (upcoming ya chal rahi)
    // cancelled -> service man ne khud apni leave cancel kar di
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
      index: true,
    },

    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

FsmLeaveSchema.index({ fsmUser: 1, status: 1, fromDate: 1, toDate: 1 });

module.exports = mongoose.model('FsmLeave', FsmLeaveSchema);
