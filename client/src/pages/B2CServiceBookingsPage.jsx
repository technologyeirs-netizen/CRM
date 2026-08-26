import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import { b2cServiceBookingService } from '../services/b2cServiceBookingService';

const statusOptions = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const B2CServiceBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await b2cServiceBookingService.getAll({ page: 1, limit: 200, search, status });
      setBookings(Array.isArray(res.data?.bookings) ? res.data.bookings : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const handleStatusChange = async (booking, newStatus) => {
    try {
      await b2cServiceBookingService.updateStatus(booking._id, { status: newStatus });
      toast.success('Booking status updated');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Service Bookings</h1>
          <p>Bookings made by customers for a service, from the website or the app.</p>
        </div>
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-control"
            style={{ paddingLeft: 34 }}
            placeholder="Search by customer name, phone, service"
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
          <Spinner text="Loading bookings..." />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Preferred Date</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length ? bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div>{b.customerName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.phoneNumber}</div>
                    </td>
                    <td>{b.serviceName} {b.servicePrice ? `— Rs ${Number(b.servicePrice).toLocaleString()}` : ''}</td>
                    <td>{b.preferredDate ? format(new Date(b.preferredDate), 'dd MMM yyyy') : 'N/A'}</td>
                    <td>{b.paymentStatus}</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ maxWidth: 140 }}
                        value={b.status}
                        onChange={(e) => handleStatusChange(b, e.target.value)}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state"><h3>No bookings found</h3></div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default B2CServiceBookingsPage;
