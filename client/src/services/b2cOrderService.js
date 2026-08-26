import API from '../api/axios';

export const b2cOrderService = {
  getAll: (params) => API.get('/b2c/orders', { params }),
  getById: (id) => API.get(`/b2c/orders/${id}`),
  updateStatus: (id, payload) => API.put(`/b2c/orders/${id}/status`, payload),
};
