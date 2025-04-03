// src/api/discovery.js
import apiClient from "./client";

export const discoveryApi = {
  // Search for servers with query and filters
  searchServers: async (query, filters = {}) => {
    return await apiClient.get("/discovery/search/", {
      params: {
        q: query,
        ...filters,
      },
    });
  },

  // Get server recommendations
  getRecommendations: async (filters = {}) => {
    return await apiClient.get("/discovery/recommend/", {
      params: filters,
    });
  },

  // Get popular servers
  getPopularServers: async (period = "week", limit = 10) => {
    return await apiClient.get("/discovery/popular/", {
      params: {
        period,
        limit,
      },
    });
  },

  // Get search history
  getSearchHistory: async () => {
    return await apiClient.get("/discovery/history/search/");
  },

  // Get usage history
  getUsageHistory: async () => {
    return await apiClient.get("/discovery/history/usage/");
  },

  // Record server usage
  recordServerUsage: async (serverUsageData) => {
    return await apiClient.post("/discovery/usage/", serverUsageData);
  },

  // Update user preferences
  updateUserPreferences: async (preferencesData) => {
    return await apiClient.put("/discovery/preferences/", preferencesData);
  },

  // Get user preferences
  getUserPreferences: async () => {
    return await apiClient.get("/discovery/preferences/");
  },
};
