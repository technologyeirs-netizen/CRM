import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import { fsmAdminService } from '../services/fsmAdminService';

const fmtDate = (value) => (value ? format(new Date(value), 'dd MMM yyyy') : '—');
const fmtDateTime = (value) => (value ? format(new Date(value), 'dd MMM yyyy, hh:mm a') : '—');

// Ek leave request ka "abhi ka status" nikaalta hai — sirf FsmLeave.status ('active'/'cancelled')
// se nahi, balki aaj ki date range se compare karke: On Leave / Upcoming / Completed / Cancelled.
const getLeaveState = (leave) => {
  if (leave.status === 'cancelled') return 'cancelled';
  if (leave.isCurrentlyOnLeave) return 'on_leave';
  const today = new Date();
  if (new Date(leave.toDate) < today) return 'completed';
  return 'upcoming';
};

const STATE_BADGE = {
  on_leave: 'badge-danger',
  upcoming: 'badge-warning',
  completed: 'badge-secondary',
  cancelled: 'badge-secondary',
};

const STATE_LABEL = {
  on_leave: 'On Leave Now',
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const FsmLeavesPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fsmAdminService.getLeaves();
      setLeaves(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load leave requests');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const withState = useMemo(() => leaves.map((l) => ({ ...l, state: getLeaveState(l) })), [leaves]);

  const stats = useMemo(
    () => ({
      total: withState.length,
      onLeaveNow: withState.filter((l) => l.state === 'on_leave').length,
      upcoming: withState.filter((l) => l.state === 'upcoming').length,
      cancelled: withState.filter((l) => l.state === 'cancelled').length,
    }),
    [withState]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return withState.filter((l) => {
      const matchesSearch =
        !q ||
        l.fsmUser?.fullName?.toLowerCase().includes(q) ||
        l.fsmUser?.phone?.toLowerCase().includes(q) ||
        l.reason?.toLowerCase().includes(q);
      const matchesState = !stateFilter || l.state === stateFilter;
      return matchesSearch && matchesState;
    });
  }, [withState, search, stateFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>FSM Leave Requests</h1>
          <p>Service men leave/time-off requests — on-leave technicians are auto-hidden from assignment</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchData}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--secondary-light, #e2e8f0)' }}>
            <FiCalendar color="var(--text-muted)" />
          </div>
          <div className="stat-info">
            <h4>{stats.total}</h4>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-light)' }}>
            <FiClock color="var(--danger)" />
          </div>
          <div className="stat-info">
            <h4>{stats.onLeaveNow}</h4>
            <p>On Leave Now</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>
            <FiCheckCircle color="var(--warning)" />
          </div>
          <div className="stat-info">
            <h4>{stats.upcoming}</h4>
            <p>Upcoming</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--secondary-light, #e2e8f0)' }}>
            <FiXCircle color="var(--text-muted)" />
          </div>
          <div className="stat-info">
            <h4>{stats.cancelled}</h4>
            <p>Cancelled</p>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-control search-input"
            style={{ paddingLeft: 34 }}
            placeholder="Search by technician name, phone, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-control filter-select" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
          <option value="">All</option>
          <option value="on_leave">On Leave Now</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Spinner />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Service Man</th>
                  <th>Phone</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((leave) => (
                    <tr key={leave._id}>
                      <td style={{ fontWeight: 600 }}>{leave.fsmUser?.fullName || '—'}</td>
                      <td>{leave.fsmUser?.phone || '—'}</td>
                      <td>{fmtDate(leave.fromDate)}</td>
                      <td>{fmtDate(leave.toDate)}</td>
                      <td>{leave.reason || '—'}</td>
                      <td>
                        <span className={`badge ${STATE_BADGE[leave.state] || 'badge-secondary'}`}>
                          {STATE_LABEL[leave.state] || leave.state}
                        </span>
                      </td>
                      <td>{fmtDateTime(leave.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <h3>No leave requests found</h3>
                        <p>Leave requests submitted by service men from the FSM app will show up here.</p>
                      </div>
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

export default FsmLeavesPage;
