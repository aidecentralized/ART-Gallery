import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <header>
      <div className="container header-inner">
        <Link to="/" className="logo">
          <div className="logo-icon">
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
              <path d="M18 10h-4V6"></path>
              <path d="M14 10 21 3"></path>
              <path d="M6 14h4v4"></path>
              <path d="M10 14 3 21"></path>
              <ellipse cx="12" cy="12" rx="10" ry="10"></ellipse>
            </svg>
          </div>
          MCP Nexus
        </Link>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/explorer">Explore</Link>
            </li>
            <li>
              <Link to="/registry">Registry</Link>
            </li>
            <li>
              <Link to="/documentation">Documentation</Link>
            </li>
            <li>
              <Link to="/community">Community</Link>
            </li>
          </ul>
        </nav>
        <div className="nav-buttons">
          <Link to="/signin" className="btn btn-outline">
            Sign In
          </Link>
          <Link to="/registry" className="btn btn-primary">
            Register MCP Server
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
