const express = require('express');
const {
  upsertWebsiteUser,
  upsertWebsiteOrder,
  upsertWebsiteBooking,
  upsertWebsiteContact,
  updateWebsiteUser,
  updateWebsiteOrder,
  updateWebsiteBooking,
  updateWebsiteContact,
  deleteWebsiteUser,
  deleteWebsiteOrder,
  deleteWebsiteBooking,
  deleteWebsiteContact,
  getWebsiteUsers,
  getWebsiteOrders,
  getWebsiteBookings,
  getWebsiteContacts,
  getWebsiteSyncStats,
} = require('../controllers/websiteSyncController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, authorize('admin', 'website'), getWebsiteSyncStats);
router.get('/users', protect, authorize('admin', 'website'), getWebsiteUsers);
router.get('/orders', protect, authorize('admin', 'website'), getWebsiteOrders);
router.get('/bookings', protect, authorize('admin', 'website'), getWebsiteBookings);
router.get('/contacts', protect, authorize('admin', 'website'), getWebsiteContacts);

router.post('/users', protect, authorize('admin', 'website'), upsertWebsiteUser);
router.post('/orders', protect, authorize('admin', 'website'), upsertWebsiteOrder);
router.post('/bookings', protect, authorize('admin', 'website'), upsertWebsiteBooking);
router.post('/contacts', protect, authorize('admin', 'website'), upsertWebsiteContact);

router.put('/users/:id', protect, authorize('admin', 'website'), updateWebsiteUser);
router.put('/orders/:id', protect, authorize('admin', 'website'), updateWebsiteOrder);
router.put('/bookings/:id', protect, authorize('admin', 'website'), updateWebsiteBooking);
router.put('/contacts/:id', protect, authorize('admin', 'website'), updateWebsiteContact);

router.delete('/users/:id', protect, authorize('admin', 'website'), deleteWebsiteUser);
router.delete('/orders/:id', protect, authorize('admin', 'website'), deleteWebsiteOrder);
router.delete('/bookings/:id', protect, authorize('admin', 'website'), deleteWebsiteBooking);
router.delete('/contacts/:id', protect, authorize('admin', 'website'), deleteWebsiteContact);

module.exports = router;
