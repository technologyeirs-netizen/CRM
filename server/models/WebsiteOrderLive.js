// Talks directly to the SAME "orders" collection that the website backend
// (web-server) uses — same pattern as models/Products.js for products.
// This is the LIVE, real order data (not the sample/demo WebsiteOrder model).
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        productName: String,
        category: String,
        brand: String,
        price: Number,
        quantity: Number,
        image: String,
        hsn: String,
        modelNo: String,
        discount: Number,
      },
    ],
    totalPrice: Number,
    totalItems: Number,
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    orderDate: Date,
    estimatedDelivery: Date,
    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      houseNo: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
    },
    paymentMethod: String,
    paymentSubMethod: String,
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded', 'Cancelled'],
      default: 'Pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    customerEmail: String,
    customerPhone: String,
    paidAt: Date,
    notes: String,
    cancelledAt: Date,
    cancellationReason: String,
    deliveredAt: Date,
    refundInfo: {
      status: { type: String, enum: ['None', 'Requested', 'Approved', 'Rejected', 'Processed'], default: 'None' },
      reason: String,
      refundAmount: Number,
      requestedAt: Date,
      approvedAt: Date,
      processedAt: Date,
      returnPaymentMethod: String,
      returnPaymentDetails: String,
      adminNotes: String,
    },
    afterDeliveryRequest: {
      type: { type: String, enum: ['None', 'Return', 'Replace'], default: 'None' },
      status: { type: String, enum: ['None', 'Requested', 'Approved', 'Rejected', 'Processed'], default: 'None' },
      reason: String,
      returnPaymentMethod: String,
      returnPaymentDetails: String,
      requestedAt: Date,
      approvedAt: Date,
      processedAt: Date,
      adminNotes: String,
    },
    invoice: {
      invoiceNumber: String,
      invoiceDate: Date,
      billUrl: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebsiteOrderLive', OrderSchema, 'orders');
