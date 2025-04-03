// src/components/common/ServerCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./ServerCard.css";

// Helper function to generate a color from a string
const generateColorFromString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#6366f1", // indigo
    "#8b5cf6", // purple
    "#ec4899", // pink
  ];

  return colors[Math.abs(hash) % colors.length];
};

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return "??";

  const words = name.split(/\s+/);
  if (words.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
};

const ServerCard = ({ server, compact = false }) => {
  // Extract server data, handling both our API format and dummy data format
  const {
    id,
    name,
    provider,
    description,
    rating = 0,
    uptime = "N/A",
    verified = false,
    types = [],
    tags = [],
    logo_url,
  } = server;

  // Determine server type (convert from array if needed)
  const type =
    Array.isArray(types) && types.length > 0
      ? types[0].charAt(0).toUpperCase() + types[0].slice(1)
      : server.type || "Unknown";

  // Generate background color and initials if no logo
  const iconBg = server.iconBg || generateColorFromString(name);
  const icon = server.icon || getInitials(name);

  // Format tags as needed
  const formattedTags = Array.isArray(tags) ? tags : server.tags || [];

  return (
    <div className={`server-card ${compact ? "compact" : ""}`}>
      <div className="server-header">
        {logo_url ? (
          <img src={logo_url} alt={name} className="server-logo" />
        ) : (
          <div className="server-icon" style={{ backgroundColor: iconBg }}>
            {icon}
          </div>
        )}
        <div>
          <h4 className="server-name">{name}</h4>
          <div className="server-provider">by {provider}</div>
        </div>
      </div>

      <div className="server-metadata">
        <span className="server-tag type">{type}</span>
        {formattedTags.slice(0, compact ? 1 : 3).map((tag, index) => (
          <span key={index} className="server-tag">
            {tag}
          </span>
        ))}
        {formattedTags.length > (compact ? 1 : 3) && (
          <span className="server-tag more">
            +{formattedTags.length - (compact ? 1 : 3)}
          </span>
        )}
      </div>

      {!compact && (
        <div className="server-info">
          {description && description.length > 150
            ? `${description.substring(0, 150)}...`
            : description}
        </div>
      )}

      <div className="server-footer">
        <Link to={`/servers/${id}`} className="server-connect">
          {compact ? "View" : "Details →"}
        </Link>

        <div className="server-stats">
          <span className="stat-item">{uptime} Uptime</span>
          <span className="stat-item">
            ★ {typeof rating === "number" ? rating.toFixed(1) : rating}
          </span>
          {verified && (
            <span className="verified-badge">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
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
        </div>
      </div>
    </div>
  );
};

export default ServerCard;
