// src/components/layout/MainLayout.jsx
import React, { useState } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./MainLayout.css";

const MainLayout = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileMenuOpen(false);
  };

  return (
    <div className="layout">
      <header className="main-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <Link to="/" className="logo">
                <img src="/assets/images/logo.svg" alt="MCP Nexus" />
                <span className="logo-text">MCP Nexus</span>
              </Link>

              <nav className="desktop-nav">
                <NavLink
                  to="/explorer"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Explorer
                </NavLink>
                <NavLink
                  to="/registry"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Register Server
                </NavLink>
                <a href="#" className="nav-link">
                  Documentation
                </a>
              </nav>
            </div>

            <div className="header-right">
              {isAuthenticated ? (
                <div className="user-menu">
                  <button className="user-button" onClick={toggleProfileMenu}>
                    <div className="user-avatar">
                      {currentUser.first_name ? currentUser.first_name[0] : "U"}
                    </div>
                    <span className="user-name">
                      {currentUser.first_name || currentUser.email}
                    </span>
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
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {profileMenuOpen && (
                    <div className="profile-dropdown">
                      <div className="profile-header">
                        <div className="profile-name">
                          {currentUser.first_name} {currentUser.last_name}
                        </div>
                        <div className="profile-email">{currentUser.email}</div>
                      </div>
                      <div className="profile-links">
                        <Link
                          to="/dashboard"
                          className="profile-link"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/servers"
                          className="profile-link"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          My Servers
                        </Link>
                        <Link
                          to="/dashboard/profile"
                          className="profile-link"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          Account Settings
                        </Link>
                      </div>
                      <div className="profile-footer">
                        <button
                          className="logout-button"
                          onClick={handleLogout}
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn btn-outline">
                    Log In
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}

              <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {mobileMenuOpen ? (
                    <g>
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </g>
                  ) : (
                    <g>
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </g>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
            <nav className="mobile-nav">
              <NavLink
                to="/explorer"
                className={({ isActive }) =>
                  isActive ? "mobile-nav-link active" : "mobile-nav-link"
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Explorer
              </NavLink>
              <NavLink
                to="/registry"
                className={({ isActive }) =>
                  isActive ? "mobile-nav-link active" : "mobile-nav-link"
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Register Server
              </NavLink>
              <a
                href="#"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Documentation
              </a>

              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      isActive ? "mobile-nav-link active" : "mobile-nav-link"
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                  <button
                    className="mobile-nav-link logout"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      isActive ? "mobile-nav-link active" : "mobile-nav-link"
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      isActive ? "mobile-nav-link active" : "mobile-nav-link"
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="main-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <img src="/assets/images/logo.svg" alt="MCP Nexus" />
                <span className="footer-logo-text">MCP Nexus</span>
              </Link>
              <p className="footer-tagline">
                The open registry for AI communication
              </p>
            </div>

            <div className="footer-links-group">
              <h3 className="footer-title">Platform</h3>
              <ul className="footer-links">
                <li>
                  <Link to="/explorer">Explorer</Link>
                </li>
                <li>
                  <Link to="/registry">Register Server</Link>
                </li>
                <li>
                  <a href="#">API Documentation</a>
                </li>
                <li>
                  <a href="#">SDK & Libraries</a>
                </li>
              </ul>
            </div>

            <div className="footer-links-group">
              <h3 className="footer-title">Resources</h3>
              <ul className="footer-links">
                <li>
                  <a href="#">Documentation</a>
                </li>
                <li>
                  <a href="#">Tutorials</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Community</a>
                </li>
              </ul>
            </div>

            <div className="footer-links-group">
              <h3 className="footer-title">Company</h3>
              <ul className="footer-links">
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Team</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              &copy; {new Date().getFullYear()} MCP Nexus. All rights reserved.
            </div>
            <div className="footer-legal">
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
