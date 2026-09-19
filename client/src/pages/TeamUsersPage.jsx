import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiClock, FiPlus, FiShield, FiTrash2, FiUserPlus, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, TEAM_ROLES } from '../config/roles';

const initialForm = { name: '', email: '', password: '', role: '' };

const StatusPill = ({ status }) => {
  const map = {
    active: { label: 'Active', color: '#16a34a', bg: '#dcfce7' },
    pending: { label: 'Pending Approval', color: '#b45309', bg: '#fef3c7' },
    rejected: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2' },
  };
  const style = map[status] || map.active;
  return (
    <span
      style={{
        color: style.color,
        background: style.bg,
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {style.label}
    </span>
  );
};

const TeamUsersPage = () => {
  const { user, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [actingId, setActingId] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.getAll();
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load team users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    pending: users.filter((u) => u.status === 'pending').length,
  }), [users]);

  const openCreate = () => {
    setForm({ ...initialForm, role: isSuperAdmin ? '' : user?.role || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required');
      return;
    }
    if (isSuperAdmin && !form.role) {
      toast.error('Please choose a team for this user');
      return;
    }

    setSaving(true);
    try {
      const { data } = await userService.create({
        name: form.name,
        email: form.email,
        password: form.password,
        role: isSuperAdmin ? form.role : user?.role,
      });
      toast.success(data?.message || 'User created');
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id) => {
    setActingId(id);
    try {
      await userService.approve(id);
      toast.success('User approved and activated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve user');
    } finally {
      setActingId('');
    }
  };

  const handleReject = async (id) => {
    setActingId(id);
    try {
      await userService.reject(id);
      toast.success('User request rejected');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject user');
    } finally {
      setActingId('');
    }
  };

  const handleToggleActive = async (u) => {
    setActingId(u.id);
    try {
      await userService.setStatus(u.id, !u.isActive);
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setActingId('');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this user permanently? This cannot be undone.')) return;
    setActingId(id);
    try {
      await userService.remove(id);
      toast.success('User removed');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove user');
    } finally {
      setActingId('');
    }
  };

  if (loading) return <Spinner text="Loading team users..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isSuperAdmin ? 'Team Access & Users' : 'My Team'}</h1>
          <p>
            {isSuperAdmin
              ? 'Every team login across the CRM. Approve new requests before they can sign in.'
              : `People you have invited into the ${ROLE_LABELS[user?.role] || 'team'}. New logins need Super Admin approval before they can sign in.`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiUserPlus /> Add {isSuperAdmin ? 'Team User' : 'Colleague'}
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>
            <FiShield color="var(--primary)" />
          </div>
          <div className="stat-info">
            <h4>{stats.total}</h4>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)' }}>
            <FiCheckCircle color="var(--success)" />
          </div>
          <div className="stat-info">
            <h4>{stats.active}</h4>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>
            <FiClock color="var(--warning)" />
          </div>
          <div className="stat-info">
            <h4>{stats.pending}</h4>
            <p>Awaiting Approval</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>{isSuperAdmin ? 'All Team Logins' : 'My Invited Colleagues'}</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Team</th>
                <th>Status</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <h3>No users yet</h3>
                      <p>Click "Add {isSuperAdmin ? 'Team User' : 'Colleague'}" to invite someone.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td style={{ fontFamily: 'monospace' }}>{u.password || '—'}</td>
                    <td>{u.roleLabel || ROLE_LABELS[u.role] || u.role}</td>
                    <td><StatusPill status={u.status} /></td>
                    <td>{u.isActive ? 'Yes' : 'No'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {isSuperAdmin && u.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={actingId === u.id}
                              onClick={() => handleApprove(u.id)}
                            >
                              <FiCheckCircle size={14} /> Approve
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={actingId === u.id}
                              onClick={() => handleReject(u.id)}
                            >
                              <FiXCircle size={14} /> Reject
                            </button>
                          </>
                        )}
                        {isSuperAdmin && u.status !== 'pending' && u.role !== 'admin' && u.role !== 'superadmin' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={actingId === u.id}
                            onClick={() => handleToggleActive(u)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        {isSuperAdmin && u.role !== 'admin' && u.role !== 'superadmin' && (
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={actingId === u.id}
                            onClick={() => handleDelete(u.id)}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                        {!isSuperAdmin && u.status === 'pending' && (
                          <span style={{ color: '#b45309', fontSize: 12 }}>Waiting for Super Admin</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={`Add ${isSuperAdmin ? 'Team User' : 'Colleague'}`}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" form="team-user-form" className="btn btn-primary" disabled={saving}>
              <FiPlus /> {saving ? 'Saving...' : 'Create'}
            </button>
          </>
        }
      >
        <form id="team-user-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required minLength={6} />
          </div>
          {isSuperAdmin ? (
            <div className="form-group">
              <label className="form-label">Team</label>
              <select className="form-control" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} required>
                <option value="">Select team</option>
                {TEAM_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Team</label>
              <div className="form-control">{ROLE_LABELS[user?.role] || user?.role}</div>
              <small style={{ color: 'var(--text-secondary)' }}>
                This login will need Super Admin approval before it can sign in.
              </small>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default TeamUsersPage;
