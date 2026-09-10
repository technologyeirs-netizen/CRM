import api from "../api/axios";

export const salesQuotationService = {
  // CREATE
  create: (data) => api.post("/sales-quotations/create", data),

  // GET ALL
  getAll: (params) => api.get("/sales-quotations/all", { params }),

  // GET SINGLE
  getById: (id) => api.get(`/sales-quotations/${id}`),

  // UPDATE
  update: (id, data) => api.put(`/sales-quotations/${id}`, data),

  // DELETE
  remove: (id) => api.delete(`/sales-quotations/${id}`),

  // CONVERT TO INVOICE (deducts stock)
  convertToInvoice: (id, payload) =>
    api.post(`/sales-quotations/${id}/convert-to-invoice`, payload),
};
