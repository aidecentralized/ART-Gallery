// src/components/pages/dashboard/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { serverApi } from "../../../api";
import { useAuth } from "../../../context/AuthContext";
import ServerCard from "../../common/ServerCard";
import "./DashboardPage.css";

// Dashboard sub-pages
const DashboardOverview = () => {
  const [userServers, setUserServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="dashboard-overview">
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
          <div className="loading-indicator">Loading your servers...</div>
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
            <p>You haven't registered any MCP servers yet.</p>
            <NavLink to="/registry" className="btn btn-primary">
              Register Your First Server
            </NavLink>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
        </div>

        <div className="activity-list">
          <div className="activity-empty">
            <p>No recent activity to display.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserServersPage = () => {
  const [userServers, setUserServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="dashboard-servers">
      <div className="page-header">
        <h1>My Servers</h1>
        <NavLink to="/registry" className="btn btn-primary">
          Register New Server
        </NavLink>
      </div>

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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>You haven't registered any MCP servers yet.</p>
          <NavLink to="/registry" className="btn btn-primary">
            Register Your First Server
          </NavLink>
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

  useEffect(() => {
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        email: currentUser.email || "",
        organization: currentUser.organization || "",
      });
    }
  }, [currentUser]);

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

        <div className="api-key-display">
          <div className="api-key-value">••••••••••••••••••••••••••••••••</div>
          <button className="btn btn-outline">Show</button>
          <button className="btn btn-outline">Regenerate</button>
        </div>
      </div>

      <div className="password-section">
        <h2 className="form-title">Change Password</h2>

        <form className="password-form">
          <div className="form-group">
            <label htmlFor="current_password">Current Password</label>
            <input
              type="password"
              id="current_password"
              name="current_password"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new_password">New Password</label>
              <input type="password" id="new_password" name="new_password" />
            </div>

            <div className="form-group">
              <label htmlFor="new_password_confirm">Confirm New Password</label>
              <input
                type="password"
                id="new_password_confirm"
                name="new_password_confirm"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Change Password
            </button>
          </div>
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
