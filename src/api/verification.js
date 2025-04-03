// src/api/verification.js
import apiClient from "./client";

export const verificationApi = {
  // Request verification for a server
  requestVerification: async (serverId) => {
    return await apiClient.post(`/verification/request/${serverId}/`);
  },

  // Check verification status
  getVerificationStatus: async (verificationId) => {
    return await apiClient.get(`/verification/status/${verificationId}/`);
  },

  // Complete verification with proof
  completeVerification: async (verificationId, verificationData) => {
    return await apiClient.post(
      `/verification/complete/${verificationId}/`,
      verificationData
    );
  },

  // Get verification badge for a server
  getVerificationBadge: async (serverId) => {
    return await apiClient.get(`/verification/badge/${serverId}/`);
  },

  // Get health checks for a server
  getHealthChecks: async (serverId) => {
    return await apiClient.get(`/verification/health-checks/${serverId}/`);
  },
};
