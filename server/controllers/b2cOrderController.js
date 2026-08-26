const mongoose = require('mongoose');
const Order = require('../models/WebsiteOrderLive');

// NOTE: This talks directly to the shared "orders" collection (same DB the
// website & app use), same pattern as products/categories. That means basic
// status changes here are instantly visible on the website/app.
//
// What this deliberately does NOT do: trigger Razorpay refunds, send
// emails/SMS, or regenerate invoices. Those have real side effects that only
// the website backend's own controllers implement. Approve/process refunds
// and after-delivery requests from the website's own admin flow — this
// section is for visibility + simple status/logistics updates only.

exports.getOrders = async (req, res) => {
  try {
    const { search, status, paymentStatus, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'invoice.invoiceNumber': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const stats = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      orders,
      stats: stats[0] || { totalRevenue: 0, count: 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order id' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logistics-only status update (Pending/Confirmed/Shipped/Delivered/Cancelled) + notes.
// Does not touch payment/refund fields.
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of ${allowed.join(', ')}` });
    }

    const update = {};
    if (status) update.status = status;
    if (status === 'Delivered') update.deliveredAt = new Date();
    if (notes !== undefined) update.notes = notes;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.status(200).json({ success: true, message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
