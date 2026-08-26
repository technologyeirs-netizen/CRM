import API from '../api/axios';

export const b2cReviewService = {
  getAll: (params) => API.get('/b2c/reviews', { params }),
  delete: (id) => API.delete(`/b2c/reviews/${id}`),
};
