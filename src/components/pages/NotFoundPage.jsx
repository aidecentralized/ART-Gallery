// src/components/pages/NotFoundPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-message">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Go to Homepage
          </Link>
          <Link to="/explorer" className="btn btn-outline">
            Explore Servers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
