import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ExplorerPage.css";
import ServerCard from "../../common/ServerCard";

const ExplorerPage = () => {
  // Sample server data
  const [servers] = useState([
    {
      id: 1,
      name: "DataAnalyst Pro",
      provider: "QuantumData Labs",
      iconBg: "#3b82f6",
      icon: "DA",
      type: "Agent",
      tags: ["Data Analysis", "Analytics"],
      description:
        "Expert data analysis agent with advanced statistical tooling and visualization capabilities. Processes complex datasets and generates insights.",
      uptime: "99.8%",
      rating: "4.9",
      uses: "12.5K",
      verified: true,
    },
    {
      id: 2,
      name: "ComputerVision API",
      provider: "PixelSense.io",
      iconBg: "#ef4444",
      icon: "CV",
      type: "Tool",
      tags: ["Vision", "API"],
      description:
        "Advanced computer vision tools for object detection, scene understanding, and image generation. High-throughput API with broad framework support.",
      uptime: "99.9%",
      rating: "4.8",
      uses: "18.2K",
      verified: true,
    },
    {
      id: 3,
      name: "Knowledge Graph",
      provider: "GraphMinds",
      iconBg: "#10b981",
      icon: "KG",
      type: "Resource",
      tags: ["Knowledge", "Vector DB"],
      description:
        "Comprehensive knowledge graph with billions of connected entities and relationships. Optimized for semantic queries and complex reasoning.",
      uptime: "99.5%",
      rating: "4.7",
      uses: "9.7K",
      verified: true,
    },
    {
      id: 4,
      name: "MarkupLabs Audio",
      provider: "Audio.ai",
      iconBg: "#f59e0b",
      icon: "ML",
      type: "Tool",
      tags: ["Audio", "Media"],
      description:
        "Audio processing toolkit for speech recognition, audio classification, and music generation. Low latency with high accuracy on various audio sources.",
      uptime: "99.6%",
      rating: "4.6",
      uses: "7.2K",
      verified: true,
    },
    {
      id: 5,
      name: "FinPlan Agent",
      provider: "FinTechAI",
      iconBg: "#6366f1",
      icon: "FP",
      type: "Agent",
      tags: ["Finance", "Planning"],
      description:
        "Financial planning agent with portfolio optimization, risk assessment, and market analysis capabilities. Integrates with major financial data sources.",
      uptime: "99.7%",
      rating: "4.9",
      uses: "5.8K",
      verified: true,
    },
    {
      id: 6,
      name: "SmartCode Generator",
      provider: "DevAI Systems",
      iconBg: "#8b5cf6",
      icon: "SC",
      type: "Agent",
      tags: ["Coding", "Development"],
      description:
        "Advanced code generation agent supporting multiple programming languages. Specializes in translating natural language requirements into efficient, well-tested code.",
      uptime: "99.4%",
      rating: "4.8",
      uses: "14.3K",
      verified: true,
    },
  ]);

  // State for active pill tab
  const [activeTab, setActiveTab] = useState("all");

  // Filter functions
  const getFilteredServers = () => {
    if (activeTab === "all") return servers;
    return servers.filter(
      (server) => server.type.toLowerCase() === activeTab.toLowerCase()
    );
  };

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Explore MCP Servers</h1>
          <p className="page-subtitle">
            Discover Agents, Resources, and Tools in the decentralized MCP
            network.
          </p>
        </div>
      </section>
      <section className="main">
        <div className="container">
          <div className="pill-tabs">
            <div
              className={`pill-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Servers
            </div>
            <div
              className={`pill-tab ${activeTab === "agent" ? "active" : ""}`}
              onClick={() => setActiveTab("agent")}
            >
              Agents
            </div>
            <div
              className={`pill-tab ${activeTab === "resource" ? "active" : ""}`}
              onClick={() => setActiveTab("resource")}
            >
              Resources
            </div>
            <div
              className={`pill-tab ${activeTab === "tool" ? "active" : ""}`}
              onClick={() => setActiveTab("tool")}
            >
              Tools
            </div>
          </div>
          <div className="explorer">
            <aside className="filters">
              <h2 className="filters-title">Filters</h2>
              <div className="filter-group">
                <label className="filter-label">Server Type</label>
                <ul className="checkbox-list">
                  <li className="checkbox-item">
                    <input type="checkbox" id="type-agent" defaultChecked />
                    <label htmlFor="type-agent">Agent</label>
                    <span className="checkbox-count">(235)</span>
                  </li>
                  <li className="checkbox-item">
                    <input type="checkbox" id="type-resource" defaultChecked />
                    <label htmlFor="type-resource">Resource</label>
                    <span className="checkbox-count">(128)</span>
                  </li>
                  <li className="checkbox-item">
                    <input type="checkbox" id="type-tool" defaultChecked />
                    <label htmlFor="type-tool">Tool</label>
                    <span className="checkbox-count">(187)</span>
                  </li>
                </ul>
              </div>
              <div className="filter-group">
                <label className="filter-label">Verification Status</label>
                <ul className="checkbox-list">
                  <li className="checkbox-item">
                    <input type="checkbox" id="verified-yes" defaultChecked />
                    <label htmlFor="verified-yes">Verified</label>
                    <span className="checkbox-count">(312)</span>
                  </li>
                  <li className="checkbox-item">
                    <input type="checkbox" id="verified-no" defaultChecked />
                    <label htmlFor="verified-no">Unverified</label>
                    <span className="checkbox-count">(238)</span>
                  </li>
                </ul>
              </div>
              <div className="filter-group">
                <label className="filter-label">Categories</label>
                <div className="tag-filters">
                  <div className="tag-filter active">AI</div>
                  <div className="tag-filter">Data Processing</div>
                  <div className="tag-filter">Content</div>
                  <div className="tag-filter">Finance</div>
                  <div className="tag-filter">Analytics</div>
                  <div className="tag-filter">Knowledge</div>
                  <div className="tag-filter">Vision</div>
                  <div className="tag-filter">NLP</div>
                  <div className="tag-filter">Security</div>
                  <div className="tag-filter">API</div>
                  <div className="tag-filter">Media</div>
                </div>
              </div>
              <button className="reset-filters">
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
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                Reset all filters
              </button>
            </aside>
            <div className="results">
              <div className="search-container">
                <div className="search-box">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search for MCP servers..."
                  />
                  <button className="search-button">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="results-header">
                <div className="results-count">
                  Showing {getFilteredServers().length} of 550 servers
                </div>
                <div className="results-sort">
                  <span className="results-sort-label">Sort by:</span>
                  <select className="results-sort-select">
                    <option>Relevance</option>
                    <option>Most Popular</option>
                    <option>Newest</option>
                    <option>Highest Rating</option>
                    <option>A-Z</option>
                  </select>
                </div>
              </div>
              <div className="results-grid">
                {getFilteredServers().map((server) => (
                  <div className="server-card" key={server.id}>
                    <div className="server-header">
                      <div
                        className="server-icon"
                        style={{ backgroundColor: server.iconBg }}
                      >
                        {server.icon}
                      </div>
                      <div>
                        <a href="#" className="server-name">
                          {server.name}
                        </a>
                        <div className="server-provider">
                          by {server.provider}
                        </div>
                      </div>
                    </div>
                    <div className="server-metadata">
                      <span className="server-tag type">{server.type}</span>
                      {server.tags.map((tag, index) => (
                        <span className="server-tag" key={index}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="server-info">{server.description}</div>
                    <div className="server-stats">
                      <div className="server-stat">
                        <div className="stat-value">{server.uptime}</div>
                        <div className="stat-label">Uptime</div>
                      </div>
                      <div className="server-stat">
                        <div className="stat-value">{server.rating}</div>
                        <div className="stat-label">Rating</div>
                      </div>
                      <div className="server-stat">
                        <div className="stat-value">{server.uses}</div>
                        <div className="stat-label">Uses</div>
                      </div>
                    </div>
                    <div className="server-footer">
                      <a href="#" className="server-connect">
                        Details →
                      </a>
                      {server.verified && (
                        <div className="verified-badge">
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
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pagination">
                <ul className="pagination-list">
                  <li className="pagination-item">
                    <a href="#" className="pagination-link">
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
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </a>
                  </li>
                  <li className="pagination-item">
                    <a href="#" className="pagination-link active">
                      1
                    </a>
                  </li>
                  <li className="pagination-item">
                    <a href="#" className="pagination-link">
                      2
                    </a>
                  </li>
                  <li className="pagination-item">
                    <a href="#" className="pagination-link">
                      3
                    </a>
                  </li>
                  <li className="pagination-item">
                    <div className="pagination-ellipsis">…</div>
                  </li>
                  <li className="pagination-item">
                    <a href="#" className="pagination-link">
                      55
                    </a>
                  </li>
                  <li className="pagination-item">
                    <a href="#" className="pagination-link">
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
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ExplorerPage;
