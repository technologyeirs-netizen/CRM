import API from '../api/axios';

export const roleService = {
  // Modules available to build a permission matrix from. Super Admin gets
  // every team's modules (or pass ?team=sales to filter); a team lead only
  // ever gets their own team's modules.
  getModules: (team) => API.get('/roles/modules', { params: team ? { team } : {} }),
  // Super Admin sees every role; a team lead only sees active roles for
  // their own team (to pick from when hiring a sub-user).
  getAll: (team) => API.get('/roles', { params: team ? { team } : {} }),
  create: (data) => API.post('/roles', data),
  update: (id, data) => API.put(`/roles/${id}`, data),
  remove: (id) => API.delete(`/roles/${id}`),
};
