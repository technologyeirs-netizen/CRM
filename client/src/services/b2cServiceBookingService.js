import API from '../api/axios';

export const b2cServiceBookingService = {
  getAll: (params) => API.get('/b2c/service-bookings', { params }),
  updateStatus: (id, payload) => API.put(`/b2c/service-bookings/${id}/status`, payload),
};
