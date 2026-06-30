import API from "../api/axios";

export const salesSettingService = {
  get: () => API.get("/sales-settings"),

  update: (data) =>
    API.put("/sales-settings", data),
};