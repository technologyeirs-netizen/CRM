import API from "../api/axios";

// Talks to the SAME product data the website admin panel uses — no separate
// CRM item/model, no "go live" step. Create/update/delete here shows up on
// the website immediately, and vice versa (same as categoryService).
export const productService = {
  getAll: (params) => API.get("/products", { params }),
  getById: (id) => API.get(`/products/${id}`),
  create: (data) => API.post("/products", data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
};
