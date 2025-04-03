// src/api/analytics.js
import apiClient from "./client";

export const analyticsApi = {
  // Get server analytics
  getServerAnalytics: async (serverId, period = "month") => {
    return await apiClient.get(`/analytics/servers/${serverId}/`, {
      params: { period },
    });
  },

  // Get network-wide analytics
  getNetworkAnalytics: async (period = "month") => {
    return await apiClient.get("/analytics/network/", {
      params: { period },
    });
  },

  // Get server request logs
  getServerLogs: async (serverId) => {
    return await apiClient.get(`/analytics/servers/${serverId}/logs/`);
  },

  // Get daily analytics for a server
  getDailyAnalytics: async (serverId, days = 30) => {
    return await apiClient.get(`/analytics/servers/${serverId}/daily/`, {
      params: { days },
    });
  },

  // Create a log entry
  createLog: async (logData) => {
    return await apiClient.post("/analytics/log/", logData);
  },
};
