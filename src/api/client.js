import axios from "axios";

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:80/api/v1",
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

        // Attempt to refresh the token - use the proper payload structure
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh/`,
          { refresh_token: refreshToken }
        );

        // Store the new tokens
        localStorage.setItem("access_token", response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }

        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;

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
