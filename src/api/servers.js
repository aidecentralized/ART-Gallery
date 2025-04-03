// src/api/servers.js
import apiClient from "./client";

export const serverApi = {
  // Get a list of all servers with filtering
  getServers: async (filters = {}) => {
    return await apiClient.get("/servers/", { params: filters });
  },

  // Get user's own servers
  getUserServers: async () => {
    return await apiClient.get("/servers/me/");
  },

  // Get a specific server by ID
  getServer: async (id) => {
    return await apiClient.get(`/servers/${id}/`);
  },

  // Register a new server
  registerServer: async (serverData) => {
    const formData = new FormData();

    // Add all fields to the formData
    Object.keys(serverData).forEach((key) => {
      // Handle array fields
      if (Array.isArray(serverData[key])) {
        serverData[key].forEach((value) => {
          formData.append(`${key}`, value);
        });
      }
      // Handle nested objects (capabilities, usage_requirements)
      else if (key === "capabilities" || key === "usage_requirements") {
        formData.append(key, JSON.stringify(serverData[key]));
      }
      // Handle file upload (logo)
      else if (key === "logo" && serverData[key] instanceof File) {
        formData.append(key, serverData[key]);
      }
      // Handle other fields
      else {
        formData.append(key, serverData[key]);
      }
    });

    return await apiClient.post("/servers/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update a server
  updateServer: async (id, serverData) => {
    const formData = new FormData();

    Object.keys(serverData).forEach((key) => {
      if (Array.isArray(serverData[key])) {
        serverData[key].forEach((value) => {
          formData.append(`${key}`, value);
        });
      } else if (key === "capabilities" || key === "usage_requirements") {
        formData.append(key, JSON.stringify(serverData[key]));
      } else if (key === "logo" && serverData[key] instanceof File) {
        formData.append(key, serverData[key]);
      } else {
        formData.append(key, serverData[key]);
      }
    });

    return await apiClient.patch(`/servers/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete a server
  deleteServer: async (id) => {
    return await apiClient.delete(`/servers/${id}/`);
  },

  // Rate a server
  rateServer: async (id, rating, review) => {
    return await apiClient.post(`/servers/${id}/rate/`, {
      rating,
      review,
    });
  },

  // Get server ratings
  getServerRatings: async (id) => {
    return await apiClient.get(`/servers/${id}/ratings/`);
  },

  // Activate/Deactivate a server
  activateServer: async (id) => {
    return await apiClient.post(`/servers/${id}/activate/`);
  },

  deactivateServer: async (id, message) => {
    return await apiClient.post(`/servers/${id}/deactivate/`, { message });
  },
};
