import API from '../api/axios';

export const b2cBannerService = {
  getAll: () => API.get('/b2c/banners'),
  create: (data) => API.post('/b2c/banners', data),
  update: (id, data) => API.put(`/b2c/banners/${id}`, data),
  delete: (id) => API.delete(`/b2c/banners/${id}`),
  reorder: (order) => API.put('/b2c/banners/reorder', { order }),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return API.post('/b2c/banners/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
