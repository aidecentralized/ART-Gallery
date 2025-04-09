import axios from 'axios';

/**
 * This file contains direct API calls that bypass the proxy.
 * Used as a fallback when the proxy approach doesn't work.
 * These calls include CORS workarounds like withCredentials.
 */

// CORS-enabled client with credentials
const createDirectClient = () => {
  return axios.create({
    baseURL: 'http://nanda.us-east-2.elasticbeanstalk.com/api/v1',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: false, // Set to true only if the server supports credentials with CORS
  });
};

// Create the API client
const directClient = createDirectClient();

/**
 * Direct registration attempt
 */
export const registerWithJsonp = (userData) => {
  return new Promise((resolve, reject) => {
    try {
      // Log the attempt
      console.log('Attempting direct registration with:', userData);
      
      // First try a normal request with our directClient
      directClient.post('/auth/register/', userData)
        .then(response => {
          console.log('Registration successful via direct API call');
          resolve(response.data);
        })
        .catch(error => {
          console.error('Direct registration failed, error:', error);
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Direct login attempt
 */
export const loginDirect = async (email, password) => {
  try {
    const response = await directClient.post('/auth/token/', { email, password });
    console.log('Login successful via direct API call:', response.data);
    
    // Properly handle the token response structure
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem("refresh_token", response.data.refresh);
    }
    
    return response.data;
  } catch (error) {
    console.error('Direct login failed, error:', error);
    throw error;
  }
};

/**
 * Direct token refresh
 */
export const refreshTokenDirect = async (refreshToken) => {
  try {
    const response = await directClient.post('/auth/refresh/', { refresh_token: refreshToken });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  registerWithJsonp,
  loginDirect,
  refreshTokenDirect
}; 