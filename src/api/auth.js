// src/api/auth.js
import apiClient from "./client";

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post("/auth/token/", { email, password });
    localStorage.setItem(
      "access_token",
      response.data.access_token || response.data.access
    );
    localStorage.setItem(
      "refresh_token",
      response.data.refresh_token || response.data.refresh
    );
    return response.data;
  },

  register: async (userData) => {
    return await apiClient.post("/auth/register/", userData);
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  getCurrentUser: async () => {
    return await apiClient.get("/auth/me/");
  },

  changePassword: async (passwordData) => {
    return await apiClient.post("/auth/password/change/", passwordData);
  },

  resetPassword: async (email) => {
    return await apiClient.post("/auth/password/reset/", { email });
  },

  confirmResetPassword: async (tokenData) => {
    return await apiClient.post("/auth/password/reset/confirm/", tokenData);
  },

  verifyEmail: async (token) => {
    return await apiClient.post("/auth/email/verify/", { token });
  },

  getApiKey: async () => {
    return await apiClient.get("/auth/key/");
  },

  regenerateApiKey: async () => {
    return await apiClient.post("/auth/key/");
  },
};
