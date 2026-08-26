import API from '../api/axios';

export const b2cServiceService = {
  getAll: (params) => API.get('/b2c/services', { params }),
  create: (data) => API.post('/b2c/services', data),
  update: (id, data) => API.put(`/b2c/services/${id}`, data),
  delete: (id) => API.delete(`/b2c/services/${id}`),
};
