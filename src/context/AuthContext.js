// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api";

// Create the context
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        setCurrentUser(response.data);
      } catch (err) {
        console.error("Failed to get current user:", err);
        // Clear invalid tokens
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
        setError(err.response?.data?.message || "Failed to authenticate");
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authApi.login(email, password);
      const userResponse = await authApi.getCurrentUser();
      setCurrentUser(userResponse.data);
      return data;
    } catch (err) {
      console.error("Login failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.register(userData);
      return response.data;
    } catch (err) {
      console.error("Registration failed:", err);
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    authApi.logout();
    setCurrentUser(null);
  }, []);

  // Update user function
  const updateUser = useCallback(
    async (userData) => {
      if (!currentUser) return;

      setLoading(true);
      setError(null);

      try {
        const response = await authApi.getCurrentUser();
        setCurrentUser(response.data);
        return response.data;
      } catch (err) {
        console.error("Failed to update user:", err);
        setError(
          err.response?.data?.message || "Failed to update user information"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
