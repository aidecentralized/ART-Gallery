// src/api/webhooks.js
import apiClient from "./client";

export const webhookApi = {
  // Get all webhooks
  getWebhooks: async () => {
    return await apiClient.get("/webhooks/");
  },

  // Get a specific webhook
  getWebhook: async (id) => {
    return await apiClient.get(`/webhooks/${id}/`);
  },

  // Create a webhook
  createWebhook: async (webhookData) => {
    return await apiClient.post("/webhooks/", webhookData);
  },

  // Update a webhook
  updateWebhook: async (id, webhookData) => {
    return await apiClient.put(`/webhooks/${id}/`, webhookData);
  },

  // Delete a webhook
  deleteWebhook: async (id) => {
    return await apiClient.delete(`/webhooks/${id}/`);
  },

  // Regenerate webhook secret
  regenerateSecret: async (id) => {
    return await apiClient.post(`/webhooks/${id}/regenerate_secret/`);
  },

  // Get webhook deliveries
  getWebhookDeliveries: async (id) => {
    return await apiClient.get(`/webhooks/${id}/deliveries/`);
  },

  // Get webhook delivery details
  getDeliveryDetails: async (deliveryId) => {
    return await apiClient.get(`/webhooks/deliveries/${deliveryId}/`);
  },

  // Retry a webhook delivery
  retryDelivery: async (deliveryId) => {
    return await apiClient.post(`/webhooks/deliveries/${deliveryId}/retry/`);
  },

  // Test a webhook
  testWebhook: async (id) => {
    return await apiClient.post(`/webhooks/${id}/test/`);
  },
};
