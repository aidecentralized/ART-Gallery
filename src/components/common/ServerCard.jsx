import React from "react";
import { Link } from "react-router-dom";
import "./ServerCard.css";

const ServerCard = ({ server }) => {
  const {
    name,
    provider,
    iconBg,
    icon,
    type,
    tags,
    description,
    uptime,
    rating,
  } = server;

  return (
    <div className="server-card">
      <div className="server-header">
        <div className="server-icon" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
        <div>
          <h4 className="server-name">{name}</h4>
          <div className="server-provider">by {provider}</div>
        </div>
      </div>
      <div className="server-metadata">
        <span className="server-tag type">{type}</span>
        {tags.map((tag, index) => (
          <span key={index} className="server-tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="server-info">{description}</div>
      <div className="server-footer">
        <Link to="#" className="server-connect">
          Connect →
        </Link>
        <div className="server-stats">
          <span>{uptime} Uptime</span>
          <span>★ {rating}</span>
        </div>
      </div>
    </div>
  );
};

export default ServerCard;
