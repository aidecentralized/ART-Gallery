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
                <img src="/assets/images/logo.svg" alt="NANDA" className="logo-image" />
                <span className="logo-text">NANDA</span>
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
                <NavLink
                  to="/docs"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Documentation
                </NavLink>
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
              <NavLink
                to="/docs"
                className={({ isActive }) =>
                  isActive ? "mobile-nav-link active" : "mobile-nav-link"
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Documentation
              </NavLink>

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
          <div className="footer-content">
              <Link to="/" className="footer-logo">
              <img src="/assets/images/logo.svg" alt="NANDA" className="footer-logo-image" />
              <span className="footer-logo-text">NANDA</span>
              </Link>
            <p className="footer-description">
              The revolutionary hub for MCP agents, empowering AI systems with a powerful registry 
              of decentralized tools, resources, and capabilities. Transforming how intelligence connects.
            </p>
          </div>
          <div className="copyright">
            &copy; {new Date().getFullYear()} NANDA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
