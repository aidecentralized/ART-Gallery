// src/components/pages/server/ServerDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { serverApi, verificationApi, analyticsApi } from "../../../api";
import { useAuth } from "../../../context/AuthContext";
import LoadingSpinner from "../../common/LoadingSpinner";
import ErrorMessage from "../../common/ErrorMessage";
import "./ServerDetailPage.css";
import VerificationPanel from "./verification/VerificationPanel";
import VerificationStatus from "./verification/VerificationStatus";

const ServerDetailPage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State for server data
  const [server, setServer] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for tabs
  const [activeTab, setActiveTab] = useState("overview");

  // State for analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  // State for health checks
  const [healthChecks, setHealthChecks] = useState([]);
  const [healthChecksLoading, setHealthChecksLoading] = useState(false);

  // State for verification
  const [verificationData, setVerificationData] = useState(null);
  const [showVerificationPanel, setShowVerificationPanel] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [showVerificationStatus, setShowVerificationStatus] = useState(false);

  // State for rating form
  const [ratingData, setRatingData] = useState({
    rating: 5,
    review: "",
  });
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);

  // State for server actions
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  // Fetch server data on mount
  useEffect(() => {
    const fetchServerData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await serverApi.getServer(id);
        setServer(response.data);

        // Fetch ratings
        try {
          const ratingsResponse = await serverApi.getServerRatings(id);
          setRatings(ratingsResponse.data.data || ratingsResponse.data);
        } catch (ratingsError) {
          console.error("Failed to fetch ratings:", ratingsError);
        }
      } catch (err) {
        console.error("Failed to fetch server:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load server data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServerData();
  }, [id]);

  // Fetch analytics when analytics tab is active
  useEffect(() => {
    if (activeTab === "analytics" && server && !analytics) {
      const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        setAnalyticsError(null);

        try {
          const response = await analyticsApi.getServerAnalytics(id);
          setAnalytics(response.data);
        } catch (err) {
          console.error("Failed to fetch analytics:", err);
          setAnalyticsError(
            err.response?.data?.message || "Failed to load analytics data."
          );
        } finally {
          setAnalyticsLoading(false);
        }
      };

      fetchAnalytics();
    }
  }, [activeTab, id, server, analytics]);

  // Fetch health checks when health tab is active
  useEffect(() => {
    if (activeTab === "health" && server) {
      const fetchHealthChecks = async () => {
        setHealthChecksLoading(true);

        try {
          const response = await verificationApi.getHealthChecks(id);
          setHealthChecks(response.data.data || response.data);
        } catch (err) {
          console.error("Failed to fetch health checks:", err);
        } finally {
          setHealthChecksLoading(false);
        }
      };

      fetchHealthChecks();
    }
  }, [activeTab, id, server]);

  // Handle rating input changes
  const handleRatingChange = (e) => {
    const { name, value } = e.target;
    setRatingData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value, 10) : value,
    }));
  };

  // Submit a rating
  const submitRating = async (e) => {
    e.preventDefault();

    setRatingSubmitting(true);
    setRatingError(null);

    try {
      await serverApi.rateServer(id, ratingData.rating, ratingData.review);

      // Refresh ratings
      const ratingsResponse = await serverApi.getServerRatings(id);
      setRatings(ratingsResponse.data.data || ratingsResponse.data);

      // Refresh server data to get updated rating
      const serverResponse = await serverApi.getServer(id);
      setServer(serverResponse.data);

      // Reset form
      setRatingData({
        rating: 5,
        review: "",
      });
      setShowRatingForm(false);
    } catch (err) {
      console.error("Failed to submit rating:", err);
      setRatingError(
        err.response?.data?.message ||
          "Failed to submit rating. Please try again."
      );
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Handle server activation/deactivation
  const toggleServerStatus = async () => {
    if (!server || !isServerOwner()) return;

    setActionLoading(true);

    try {
      if (server.is_active) {
        // Deactivate server
        await serverApi.deactivateServer(id, "Deactivated by owner");
      } else {
        // Activate server
        await serverApi.activateServer(id);
      }

      // Refresh server data
      const response = await serverApi.getServer(id);
      setServer(response.data);
    } catch (err) {
      console.error("Failed to toggle server status:", err);
      alert(
        `Failed to ${server.is_active ? "deactivate" : "activate"} server: ${
          err.message
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Request server verification
  const requestVerification = async () => {
    if (!server || !isServerOwner()) return;

    setActionLoading(true);

    try {
      const response = await verificationApi.requestVerification(id);
      setVerificationData(response.data);
      setShowVerificationPanel(true);
    } catch (err) {
      console.error("Failed to request verification:", err);
      alert(
        `Failed to request verification: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Add a function to handle verification completion
  const handleVerificationComplete = async (status) => {
    setVerificationStatus(status);
    setShowVerificationPanel(false);
    setShowVerificationStatus(true);

    // Refresh server data to update verification status
    try {
      const response = await serverApi.getServer(id);
      setServer(response.data);
    } catch (err) {
      console.error("Failed to refresh server data:", err);
    }
  };

  // Check if current user is the server owner
  const isServerOwner = () => {
    return currentUser && server && server.owner_email === currentUser.email;
  };

  // Format timestamp
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Format uptime as percentage
  const formatUptime = (uptime) => {
    if (uptime === undefined || uptime === null) return "N/A";
    return uptime.toFixed(2) + "%";
  };

  // Render rating stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={`full-${i}`}
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="#FFD700"
          stroke="#FFD700"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <svg
          key="half"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          stroke="#FFD700"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <linearGradient id="halfStar" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill="url(#halfStar)"
          />
        </svg>
      );
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="transparent"
          stroke="#FFD700"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }

    return stars;
  };

  // Handle server deletion
  const handleDeleteServer = async () => {
    if (!server || !isServerOwner()) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      await serverApi.deleteServer(id);
      setDeleteSuccess("Server deleted successfully");
      
      // Close the confirmation modal
      setShowDeleteConfirmation(false);
      
      // Wait a moment before redirecting to dashboard
      setTimeout(() => {
        navigate("/dashboard/servers");
      }, 1500);
    } catch (err) {
      console.error("Failed to delete server:", err);
      setDeleteError("Failed to delete server. Please try again.");
      setShowDeleteConfirmation(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-centered">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <ErrorMessage message={error} />
        <div className="error-actions">
          <Link to="/explorer" className="btn btn-primary">
            Back to Explorer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="server-detail">
      <div className="server-header-bg"></div>

      <div className="container">
        {deleteSuccess && (
          <div className="message success">{deleteSuccess}</div>
        )}
        {deleteError && (
          <div className="message error">{deleteError}</div>
        )}
        
        <div className="server-header">
          <div className="server-identity">
            {server.logo_url ? (
              <img
                src={server.logo_url}
                alt={server.name}
                className="server-logo"
              />
            ) : (
              <div
                className="server-icon"
                style={{ backgroundColor: "#3b82f6" }}
              >
                {server.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="server-name-container">
              <h1 className="server-name">{server.name}</h1>
              <p className="server-provider">by {server.provider}</p>
              <div className="server-meta">
                {server.verified && (
                  <span className="server-badge verified">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Verified
                  </span>
                )}
                <span className="server-type">
                  {Array.isArray(server.types)
                    ? server.types
                        .map(
                          (type) => type.charAt(0).toUpperCase() + type.slice(1)
                        )
                        .join(", ")
                    : server.type}
                </span>
                <span className="server-rating">
                  {renderStars(server.rating)}
                  <span className="rating-value">
                    ({server.rating.toFixed(1)})
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="server-actions">
            {/* Owner Actions for Editing and Management */}
            {isServerOwner() && (
              <div className="owner-actions">
                <button
                  className="btn btn-danger"
                  onClick={() => setShowDeleteConfirmation(true)}
                >
                  Delete
                </button>
                {!server.verified && (
                  <button
                    className="btn btn-primary"
                    onClick={requestVerification}
                    disabled={actionLoading}
                  >
                    Request Verification
                  </button>
                )}
                <Link
                  to={`/servers/${id}/edit`}
                  className="btn btn-outline"
                >
                  Edit Server
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="server-tabs">
          <div
            className={`server-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </div>
          <div
            className={`server-tab ${activeTab === "health" ? "active" : ""}`}
            onClick={() => setActiveTab("health")}
          >
            Health Checks
          </div>
          <div
            className={`server-tab ${activeTab === "ratings" ? "active" : ""}`}
            onClick={() => setActiveTab("ratings")}
          >
            Ratings
          </div>
        </div>

        <div className="server-content">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="overview-grid">
                <div className="overview-main">
                  <section className="content-section">
                    <h2 className="section-title">Description</h2>
                    <p className="server-description">{server.description}</p>
                  </section>

                  <section className="content-section">
                    <h2 className="section-title">Tags</h2>
                    <div className="server-tags">
                      {server.tags && server.tags.length > 0 ? (
                        server.tags.map((tag, index) => (
                          <span className="server-tag" key={index}>
                            {tag}
                          </span>
                        ))
                      ) : (
                        <p>No tags available</p>
                      )}
                    </div>
                  </section>
                </div>

                <div className="overview-sidebar">
                  <section className="content-section">
                    <h2 className="section-title">Server Information</h2>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="info-label">Server URL</span>
                        <a
                          href={server.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="info-value url"
                        >
                          {server.url}
                        </a>
                      </div>

                      {server.documentation_url && (
                        <div className="info-item">
                          <span className="info-label">Documentation</span>
                          <a
                            href={server.documentation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="info-value url"
                          >
                            {server.documentation_url}
                          </a>
                        </div>
                      )}

                      <div className="info-item">
                        <span className="info-label">Status</span>
                        <span
                          className={`server-status ${
                            server.is_active ? "active" : "inactive"
                          }`}
                        >
                          {server.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="info-item">
                        <span className="info-label">Uptime</span>
                        <span className="info-value">
                          {formatUptime(server.uptime)}
                        </span>
                      </div>

                      <div className="info-item">
                        <span className="info-label">Version</span>
                        <span className="info-value">
                          {server.version || "N/A"}
                        </span>
                      </div>

                      <div className="info-item">
                        <span className="info-label">Protocols</span>
                        <span className="info-value">
                          {server.protocols && server.protocols.length > 0
                            ? server.protocols.join(", ")
                            : "N/A"}
                        </span>
                      </div>

                      <div className="info-item">
                        <span className="info-label">Last Checked</span>
                        <span className="info-value">
                          {formatDate(server.last_checked)}
                        </span>
                      </div>

                      <div className="info-item">
                        <span className="info-label">Registered On</span>
                        <span className="info-value">
                          {formatDate(server.created_at)}
                        </span>
                      </div>
                    </div>
                  </section>

                  {server.usage_requirements && (
                    <section className="content-section">
                      <h2 className="section-title">Usage Requirements</h2>
                      <div className="info-list">
                        <div className="info-item">
                          <span className="info-label">Authentication</span>
                          <span className="info-value">
                            {server.usage_requirements.authentication_required
                              ? "Required"
                              : "Not Required"}
                          </span>
                        </div>

                        {server.usage_requirements.authentication_required && (
                          <div className="info-item">
                            <span className="info-label">Auth Type</span>
                            <span className="info-value">
                              {server.usage_requirements.authentication_type}
                            </span>
                          </div>
                        )}

                        {server.usage_requirements.rate_limits && (
                          <div className="info-item">
                            <span className="info-label">Rate Limits</span>
                            <span className="info-value">
                              {server.usage_requirements.rate_limits}
                            </span>
                          </div>
                        )}

                        {server.usage_requirements.pricing && (
                          <div className="info-item">
                            <span className="info-label">Pricing</span>
                            <span className="info-value">
                              {server.usage_requirements.pricing}
                            </span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "capabilities" && (
            <div className="capabilities-tab">
              {server.capabilities && server.capabilities.length > 0 ? (
                <div className="capabilities-grid">
                  {server.capabilities.map((capability, index) => (
                    <div className="capability-card" key={index}>
                      <h3 className="capability-name">{capability.name}</h3>
                      <p className="capability-description">
                        {capability.description}
                      </p>

                      <div className="capability-meta">
                        <span className="capability-type">
                          {capability.type.charAt(0).toUpperCase() +
                            capability.type.slice(1)}
                        </span>
                      </div>

                      {capability.parameters &&
                        capability.parameters.length > 0 && (
                          <div className="capability-parameters">
                            <h4 className="capability-section-title">
                              Parameters
                            </h4>
                            <table className="parameters-table">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Type</th>
                                  <th>Required</th>
                                  <th>Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {capability.parameters.map(
                                  (param, paramIndex) => (
                                    <tr key={paramIndex}>
                                      <td>{param.name}</td>
                                      <td>{param.type}</td>
                                      <td>{param.required ? "Yes" : "No"}</td>
                                      <td>{param.description}</td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                      {capability.examples &&
                        capability.examples.length > 0 && (
                          <div className="capability-examples">
                            <h4 className="capability-section-title">
                              Examples
                            </h4>
                            <div className="examples-list">
                              {capability.examples.map(
                                (example, exampleIndex) => (
                                  <div
                                    className="example-item"
                                    key={exampleIndex}
                                  >
                                    <pre className="example-code">
                                      {example}
                                    </pre>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No capabilities have been defined for this server.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "health" && (
            <div className="health-tab">
              {healthChecksLoading ? (
                <div className="loading-centered">
                  <LoadingSpinner />
                </div>
              ) : healthChecks.length > 0 ? (
                <div className="health-content">
                  <h2 className="health-title">Health Check History</h2>
                  <table className="health-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Response Time</th>
                        <th>Status Code</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {healthChecks.map((check, index) => (
                        <tr
                          key={index}
                          className={check.is_up ? "status-up" : "status-down"}
                        >
                          <td>{formatDate(check.created_at)}</td>
                          <td>
                            <span
                              className={`status-indicator ${
                                check.is_up ? "up" : "down"
                              }`}
                            >
                              {check.is_up ? "Up" : "Down"}
                            </span>
                          </td>
                          <td>{check.response_time.toFixed(3)}s</td>
                          <td>{check.status_code || "N/A"}</td>
                          <td>
                            {check.error_message ? (
                              <span className="error-message">
                                {check.error_message}
                              </span>
                            ) : (
                              <span className="check-details">
                                {check.details && check.details.check_type
                                  ? check.details.check_type
                                  : "Routine check"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No health check data available for this server.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "ratings" && (
            <div className="ratings-tab">
              <div className="ratings-header">
                <h2 className="ratings-title">User Ratings</h2>

                {currentUser && !showRatingForm && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowRatingForm(true)}
                  >
                    Rate this Server
                  </button>
                )}
              </div>

              {showRatingForm && (
                <div className="rating-form-container">
                  <h3>Submit Your Rating</h3>

                  {ratingError && (
                    <div className="error-message">{ratingError}</div>
                  )}

                  <form className="rating-form" onSubmit={submitRating}>
                    <div className="form-group">
                      <label>Your Rating</label>
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <label key={star} className="star-label">
                            <input
                              type="radio"
                              name="rating"
                              value={star}
                              checked={ratingData.rating === star}
                              onChange={handleRatingChange}
                            />
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill={
                                ratingData.rating >= star
                                  ? "#FFD700"
                                  : "transparent"
                              }
                              stroke="#FFD700"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="star-icon"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="review">Your Review (Optional)</label>
                      <textarea
                        id="review"
                        name="review"
                        value={ratingData.review}
                        onChange={handleRatingChange}
                        placeholder="Share your experience with this server..."
                        rows="4"
                      ></textarea>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setShowRatingForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={ratingSubmitting}
                      >
                        {ratingSubmitting ? "Submitting..." : "Submit Rating"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="ratings-summary">
                <div className="average-rating">
                  <span className="rating-number">
                    {server.rating.toFixed(1)}
                  </span>
                  <div className="rating-stars">
                    {renderStars(server.rating)}
                  </div>
                  <span className="rating-count">
                    Based on {ratings.length}{" "}
                    {ratings.length === 1 ? "rating" : "ratings"}
                  </span>
                </div>
              </div>

              <div className="ratings-list">
                {ratings.length > 0 ? (
                  ratings.map((rating, index) => (
                    <div className="rating-card" key={index}>
                      <div className="rating-header">
                        <div className="rating-stars-user">
                          {renderStars(rating.rating)}
                        </div>
                        <div className="rating-user-date">
                          <span className="rating-user">
                            {rating.user_email
                              ? rating.user_email.split("@")[0]
                              : "Anonymous User"}
                          </span>
                          <span className="rating-date">
                            {formatDate(rating.created_at)}
                          </span>
                        </div>
                      </div>
                      {rating.review && (
                        <div className="rating-review">{rating.review}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>
                      No ratings available for this server yet. Be the first to
                      rate!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {showVerificationPanel && verificationData && (
        <VerificationPanel
          verificationData={verificationData}
          serverId={id}
          onComplete={handleVerificationComplete}
          onClose={() => setShowVerificationPanel(false)}
        />
      )}

      {showVerificationStatus && verificationStatus && (
        <VerificationStatus
          status={verificationStatus}
          onClose={() => setShowVerificationStatus(false)}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
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
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteServer}
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

export default ServerDetailPage;
