// src/utils/apiTest.js
import axios from "axios";

// Helper for direct API calls
const directApi = axios.create({
  baseURL: "http://https://nanda-registry.com/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Utility function to test the connection to the backend API
 * This can be called from the browser console or a test component
 * @param {boolean} useDirect - Whether to test direct API or proxy
 */
export const testApiConnection = async (useDirect = false) => {
  try {
    // Test basic API connection (non-authenticated)
    console.log(
      `Testing API connection to ${
        useDirect ? "direct NANDA backend" : "proxy API"
      }...`
    );
    const baseUrl = useDirect
      ? "http://https://nanda-registry.com/api/v1"
      : "/api/v1";

    // Use the appropriate client
    const client = useDirect ? directApi : axios;

    // Test server connection
    console.log(`Connecting to: ${baseUrl}`);
    const serverResponse = await client.get(
      `${useDirect ? baseUrl : baseUrl}/servers/`
    );
    console.log("Server list endpoint response:", serverResponse.data);

    // Test auth endpoints existence (without actually authenticating)
    try {
      await client.get(`${useDirect ? baseUrl : baseUrl}/auth/token/`);
    } catch (error) {
      // We expect this to fail with 401 or 405, but it confirms the endpoint exists
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 405)
      ) {
        console.log("Auth endpoint exists and requires authentication (good)");
      } else {
        console.warn("Auth endpoint test failed unexpectedly:", error.message);
      }
    }

    return {
      success: true,
      message: `API connection successful to ${
        useDirect ? "direct backend" : "proxy"
      }`,
      baseUrl,
    };
  } catch (error) {
    console.error("API connection test failed:", error);
    return {
      success: false,
      message: `API connection failed: ${error.message}`,
      error,
    };
  }
};

/**
 * Test user registration (use with caution, creates actual accounts)
 * @param {Object} userData - User data for registration
 * @param {boolean} useDirect - Whether to test direct API or proxy
 */
export const testRegistration = async (userData, useDirect = false) => {
  try {
    const baseUrl = useDirect
      ? "http://https://nanda-registry.com/api/v1"
      : "/api/v1";
    const client = useDirect ? directApi : axios;

    // Ensure password_confirm is included
    if (userData.password && !userData.password_confirm) {
      userData.password_confirm = userData.password;
    }

    console.log(
      `Testing registration with data via ${
        useDirect ? "direct API" : "proxy"
      }:`,
      userData
    );

    const response = await client.post(
      `${useDirect ? baseUrl : baseUrl}/auth/register/`,
      userData
    );
    console.log("Registration response:", response.data);

    return {
      success: true,
      message: "Registration test successful",
      data: response.data,
    };
  } catch (error) {
    console.error(
      "Registration test failed:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: `Registration failed: ${
        error.response?.data?.detail || error.message
      }`,
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Test login functionality
 * @param {string} email - Email for login
 * @param {string} password - Password for login
 * @param {boolean} useDirect - Whether to test direct API or proxy
 */
export const testLogin = async (email, password, useDirect = false) => {
  try {
    const baseUrl = useDirect
      ? "http://https://nanda-registry.com/api/v1"
      : "/api/v1";
    const client = useDirect ? directApi : axios;

    console.log(
      `Testing login for ${email} via ${useDirect ? "direct API" : "proxy"}`
    );

    const response = await client.post(
      `${useDirect ? baseUrl : baseUrl}/auth/token/`,
      { email, password }
    );
    console.log("Login response:", response.data);

    // Store tokens in localStorage if requested
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem("refresh_token", response.data.refresh);
    }

    return {
      success: true,
      message: "Login test successful",
      tokens: {
        access: response.data.access || response.data.access_token,
        refresh: response.data.refresh || response.data.refresh_token,
      },
      user: response.data.user,
    };
  } catch (error) {
    console.error("Login test failed:", error.response?.data || error.message);
    return {
      success: false,
      message: `Login failed: ${error.response?.data?.detail || error.message}`,
      error: error.response?.data || error.message,
    };
  }
};

// Make functions available in the browser console for manual testing
if (typeof window !== "undefined") {
  window.testApiConnection = testApiConnection;
  window.testRegistration = testRegistration;
  window.testLogin = testLogin;
  // Add a helper to toggle direct API mode
  window.toggleDirectApi = (enabled = true) => {
    localStorage.setItem("use_direct_api", enabled ? "true" : "false");
    console.log(`API mode set to: ${enabled ? "Direct API" : "Proxy"}`);
    return { success: true, mode: enabled ? "direct" : "proxy" };
  };
}
