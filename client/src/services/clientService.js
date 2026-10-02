import API from '../api/axios';

export const clientService = {
  getAll: (params) => API.get('/clients', { params }),
  getById: (id) => API.get(`/clients/${id}`),
  create: (data) => API.post('/clients', data),
  update: (id, data) => API.put(`/clients/${id}`, data),
  delete: (id) => API.delete(`/clients/${id}`),
  addPurchase: (id, data) => API.post(`/clients/${id}/purchase`, data),
  updatePurchaseStatus: (clientId, purchaseIndex, status) => API.put(`/clients/${clientId}/purchase/${purchaseIndex}`, { status }),
  getStats: () => API.get('/clients/stats'),
  // Lead distribution: assign/reassign a lead to someone in your downline
  // (e.g. Sales Manager -> Sales Executive / Telecaller).
  assignLead: (id, userId) => API.put(`/clients/${id}/assign`, { userId }),
  getAssignableUsers: () => API.get('/clients/assignable-users'),
  importExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post('/clients/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportExcel: () => API.get('/clients/export', { responseType: 'blob' }),
};
