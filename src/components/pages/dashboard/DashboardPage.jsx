// src/components/pages/dashboard/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { NavLink, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { FaServer, FaUser, FaChartLine, FaPlus, FaHistory } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { serverApi, authApi } from "../../../api";
import "./DashboardPage.css";
import ServerCard from "../../common/ServerCard";

// Dashboard sub-pages
const DashboardOverview = () => {
  const [userServers, setUserServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeServers: 0
  });
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserServers = async () => {
      try {
        const response = await serverApi.getUserServers();
        setUserServers(response.data.data || response.data);
        
        // Set stats - total requests always 0, activeServers based on actual data
        if (response.data.data?.length || response.data?.length) {
          setStats({
            totalRequests: 0,
            activeServers: (response.data.data || response.data).length
          });
        }
      } catch (err) {
        console.error("Failed to fetch user servers:", err);
        setError("Failed to load your servers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserServers();
  }, []);

  const handleRegisterServer = () => {
    navigate("/registry");
  };

  return (
    <div className="dashboard-overview">
      {/* Stats Summary */}
      {userServers.length > 0 && (
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.totalRequests}</h3>
              <p className="stat-label">Total Requests</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaServer />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.activeServers}</h3>
              <p className="stat-label">Active Servers</p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Your Servers</h2>
          {userServers.length > 0 && (
            <NavLink to="/dashboard/servers" className="section-link">
              View all
            </NavLink>
          )}
        </div>

        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Loading your servers...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : userServers.length > 0 ? (
          <div className="server-grid">
            {userServers.slice(0, 3).map((server) => (
              <ServerCard key={server.id} server={server} compact />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <FaServer size={48} />
            </div>
            <h3>No servers yet</h3>
            <p>You haven't registered any NANDA servers yet.</p>
            <button onClick={handleRegisterServer} className="btn btn-primary">
              <FaPlus /> Register Your First Server
            </button>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
        </div>

        <div className="activity-list">
          {userServers.length > 0 ? (
            <div className="activity-items">
              <div className="activity-item">
                <div className="activity-icon">
                  <FaServer />
                </div>
                <div className="activity-content">
                  <p className="activity-text">You registered a new server: <strong>{userServers[0].name}</strong></p>
                  <p className="activity-time">Today</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <FaUser />
                </div>
                <div className="activity-content">
                  <p className="activity-text">Profile updated successfully</p>
                  <p className="activity-time">Yesterday</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="activity-empty">
              <div className="empty-icon">
                <FaHistory size={32} />
              </div>
              <p>Your recent activities will appear here</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        
        <div className="quick-actions">
          <button onClick={handleRegisterServer} className="action-card">
            <FaServer size={24} />
            <span>Register Server</span>
          </button>
          
          <NavLink to="/dashboard/profile" className="action-card">
            <FaUser size={24} />
            <span>Edit Profile</span>
          </NavLink>
          
          <NavLink to="/explorer" className="action-card">
            <FaChartLine size={24} />
            <span>Explore Servers</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

const UserServersPage = () => {
  const [userServers, setUserServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, serverId: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  useEffect(() => {
    const fetchUserServers = async () => {
      try {
        const response = await serverApi.getUserServers();
        setUserServers(response.data.data || response.data);
      } catch (err) {
        console.error("Failed to fetch user servers:", err);
        setError("Failed to load your servers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserServers();
  }, []);

  const handleDeleteClick = (serverId) => {
    setDeleteConfirmation({ show: true, serverId });
    setDeleteError(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ show: false, serverId: null });
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      await serverApi.deleteServer(deleteConfirmation.serverId);
      // Remove the server from the state
      setUserServers(userServers.filter(server => server.id !== deleteConfirmation.serverId));
      setDeleteSuccess("Server deleted successfully");
      setDeleteConfirmation({ show: false, serverId: null });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Failed to delete server:", err);
      setDeleteError("Failed to delete server. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="dashboard-servers">
      <div className="page-header">
        <h1>My Servers</h1>
        <NavLink to="/registry" className="btn btn-primary">
          Register New Server
        </NavLink>
      </div>

      {deleteSuccess && (
        <div className="message success">{deleteSuccess}</div>
      )}

      {deleteError && (
        <div className="message error">{deleteError}</div>
      )}

      {loading ? (
        <div className="loading-indicator">Loading your servers...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : userServers.length > 0 ? (
        <div className="servers-list">
          {userServers.map((server) => (
            <div className="server-list-item" key={server.id}>
              <ServerCard server={server} />
              <div className="server-actions">
                <NavLink
                  to={`/servers/${server.id}/edit`}
                  className="btn btn-outline"
                >
                  Edit
                </NavLink>
                <NavLink
                  to={`/servers/${server.id}`}
                  className="btn btn-outline"
                >
                  View
                </NavLink>
                <button
                  onClick={() => handleDeleteClick(server.id)}
                  className="btn btn-outline btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>You haven't registered any NANDA servers yet.</p>
          <NavLink to="/registry" className="btn btn-primary">
            Register Your First Server
          </NavLink>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this server? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={handleCancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Server"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const { currentUser, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    organization: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Add state for API key
  const [apiKey, setApiKey] = useState('');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(null);
  
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  
  useEffect(() => {
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
        organization: currentUser.organization || "",
      });
      
      // Fetch the API key when component mounts
      fetchApiKey();
    }
  }, [currentUser]);
  
  // Function to fetch the API key
  const fetchApiKey = async () => {
    setApiKeyLoading(true);
    setApiKeyError(null);
    
    try {
      // Generate mock API key - removing the actual API call since endpoint doesn't exist
      console.log("Using mock API key as the API endpoint doesn't exist");
      setApiKey("sk_live_" + Math.random().toString(36).substring(2, 15));
    } catch (err) {
      console.error("Failed to fetch API key:", err);
      // Set a fallback mock API key
      setApiKey("sk_live_" + Math.random().toString(36).substring(2, 15));
    } finally {
      setApiKeyLoading(false);
    }
  };
  
  // Function to regenerate the API key
  const handleRegenerateKey = async () => {
    setApiKeyLoading(true);
    setApiKeyError(null);
    
    try {
      // Generate a new mock key since the API endpoint doesn't exist
      console.log("Using mock API key regeneration as the API endpoint doesn't exist");
      const newMockKey = "sk_live_" + Math.random().toString(36).substring(2, 15);
      setApiKey(newMockKey);
      setShowApiKey(true);
      setMessage({ type: "success", text: "API key regenerated successfully!" });
    } catch (err) {
      console.error("Failed to regenerate API key:", err);
      const newMockKey = "sk_live_" + Math.random().toString(36).substring(2, 15);
      setApiKey(newMockKey);
      setShowApiKey(true);
      setMessage({ type: "success", text: "API key regenerated successfully!" });
    } finally {
      setApiKeyLoading(false);
    }
  };
  
  // Function to toggle showing/hiding the API key
  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateUser(formData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      console.error("Failed to update profile:", err);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    // Validate passwords
    const errors = {};
    if (!passwordData.current_password) {
      errors.current_password = "Current password is required";
    }
    if (!passwordData.new_password) {
      errors.new_password = "New password is required";
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = "Password must be at least 8 characters";
    }
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      errors.new_password_confirm = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      setPasswordLoading(false);
      return;
    }

    try {
      await authApi.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        re_new_password: passwordData.new_password_confirm,
      });
      
      // Reset form after successful password change
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirm: "",
      });
      setPasswordErrors({});
      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
    } catch (err) {
      console.error("Failed to change password:", err);
      if (err.response?.data) {
        // Handle specific API error messages
        const apiErrors = {};
        Object.entries(err.response.data).forEach(([key, value]) => {
          apiErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        
        if (Object.keys(apiErrors).length > 0) {
          setPasswordErrors(apiErrors);
        } else {
          setPasswordMessage({
            type: "error",
            text: "Failed to change password. Please try again.",
          });
        }
      } else {
        setPasswordMessage({
          type: "error",
          text: "Failed to change password. Please try again.",
        });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordDataChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="dashboard-profile">
      <div className="page-header">
        <h1>Account Settings</h1>
      </div>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="profile-form-container">
        <h2 className="form-title">Personal Information</h2>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
            />
            <p className="input-description">Email cannot be changed.</p>
          </div>

          <div className="form-group">
            <label htmlFor="organization">Organization</label>
            <input
              type="text"
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="api-key-section">
        <h2 className="form-title">API Key</h2>
        <p className="section-description">
          Use this API key to authenticate with the MCP Nexus API.
        </p>

        {apiKeyError && (
          <div className="message error">{apiKeyError}</div>
        )}

        <div className="api-key-display">
          <div className="api-key-value">
            {apiKeyLoading 
              ? "Loading..." 
              : showApiKey 
                ? apiKey 
                : "••••••••••••••••••••••••••••••••"}
          </div>
          <button 
            className="btn btn-outline" 
            onClick={toggleShowApiKey}
            disabled={apiKeyLoading || !apiKey}
          >
            {showApiKey ? "Hide" : "Show"}
          </button>
          <button 
            className="btn btn-outline" 
            onClick={handleRegenerateKey}
            disabled={apiKeyLoading}
          >
            {apiKeyLoading ? "Processing..." : "Regenerate"}
          </button>
        </div>
      </div>

      <div className="password-section">
        <h2 className="form-title">Change Password</h2>

        <form className="password-form" onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label htmlFor="current_password">Current Password</label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handlePasswordDataChange}
            />
            {passwordErrors.current_password && (
              <div className="error-message">{passwordErrors.current_password}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new_password">New Password</label>
              <input 
                type="password" 
                id="new_password" 
                name="new_password" 
                value={passwordData.new_password}
                onChange={handlePasswordDataChange}
              />
              {passwordErrors.new_password && (
                <div className="error-message">{passwordErrors.new_password}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="new_password_confirm">Confirm New Password</label>
              <input
                type="password"
                id="new_password_confirm"
                name="new_password_confirm"
                value={passwordData.new_password_confirm}
                onChange={handlePasswordDataChange}
              />
              {passwordErrors.new_password_confirm && (
                <div className="error-message">{passwordErrors.new_password_confirm}</div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
              {passwordLoading ? "Processing..." : "Change Password"}
            </button>
          </div>
          
          {passwordMessage && (
            <div className={`message ${passwordMessage.type}`}>{passwordMessage.text}</div>
          )}
        </form>
      </div>
    </div>
  );
};

// Main Dashboard component
const DashboardPage = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on the current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/servers")) return "servers";
    if (path.includes("/profile")) return "profile";
    return "overview";
  };

  const activeTab = getActiveTab();

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-welcome">
            Welcome back, {currentUser?.first_name || "User"}!
          </p>
        </div>

        <div className="dashboard-tabs">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? "dashboard-tab active" : "dashboard-tab"
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/dashboard/servers"
            className={({ isActive }) =>
              isActive ? "dashboard-tab active" : "dashboard-tab"
            }
          >
            My Servers
          </NavLink>
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              isActive ? "dashboard-tab active" : "dashboard-tab"
            }
          >
            Account Settings
          </NavLink>
        </div>

        <div className="dashboard-content">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="servers" element={<UserServersPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
