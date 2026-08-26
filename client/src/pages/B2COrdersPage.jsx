import React, { useEffect, useState } from 'react';
import { FiSearch, FiShoppingBag, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { b2cOrderService } from '../services/b2cOrderService';

const statusOptions = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const B2COrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [viewOrder, setViewOrder] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await b2cOrderService.getAll({ page: 1, limit: 200, search, status });
      setOrders(Array.isArray(res.data?.orders) ? res.data.orders : []);
      setStats(res.data?.stats || null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load orders');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const handleStatusChange = async (order, newStatus) => {
    try {
      await b2cOrderService.updateStatus(order._id, { status: newStatus });
      toast.success('Order status updated');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>Live orders placed from the website and the app (same database — read-only on money/refund fields here).</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>
            <FiShoppingBag color="var(--primary)" />
          </div>
          <div className="stat-info">
            <h4>{stats?.count ?? orders.length}</h4>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)' }}>
            <FiShoppingBag color="var(--success)" />
          </div>
          <div className="stat-info">
            <h4>Rs {Math.round(stats?.totalRevenue || 0).toLocaleString()}</h4>
            <p>Total Order Value</p>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-control"
            style={{ paddingLeft: 34 }}
            placeholder="Search by customer name, email, phone, invoice no."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-control" style={{ maxWidth: 180 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Spinner text="Loading orders..." />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length ? orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div>{order.shippingAddress?.fullName || 'N/A'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {order.customerEmail || order.customerPhone || 'N/A'}
                      </div>
                    </td>
                    <td>{Array.isArray(order.items) ? order.items.length : 0}</td>
                    <td style={{ fontWeight: 600 }}>Rs {Number(order.totalPrice || 0).toLocaleString()}</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ maxWidth: 140 }}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value)}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td><StatusBadge value={String(order.paymentStatus || '').toLowerCase()} /></td>
                    <td>{order.orderDate ? format(new Date(order.orderDate), 'dd MMM yyyy, hh:mm a') : 'N/A'}</td>
                    <td>
                      <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setViewOrder(order)} title="View details">
                        <FiEye size={14} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <h3>No orders found</h3>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title="Order Details" size="lg">
        {viewOrder && (
          <div>
            <p><strong>Customer:</strong> {viewOrder.shippingAddress?.fullName} — {viewOrder.customerPhone}</p>
            <p><strong>Address:</strong> {[viewOrder.shippingAddress?.address, viewOrder.shippingAddress?.city, viewOrder.shippingAddress?.state, viewOrder.shippingAddress?.zipCode].filter(Boolean).join(', ')}</p>
            <p><strong>Payment:</strong> {viewOrder.paymentMethod} — {viewOrder.paymentStatus}</p>
            {viewOrder.refundInfo?.status && viewOrder.refundInfo.status !== 'None' && (
              <p><strong>Refund:</strong> {viewOrder.refundInfo.status} (manage the actual refund from the website admin panel)</p>
            )}
            <div className="table-wrapper" style={{ marginTop: 12 }}>
              <table>
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
                </thead>
                <tbody>
                  {(viewOrder.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>Rs {Number(item.price || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default B2COrdersPage;
