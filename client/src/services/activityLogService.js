import api from "../api/axios";

export const activityLogService = {
  // Full, filterable history list
  getAll: (params) => api.get("/activity-logs", { params }),

  // History for one specific document (e.g. shown on its view page)
  getForDocument: (documentId) =>
    api.get(`/activity-logs/document/${documentId}`),
};
