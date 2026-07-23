import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiBriefcase,
  FiClock,
  FiCheckCircle,
  FiPlayCircle,
  FiXCircle,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiUserPlus,
  FiRepeat,
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import { fsmAdminService } from '../services/fsmAdminService';

const STATUS_BADGE = {
  pending: 'badge-warning',
  accepted: 'badge-info',
  in_progress: 'badge-primary',
  completed: 'badge-success',
  cancelled: 'badge-danger',
};

const STATUS_LABEL = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const fmtDate = (value) => (value ? format(new Date(value), 'dd MMM yyyy, hh:mm a') : '—');

const FsmJobsPage = () => {
  const [tab, setTab] = useState('unassigned'); // 'unassigned' | 'jobs'

  const [bookings, setBookings] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [assignTarget, setAssignTarget] = useState(null); // booking being assigned
  const [reassignTarget, setReassignTarget] = useState(null); // job being reassigned
  const [selectedTechId, setSelectedTechId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [viewJob, setViewJob] = useState(null);

  const loadTechnicians = useCallback(async () => {
    try {
      const res = await fsmAdminService.getTechnicians();
      setTechnicians(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load technicians');
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'unassigned') {
        const res = await fsmAdminService.getAssignableBookings(search ? { search } : undefined);
        setBookings(Array.isArray(res?.data?.data) ? res.data.data : []);
      } else {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        const res = await fsmAdminService.getAllJobs(params);
        setJobs(Array.isArray(res?.data?.data) ? res.data.data : []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load data');
    }
    setLoading(false);
  }, [tab, search, statusFilter]);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(
    () => ({
      unassigned: bookings.length,
      pending: jobs.filter((j) => j.status === 'pending').length,
      accepted: jobs.filter((j) => j.status === 'accepted').length,
      inProgress: jobs.filter((j) => j.status === 'in_progress').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
    }),
    [bookings, jobs]
  );

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.customerName?.toLowerCase().includes(q) ||
        j.serviceName?.toLowerCase().includes(q) ||
        j.customerPhone?.toLowerCase().includes(q) ||
        j.assignedTo?.fullName?.toLowerCase().includes(q)
    );
  }, [jobs, search]);

  const openAssign = (booking) => {
    setAssignTarget(booking);
    setSelectedTechId('');
  };

  const openReassign = (job) => {
    setReassignTarget(job);
    setSelectedTechId(job.assignedTo?._id || '');
  };

  const closeModals = () => {
    setAssignTarget(null);
    setReassignTarget(null);
    setSelectedTechId('');
    setViewJob(null);
  };

  const handleAssign = async () => {
    if (!selectedTechId) {
      toast.error('Please select a service man');
      return;
    }
    setActionLoading(true);
    try {
      await fsmAdminService.assignJob({ bookingId: assignTarget._id, fsmUserId: selectedTechId });
      toast.success('Lead assigned successfully');
      closeModals();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign lead');
    }
    setActionLoading(false);
  };

  const handleReassign = async () => {
    if (!selectedTechId) {
      toast.error('Please select a service man');
      return;
    }
    setActionLoading(true);
    try {
      await fsmAdminService.reassignJob(reassignTarget._id, selectedTechId);
      toast.success('Job reassigned successfully');
      closeModals();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reassign job');
    }
    setActionLoading(false);
  };

  const handleCancel = async (job) => {
    if (!window.confirm(`Cancel FSM job for "${job.customerName}"?`)) return;
    try {
      await fsmAdminService.cancelJob(job._id, 'Cancelled by admin');
      toast.success('Job cancelled');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel job');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>FSM Job Requests</h1>
          <p>Assign incoming service leads to field service men and track job status</p>
        </div>
        <button className="btn btn-secondary" onClick={loadData}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--secondary-light, #e2e8f0)' }}>
            <FiUserPlus color="var(--text-muted)" />
          </div>
          <div className="stat-info">
            <h4>{stats.unassigned}</h4>
            <p>Unassigned Leads</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>
            <FiClock color="var(--warning)" />
          </div>
          <div className="stat-info">
            <h4>{stats.pending}</h4>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-light)' }}>
            <FiBriefcase color="var(--info)" />
          </div>
          <div className="stat-info">
            <h4>{stats.accepted}</h4>
            <p>Accepted</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>
            <FiPlayCircle color="var(--primary)" />
          </div>
          <div className="stat-info">
            <h4>{stats.inProgress}</h4>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)' }}>
            <FiCheckCircle color="var(--success)" />
          </div>
          <div className="stat-info">
            <h4>{stats.completed}</h4>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`btn ${tab === 'unassigned' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('unassigned')}
        >
          Unassigned Leads
        </button>
        <button className={`btn ${tab === 'jobs' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('jobs')}>
          All Job Requests
        </button>
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-control search-input"
            style={{ paddingLeft: 34 }}
            placeholder="Search by customer, service, phone, technician..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {tab === 'jobs' && (
          <select className="form-control filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
      </div>

      <div className="card">
        {loading ? (
          <Spinner />
        ) : tab === 'unassigned' ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Booked At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length ? (
                  bookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.serviceName || 'N/A'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rs {Number(b.servicePrice || 0).toLocaleString()}</div>
                      </td>
                      <td>{b.customerName || 'N/A'}</td>
                      <td>{b.phoneNumber || 'N/A'}</td>
                      <td>{b.email || 'N/A'}</td>
                      <td>{b.address || 'N/A'}</td>
                      <td>{fmtDate(b.createdAt)}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => openAssign(b)}>
                          <FiUserPlus size={14} /> Assign
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <h3>No unassigned leads</h3>
                        <p>All incoming website bookings have been assigned to a service man.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Assigned On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length ? (
                  filteredJobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{job.serviceName || 'N/A'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rs {Number(job.servicePrice || 0).toLocaleString()}</div>
                      </td>
                      <td>
                        <div>{job.customerName || 'N/A'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{job.customerPhone}</div>
                      </td>
                      <td>{job.assignedTo?.fullName || '—'}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[job.status] || 'badge-secondary'}`}>
                          {STATUS_LABEL[job.status] || job.status}
                        </span>
                      </td>
                      <td>{fmtDate(job.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setViewJob(job)} title="View Details">
                            <FiEye size={14} />
                          </button>
                          {['pending', 'accepted'].includes(job.status) && (
                            <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openReassign(job)} title="Reassign">
                              <FiRepeat size={14} />
                            </button>
                          )}
                          {job.status !== 'completed' && job.status !== 'cancelled' && (
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleCancel(job)} title="Cancel Job">
                              <FiXCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <h3>No FSM job requests found</h3>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign lead to technician */}
      <Modal
        isOpen={Boolean(assignTarget)}
        onClose={closeModals}
        title="Assign Lead to Service Man"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModals}>Cancel</button>
            <button className="btn btn-primary" disabled={actionLoading} onClick={handleAssign}>
              {actionLoading ? 'Assigning...' : 'Assign'}
            </button>
          </>
        }
      >
        {assignTarget && (
          <div>
            <div className="form-group">
              <label className="form-label">Lead</label>
              <p style={{ fontWeight: 600 }}>{assignTarget.serviceName}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {assignTarget.customerName} · {assignTarget.phoneNumber} · Rs {Number(assignTarget.servicePrice || 0).toLocaleString()}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{assignTarget.address}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Select Service Man</label>
              <select className="form-control" value={selectedTechId} onChange={(e) => setSelectedTechId(e.target.value)}>
                <option value="">-- Choose a technician --</option>
                {technicians.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.fullName} ({t.phone}) {t.isActive ? '· Online' : '· Offline'}
                  </option>
                ))}
              </select>
              {!technicians.length && (
                <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>
                  No approved service men available. Approve technicians from FSM Requests first.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reassign job */}
      <Modal
        isOpen={Boolean(reassignTarget)}
        onClose={closeModals}
        title="Reassign Job"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModals}>Cancel</button>
            <button className="btn btn-primary" disabled={actionLoading} onClick={handleReassign}>
              {actionLoading ? 'Reassigning...' : 'Reassign'}
            </button>
          </>
        }
      >
        {reassignTarget && (
          <div>
            <div className="form-group">
              <label className="form-label">Lead</label>
              <p style={{ fontWeight: 600 }}>{reassignTarget.serviceName}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{reassignTarget.customerName}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Currently Assigned To</label>
              <p>{reassignTarget.assignedTo?.fullName || '—'}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Reassign To</label>
              <select className="form-control" value={selectedTechId} onChange={(e) => setSelectedTechId(e.target.value)}>
                <option value="">-- Choose a technician --</option>
                {technicians.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.fullName} ({t.phone}) {t.isActive ? '· Online' : '· Offline'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* View job details */}
      <Modal isOpen={Boolean(viewJob)} onClose={closeModals} title={viewJob?.serviceName || 'Job Details'} size="lg">
        {viewJob && (
          <div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Customer</label>
                <p>{viewJob.customerName}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <p>{viewJob.customerPhone}</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <p>{viewJob.customerEmail}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <p>Rs {Number(viewJob.servicePrice || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <p>{viewJob.address}</p>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assigned Technician</label>
                <p>{viewJob.assignedTo?.fullName || '—'}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <span className={`badge ${STATUS_BADGE[viewJob.status] || 'badge-secondary'}`}>
                  {STATUS_LABEL[viewJob.status] || viewJob.status}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Timeline</label>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Assigned: {fmtDate(viewJob.createdAt)}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Accepted: {fmtDate(viewJob.acceptedAt)}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Started: {fmtDate(viewJob.startedAt)}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Completed: {fmtDate(viewJob.completedAt)}</p>
            </div>

            {(viewJob.beforePhoto?.url || viewJob.afterPhoto?.url) && (
              <div className="form-group">
                <label className="form-label">Work Photos</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {viewJob.beforePhoto?.url && (
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Before Work</p>
                      <a href={viewJob.beforePhoto.url} target="_blank" rel="noreferrer">
                        <img src={viewJob.beforePhoto.url} alt="Before work" style={{ width: 140, height: 105, objectFit: 'cover', borderRadius: 6 }} />
                      </a>
                    </div>
                  )}
                  {viewJob.afterPhoto?.url && (
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>After Work</p>
                      <a href={viewJob.afterPhoto.url} target="_blank" rel="noreferrer">
                        <img src={viewJob.afterPhoto.url} alt="After work" style={{ width: 140, height: 105, objectFit: 'cover', borderRadius: 6 }} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewJob.notes && (
              <div className="form-group">
                <label className="form-label">Notes</label>
                <p>{viewJob.notes}</p>
              </div>
            )}

            {viewJob.status === 'cancelled' && viewJob.cancelReason && (
              <div className="form-group">
                <label className="form-label">Cancellation Reason</label>
                <p style={{ color: 'var(--danger)' }}>{viewJob.cancelReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FsmJobsPage;
