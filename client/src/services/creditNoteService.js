// services/creditNoteService.js

import api from "../api/axios";

export const creditNoteService = {
  createFromInvoice: (
    invoiceId,
    payload
  ) =>
    api.post(
      `/credit-notes/from-invoice/${invoiceId}`,
      payload
    ),

  getAll: (params) =>
    api.get("/credit-notes", { params }),

  getById: (id) =>
    api.get(`/credit-notes/${id}`),

  delete: (id) =>
    api.delete(`/credit-notes/${id}`),
};