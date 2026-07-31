const FsmLeave = require('../models/FsmLeave');

// Din ki shuruwat (00:00:00.000) - date-only comparison ke liye
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Din ka end (23:59:59.999)
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Kisi ek FSM technician ki "abhi" (ya diye gaye date pe) leave active hai ya nahi,
// wo bata deta hai. Agar active leave milti hai to leave document bhi return karta hai.
const getActiveLeaveForFsm = async (fsmUserId, onDate = new Date()) => {
  const day = startOfDay(onDate);
  const leave = await FsmLeave.findOne({
    fsmUser: fsmUserId,
    status: 'active',
    fromDate: { $lte: endOfDay(day) },
    toDate: { $gte: startOfDay(day) },
  }).sort({ fromDate: 1 });

  return leave || null;
};

// Ek saath multiple FSM technicians ke liye "on leave today" map bana deta hai
// (dropdown/list dikhane ke liye ek hi query me).
const getOnLeaveMapForFsmIds = async (fsmUserIds, onDate = new Date()) => {
  const day = startOfDay(onDate);
  const leaves = await FsmLeave.find({
    fsmUser: { $in: fsmUserIds },
    status: 'active',
    fromDate: { $lte: endOfDay(day) },
    toDate: { $gte: startOfDay(day) },
  });

  const map = new Map();
  leaves.forEach((leave) => {
    map.set(String(leave.fsmUser), leave);
  });
  return map;
};

module.exports = {
  startOfDay,
  endOfDay,
  getActiveLeaveForFsm,
  getOnLeaveMapForFsmIds,
};
