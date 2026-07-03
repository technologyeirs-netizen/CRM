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

  getAll: () =>
    api.get("/credit-notes"),

  getById: (id) =>
    api.get(`/credit-notes/${id}`),

  delete: (id) =>
    api.delete(`/credit-notes/${id}`),
};