import API from '../api/axios';

export const fsmAdminService = {
  getAll: (params) => API.get('/fsm-admin/requests', { params }),
  getById: (id) => API.get(`/fsm-admin/requests/${id}`),
  approve: (id) => API.put(`/fsm-admin/requests/${id}/approve`),
  reject: (id, reason) => API.put(`/fsm-admin/requests/${id}/reject`, { reason }),

  // ----- FSM job requests (lead assignment to service men) -----
  getTechnicians: () => API.get('/fsm-admin/technicians'),
  getAssignableBookings: (params) => API.get('/fsm-admin/assignable-bookings', { params }),
  assignJob: (payload) => API.post('/fsm-admin/jobs/assign', payload),
  getAllJobs: (params) => API.get('/fsm-admin/jobs', { params }),
  getJobById: (id) => API.get(`/fsm-admin/jobs/${id}`),
  reassignJob: (id, fsmUserId) => API.put(`/fsm-admin/jobs/${id}/reassign`, { fsmUserId }),
  cancelJob: (id, reason) => API.put(`/fsm-admin/jobs/${id}/cancel`, { reason }),
};
