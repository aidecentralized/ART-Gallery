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
    // Check if we need multipart/form-data (if there's a file upload)
    const hasFile = serverData.logo instanceof File;
    
    // Ensure we have authentication token
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }
    
    try {
      if (hasFile) {
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
            "Authorization": `Bearer ${token}`
          },
        });
      } else {
        // If no file, use regular JSON submission
        return await apiClient.post("/servers/", serverData, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error("Server registration error:", error.response?.data || error.message);
      // Rethrow the error with better information if available
      if (error.response?.data?.message) {
        error.message = error.response.data.message;
      }
      throw error;
    }
  },

  // Update a server
  updateServer: async (id, serverData) => {
    // Check if we need multipart/form-data (if there's a file upload)
    const hasFile = serverData.logo instanceof File;
    
    if (hasFile) {
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
    } else {
      // If no file, use regular JSON submission
      return await apiClient.patch(`/servers/${id}/`, serverData);
    }
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
