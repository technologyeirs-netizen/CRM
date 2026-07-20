import API from '../api/axios';

export const fsmAdminService = {
  getAll: (params) => API.get('/fsm-admin/requests', { params }),
  getById: (id) => API.get(`/fsm-admin/requests/${id}`),
  approve: (id) => API.put(`/fsm-admin/requests/${id}/approve`),
  reject: (id, reason) => API.put(`/fsm-admin/requests/${id}/reject`, { reason }),
};
