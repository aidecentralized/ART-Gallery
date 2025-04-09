// src/api/auth.js
import apiClient from "./client";
import { loginDirect, registerWithJsonp } from "./directApi";

// Helper to determine if we should use direct API or proxy
const isDirectApiEnabled = () => {
  return process.env.REACT_APP_USE_DIRECT_API === 'true' || 
         localStorage.getItem('use_direct_api') === 'true';
};

export const authApi = {
  login: async (email, password) => {
    try {
      // Decide whether to use direct API or proxy based on configuration
      if (isDirectApiEnabled()) {
        return await loginDirect(email, password);
      } else {
        // Use proxy approach
        const response = await apiClient.post("/auth/token/", { email, password });
        
        // Store tokens based on API response format
        if (response.data.access) {
          localStorage.setItem("access_token", response.data.access);
        } else if (response.data.access_token) {
          localStorage.setItem("access_token", response.data.access_token);
        }
        
        if (response.data.refresh) {
          localStorage.setItem("refresh_token", response.data.refresh);
        } else if (response.data.refresh_token) {
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }
        
        return response.data;
      }
    } catch (error) {
      console.error("Login failed:", error);
      // If proxy fails and we weren't using direct already, try direct as fallback
      if (!isDirectApiEnabled()) {
        console.log("Falling back to direct API login");
        try {
          return await loginDirect(email, password);
        } catch (directError) {
          console.error("Both login approaches failed:", directError);
          throw directError;
        }
      }
      throw error;
    }
  },

  register: async (userData) => {
    try {
      // Ensure password_confirm is included in user data
      if (userData.password && !userData.password_confirm) {
        userData.password_confirm = userData.password;
      }
      
      // Decide whether to use direct API or proxy based on configuration
      if (isDirectApiEnabled()) {
        return await registerWithJsonp(userData);
      } else {
        // Use proxy approach
        const response = await apiClient.post("/auth/register/", userData);
        return response.data;
      }
    } catch (error) {
      console.error("Registration failed:", error);
      // If proxy fails and we weren't using direct already, try direct as fallback
      if (!isDirectApiEnabled()) {
        console.log("Falling back to direct API registration");
        try {
          return await registerWithJsonp(userData);
        } catch (directError) {
          console.error("Both registration approaches failed:", directError);
          throw directError;
        }
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  getCurrentUser: async () => {
    return await apiClient.get("/auth/me/");
  },

  updateUser: async (userData) => {
    // Since /auth/update/ returns 404, use the common pattern of PATCH to /auth/me/
    return await apiClient.patch("/auth/me/", userData);
  },

  changePassword: async (passwordData) => {
    console.log('Password change payload:', passwordData);
    try {
      const response = await apiClient.post("/auth/password/change/", passwordData);
      console.log('Password change success:', response.data);
      return response;
    } catch (error) {
      console.error('Password change error:', error.response?.data || error.message);
      throw error;
    }
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

  getApiKey: async function () {
    // Return a mock implementation since the endpoint doesn't exist
    return Promise.resolve({
      data: {
        key: "sk_live_" + Math.random().toString(36).substring(2, 15)
      }
    });
  },

  regenerateApiKey: async function () {
    // Return a mock implementation since the endpoint doesn't exist
    return Promise.resolve({
      data: {
        key: "sk_live_" + Math.random().toString(36).substring(2, 15)
      }
    });
  },
  
  // Toggle between direct API and proxy mode
  toggleDirectApi: (enabled) => {
    localStorage.setItem('use_direct_api', enabled ? 'true' : 'false');
    console.log(`API mode set to: ${enabled ? 'Direct API' : 'Proxy'}`);
    // Reload the page to apply changes
    window.location.reload();
  }
};