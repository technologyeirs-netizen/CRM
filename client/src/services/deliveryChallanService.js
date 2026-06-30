import api from "../api/axios";

export const deliveryChallanService = {

  // CREATE
  create: (data) =>
    api.post("/delivery-challans/create", data),

  // GET ALL
  getAll: (params) =>
    api.get("/delivery-challans/all", { params }),

  // GET SINGLE
  getById: (id) =>
    api.get(`/delivery-challans/${id}`),

  // UPDATE
  update: (id, data) =>
    api.put(`/delivery-challans/${id}`, data),

  // DELETE
  remove: (id) =>
    api.delete(`/delivery-challans/${id}`),

};