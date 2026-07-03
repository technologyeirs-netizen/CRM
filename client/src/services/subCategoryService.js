import API from "../api/axios";

export const subCategoryService = {
  getAll(params) {
    return API.get("/subcategories", { params });
  },

  getById(id) {
    return API.get(`/subcategories/${id}`);
  },

  create(data) {
    return API.post("/subcategories", data);
  },

  update(id, data) {
    return API.put(`/subcategories/${id}`, data);
  },

  delete(id) {
    return API.delete(`/subcategories/${id}`);
  },
};