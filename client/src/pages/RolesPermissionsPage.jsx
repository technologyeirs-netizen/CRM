import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiPlus, FiShield, FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import { roleService } from '../services/roleService';
import { ROLE_LABELS, TEAM_ROLES } from '../config/roles';
import { ACTIONS, ACTION_LABELS } from '../config/modules';

const emptyForm = () => ({
  name: '',
  team: '',
  description: '',
  canViewFullRevenue: false,
  dataScope: 'own',
  canManageTeamUsers: false,
  permissions: {},
});

const RolesPermissionsPage = () => {
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, modulesRes] = await Promise.all([
        roleService.getAll(),
        roleService.getModules(),
      ]);
      setRoles(Array.isArray(rolesRes.data?.roles) ? rolesRes.data.roles : []);
      setModules(Array.isArray(modulesRes.data?.modules) ? modulesRes.data.modules : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const modulesForTeam = useMemo(
    () => modules.filter((m) => m.team === form.team || m.team === '*'),
    [modules, form.team]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (role) => {
    setEditingId(role.id);
    setForm({
      name: role.name,
      team: role.team,
      description: role.description || '',
      canViewFullRevenue: Boolean(role.canViewFullRevenue),
      dataScope: role.dataScope || 'own',
      canManageTeamUsers: Boolean(role.canManageTeamUsers),
      permissions: role.permissions || {},
    });
    setShowForm(true);
  };

  const toggleAction = (moduleKey, action) => {
    setForm((prev) => {
      const current = prev.permissions[moduleKey] || {};
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleKey]: { ...current, [action]: !current[action] },
        },
      };
    });
  };

  const toggleWholeModule = (moduleKey, value) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: { view: value, create: value, edit: value, delete: value, assign: value },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.team) {
      toast.error('Role name and team are required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const { data } = await roleService.update(editingId, form);
        toast.success(data?.message || 'Role updated');
      } else {
        const { data } = await roleService.create(form);
        toast.success(data?.message || 'Role created');
      }
      setShowForm(false);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    if (!window.confirm(`Delete the "${role.name}" role? This cannot be undone.`)) return;
    try {
      await roleService.remove(role.id);
      toast.success('Role deleted');
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    }
  };

  if (loading) return <Spinner text="Loading roles..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Roles & Permissions</h1>
          <p>
            Define exactly which tabs each role can view/create/edit/delete/assign. Team leads can
            only pick from the roles you create here when they hire someone into their team.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> New Role
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Roles</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Team</th>
                <th>Data Scope</th>
                <th>Full Revenue</th>
                <th>Can Hire Sub-users</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <h3>No roles yet</h3>
                      <p>Create your first role, e.g. "Sales Manager" or "Telecaller".</p>
                    </div>
                  </td>
                </tr>
              ) : (
                roles.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.name}</strong>
                      {r.description ? (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.description}</div>
                      ) : null}
                    </td>
                    <td>{r.teamLabel || ROLE_LABELS[r.team] || r.team}</td>
                    <td style={{ textTransform: 'capitalize' }}>{r.dataScope}</td>
                    <td>{r.canViewFullRevenue ? 'Yes' : 'No'}</td>
                    <td>{r.canManageTeamUsers ? 'Yes' : 'No'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>
                          <FiEdit2 size={14} /> Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r)}>
                          <FiTrash2 size={14} />
                        </button>
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
        title={editingId ? 'Edit Role' : 'New Role'}
        size="xl"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" form="role-form" className="btn btn-primary" disabled={saving}>
              <FiShield /> {saving ? 'Saving...' : 'Save Role'}
            </button>
          </>
        }
      >
        <form id="role-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Role Name</label>
              <input
                className="form-control"
                placeholder="e.g. Sales Manager"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Team</label>
              <select
                className="form-control"
                value={form.team}
                onChange={(e) => setForm((p) => ({ ...p, team: e.target.value, permissions: {} }))}
                required
                disabled={Boolean(editingId)}
              >
                <option value="">Select team</option>
                {TEAM_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <input
              className="form-control"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, margin: '12px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.canViewFullRevenue}
                onChange={(e) => setForm((p) => ({ ...p, canViewFullRevenue: e.target.checked }))}
              />
              Can view full team revenue
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.canManageTeamUsers}
                onChange={(e) => setForm((p) => ({ ...p, canManageTeamUsers: e.target.checked }))}
              />
              Can hire sub-users (manager-level)
            </label>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Data Scope</label>
              <select
                className="form-control"
                value={form.dataScope}
                onChange={(e) => setForm((p) => ({ ...p, dataScope: e.target.value }))}
              >
                <option value="own">Own records only</option>
                <option value="team">Whole downline (manager)</option>
              </select>
            </div>
          </div>

          {form.team ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tab / Module</th>
                    {ACTIONS.map((a) => (
                      <th key={a} style={{ textAlign: 'center' }}>{ACTION_LABELS[a]}</th>
                    ))}
                    <th style={{ textAlign: 'center' }}>All</th>
                  </tr>
                </thead>
                <tbody>
                  {modulesForTeam.map((m) => {
                    const current = form.permissions[m.key] || {};
                    return (
                      <tr key={m.key}>
                        <td>{m.label}</td>
                        {ACTIONS.map((a) => (
                          <td key={a} style={{ textAlign: 'center' }}>
                            {a === 'assign' && !m.supportsAssign ? (
                              '—'
                            ) : (
                              <input
                                type="checkbox"
                                checked={Boolean(current[a])}
                                onChange={() => toggleAction(m.key, a)}
                              />
                            )}
                          </td>
                        ))}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => toggleWholeModule(m.key, !current.view)}
                          >
                            {current.view ? 'Clear' : 'Full'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Select a team to build its permission matrix.</p>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default RolesPermissionsPage;
