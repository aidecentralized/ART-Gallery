import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <Link to="/" className="footer-logo">
            NANDA
          </Link>
          <p className="footer-description">
            The revolutionary hub for MCP agents, empowering AI systems with a powerful registry 
            of decentralized tools, resources, and capabilities. Transforming how intelligence connects.
          </p>
        </div>
        <div className="copyright">
          &copy; 2025 NANDA. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
