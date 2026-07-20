import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiUsers,
  FiSearch,
  FiEye,
  FiRefreshCw,
  FiFileText,
  FiCreditCard,
  FiVideo,
  FiUser,
  FiHash,
  FiShield,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import { fsmAdminService } from '../services/fsmAdminService';

const DOC_FIELDS = [
  { key: 'aadharCard', label: 'Aadhar Card', icon: FiShield, type: 'image' },
  { key: 'panCard', label: 'PAN Card', icon: FiCreditCard, type: 'image' },
  { key: 'drivingLicense', label: 'Driving Licence', icon: FiFileText, type: 'image' },
  { key: 'passportPhoto', label: 'Passport Photo', icon: FiUser, type: 'image' },
  { key: 'eirsIdCard', label: 'EIRS ID Card', icon: FiHash, type: 'image' },
  { key: 'videoClip', label: 'Verification Clip', icon: FiVideo, type: 'video' },
];

const STATUS_BADGE = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-danger',
};

const FsmRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fsmAdminService.getAll(statusFilter ? { status: statusFilter } : undefined);
      setRequests(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load FSM requests');
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    }),
    [requests]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(
      (r) =>
        r.fullName?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q)
    );
  }, [requests, search]);

  const openDetail = (item) => {
    setSelected(item);
    setRejecting(false);
    setReason('');
  };

  const closeDetail = () => {
    setSelected(null);
    setRejecting(false);
    setReason('');
  };

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await fsmAdminService.approve(id);
      toast.success('FSM approved successfully');
      closeDetail();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve FSM');
    }
    setActionId(null);
  };

  const handleReject = async (id) => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActionId(id);
    try {
      await fsmAdminService.reject(id, reason.trim());
      toast.success('FSM rejected');
      closeDetail();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject FSM');
    }
    setActionId(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>FSM Requests</h1>
          <p>Review field service technician signups and verification documents</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchData}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>
            <FiUsers color="var(--primary)" />
          </div>
          <div className="stat-info">
            <h4>{stats.total}</h4>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>
            <FiClock color="var(--warning)" />
          </div>
          <div className="stat-info">
            <h4>{stats.pending}</h4>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)' }}>
            <FiCheckCircle color="var(--success)" />
          </div>
          <div className="stat-info">
            <h4>{stats.approved}</h4>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-light)' }}>
            <FiXCircle color="var(--danger)" />
          </div>
          <div className="stat-info">
            <h4>{stats.rejected}</h4>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            className="form-control search-input"
            style={{ paddingLeft: 34 }}
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-control filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
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
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Bank Account</th>
                  <th>Documents</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 600 }}>{r.fullName}</td>
                      <td>{r.phone}</td>
                      <td>{r.email}</td>
                      <td>
                        {r.ifscCode} · ****{String(r.accountNumber || '').slice(-4)}
                      </td>
                      <td>
                        <span className={`badge ${r.documentsSubmitted ? 'badge-success' : 'badge-secondary'}`}>
                          {r.documentsSubmitted ? 'Submitted' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[r.status] || 'badge-secondary'}`}>{r.status}</span>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openDetail(r)} title="View & Review">
                          <FiEye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <h3>No FSM requests found</h3>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(selected)}
        onClose={closeDetail}
        title={selected?.fullName || 'FSM Request'}
        size="lg"
        footer={
          selected && selected.status === 'pending' && !rejecting ? (
            <>
              <button className="btn btn-secondary" onClick={() => setRejecting(true)}>
                <FiXCircle /> Reject
              </button>
              <button className="btn btn-success" disabled={actionId === selected._id} onClick={() => handleApprove(selected._id)}>
                <FiCheckCircle /> {actionId === selected._id ? 'Approving...' : 'Approve'}
              </button>
            </>
          ) : selected && rejecting ? (
            <>
              <button className="btn btn-secondary" onClick={() => setRejecting(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" disabled={actionId === selected._id} onClick={() => handleReject(selected._id)}>
                {actionId === selected._id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </>
          ) : null
        }
      >
        {selected && (
          <div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <p>{selected.phone}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Alternate Number</label>
                <p>{selected.alternateNumber || '—'}</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <p>{selected.email}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <span className={`badge ${STATUS_BADGE[selected.status] || 'badge-secondary'}`}>{selected.status}</span>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Account Holder</label>
                <p>{selected.accountHolderName}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Account Number / IFSC</label>
                <p>
                  {selected.accountNumber} · {selected.ifscCode}
                </p>
              </div>
            </div>

            {selected.status === 'rejected' && selected.rejectionReason && (
              <div className="form-group">
                <label className="form-label">Rejection Reason</label>
                <p style={{ color: 'var(--danger)' }}>{selected.rejectionReason}</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Submitted Documents</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {DOC_FIELDS.map(({ key, label, icon: Icon, type }) => {
                  const doc = selected.documents?.[key];
                  return (
                    <div
                      key={key}
                      style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          aspectRatio: '4/3',
                          background: 'var(--bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {doc?.url ? (
                          type === 'video' ? (
                            <video src={doc.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <a href={doc.url} target="_blank" rel="noreferrer" style={{ width: '100%', height: '100%', display: 'block' }}>
                              <img src={doc.url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </a>
                          )
                        ) : (
                          <Icon size={22} color="var(--text-muted)" />
                        )}
                      </div>
                      <div style={{ padding: '6px 8px' }}>
                        <p style={{ fontSize: 12, fontWeight: 600 }}>{label}</p>
                        {key === 'videoClip' && doc?.duration && (
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{doc.duration}s</p>
                        )}
                        {!doc?.url && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Not submitted</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {rejecting && (
              <div className="form-group">
                <label className="form-label">Reason for Rejection</label>
                <textarea
                  className="form-control"
                  rows={3}
                  autoFocus
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain what's missing or incorrect so the technician can resubmit..."
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FsmRequestsPage;
