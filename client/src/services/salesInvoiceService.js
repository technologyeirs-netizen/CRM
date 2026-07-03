import api from "../api/axios";

export const salesInvoiceService = {

  // CREATE
  create: (data) =>
    api.post("/sales-invoices/create", data),

  // GET ALL
  getAll: (params) =>
    api.get("/sales-invoices/all", { params }),

  // GET SINGLE
  getById: (id) =>
    api.get(`/sales-invoices/${id}`),

  // UPDATE
  update: (id, data) =>
    api.put(`/sales-invoices/${id}`, data),

  // DELETE
  remove: (id) =>
    api.delete(`/sales-invoices/${id}`),
  
};