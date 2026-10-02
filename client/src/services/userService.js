import API from '../api/axios';

export const userService = {
  // Everyone (non-employee) can see the users they manage / created.
  getAll: () => API.get('/users'),
  // Create a team login. Team leads: forced into their own team, goes to
  // "pending" until Super Admin approves. Super Admin: instantly active.
  create: (data) => API.post('/users', data),
  // Super Admin only
  getPending: () => API.get('/users/pending'),
  approve: (id) => API.put(`/users/${id}/approve`),
  reject: (id) => API.put(`/users/${id}/reject`),
  setStatus: (id, isActive) => API.put(`/users/${id}/status`, { isActive }),
  // Super Admin only — change a user's custom Role and/or who they report to.
  setRole: (id, data) => API.put(`/users/${id}/role`, data),
  remove: (id) => API.delete(`/users/${id}`),
};
