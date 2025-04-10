import axios from "axios";
import { refreshTokenDirect } from "./directApi";

// Determine if we should use direct API or proxy
const isDirectApiEnabled = () => {
  // Check for environment variable or localStorage setting that might control this behavior
  // This allows for quick switching between direct and proxy modes
  return (
    process.env.REACT_APP_USE_DIRECT_API === "true" ||
    localStorage.getItem("use_direct_api") === "true"
  );
};

// Create an axios instance with default config
const apiClient = axios.create({
  // Always use the Elastic Beanstalk URL to ensure it works in all environments
  baseURL: "http://https://nanda-registry.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = "/login";
          return Promise.reject(error);
        }

        let newTokens;
        // Always use direct API for token refresh
        newTokens = await refreshTokenDirect(refreshToken);

        // Store the new tokens
        if (newTokens.access) {
          localStorage.setItem("access_token", newTokens.access);
        }
        if (newTokens.refresh) {
          localStorage.setItem("refresh_token", newTokens.refresh);
        }

        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${
          newTokens.access || newTokens.access_token
        }`;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Failed to refresh token, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
