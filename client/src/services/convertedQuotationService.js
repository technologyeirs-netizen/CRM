// services/convertedQuotationService.js

import api from "../api/axios";

export const convertedQuotationService = {
  createFromInvoice: (invoiceId, payload) =>
    api.post(`/converted-quotations/from-invoice/${invoiceId}`, payload),

  getAll: () => api.get("/converted-quotations"),

  getById: (id) => api.get(`/converted-quotations/${id}`),

  delete: (id) => api.delete(`/converted-quotations/${id}`),
};
