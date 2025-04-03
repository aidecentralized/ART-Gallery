// src/components/pages/auth/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./AuthPages.css";

const LoginPage = () => {
  const { login, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from query string
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect);
    }
  }, [isAuthenticated, navigate, redirect]);

  // Update error if auth context provides one
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear field error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      });
    }

    // Clear general error when user types
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      // Redirect is handled by the useEffect
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Log In</h1>
          <p className="auth-subtitle">
            Welcome back! Log in to access your account
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              placeholder="••••••••"
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <div className="form-group-horizontal">
            <div className="checkbox-wrapper">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button className="social-auth-button google">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C9.62 0 7.31.92 5.5 2.75S2.75 9.62 2.75 12s.92 4.69 2.75 6.5S9.62 21.25 12 21.25s4.69-.92 6.5-2.75 2.75-4.09 2.75-6.5-.92-4.69-2.75-6.5S14.38 0 12 0zm0 21.25c-5.1 0-9.25-4.15-9.25-9.25S6.9 2.75 12 2.75s9.25 4.15 9.25 9.25-4.15 9.25-9.25 9.25z" />
            <path
              fill="#4285F4"
              d="M12 4.75c1.66 0 3.14.69 4.22 1.78L19.44 3.3C17.75 1.6 15.02.5 12 .5 7.34.5 3.4 3.1 1.28 6.99l3.65 2.84c.9-2.62 3.34-4.5 6.18-4.5z"
            />
            <path
              fill="#34A853"
              d="M12 21.5c3.02 0 5.75-1.1 7.44-2.8l-3.22-3.22c-1.08 1.09-2.56 1.78-4.22 1.78-2.84 0-5.28-1.88-6.18-4.5L2.51 15.6C4.63 19.5 8.57 21.5 12 21.5z"
            />
            <path
              fill="#FBBC05"
              d="M5.82 14.76c-.21-.64-.33-1.32-.33-2.02s.12-1.38.33-2.02V7.24H2.17c-.76 1.45-1.18 3.08-1.18 4.76s.42 3.31 1.18 4.76l3.65-2z"
            />
            <path
              fill="#EA4335"
              d="M12 8.5c1.38 0 2.62.47 3.6 1.4l2.83-2.83C16.65 5.5 14.43 4.5 12 4.5c-3.43 0-6.37 2-7.82 4.9l3.65 2.84c.9-2.62 3.34-4.5 6.18-4.5z"
            />
          </svg>
          Sign in with Google
        </button>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
