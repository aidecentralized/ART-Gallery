// src/components/pages/home/HomePage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { serverApi, discoveryApi, analyticsApi } from "../../../api";
import ServerCard from "../../common/ServerCard";
import LoadingSpinner from "../../common/LoadingSpinner";
import "./HomePage.css";

const HomePage = () => {
  // State for featured servers and network stats
  const [featuredServers, setFeaturedServers] = useState([]);
  const [networkStats, setNetworkStats] = useState({
    totalServers: 0,
    monthlyRequests: 0,
    activeUsers: 0,
    countries: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch popular servers
        const popularResponse = await discoveryApi.getPopularServers(
          "month",
          3
        );
        setFeaturedServers(popularResponse.data.data || []);

        // Fetch network analytics
        try {
          const analyticsResponse = await analyticsApi.getNetworkAnalytics(
            "month"
          );
          const data = analyticsResponse.data;

          setNetworkStats({
            totalServers: data.metrics?.total_servers || 0,
            monthlyRequests: data.metrics?.total_requests || 0,
            activeUsers: data.metrics?.unique_clients || 0,
            countries: 75, // This might not be available from the API, using a placeholder
          });
        } catch (analyticsError) {
          console.error("Error fetching network analytics:", analyticsError);
          // Fallback to server count if analytics fail
          const serversResponse = await serverApi.getServers();
          const totalServers =
            serversResponse.data.pagination?.total ||
            serversResponse.data.length ||
            0;

          setNetworkStats({
            totalServers,
            monthlyRequests: 0,
            activeUsers: 0,
            countries: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle particles animation
  useEffect(() => {
    // Simple particle animation
    const particles = document.getElementById("particles");
    const particleCount = 30;

    if (particles) {
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        // Random position, size, and opacity
        const size = Math.random() * 10 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.opacity = Math.random() * 0.5 + 0.1;

        // Animation properties
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;

        particle.style.animation = `float ${duration}s ${delay}s infinite linear`;
        particles.appendChild(particle);
      }
    }

    // Animate flow lines between ART nodes
    const agent = document.querySelector(".agent-node");
    const resources = document.querySelector(".resources-node");
    const tools = document.querySelector(".tools-node");

    if (agent && resources && tools) {
      createFlowLine(agent, resources);
      createFlowLine(resources, tools);
      createFlowLine(agent, tools);
    }

    function createFlowLine(from, to) {
      const flowWrapper = document.querySelector(".art-flow");
      if (!flowWrapper) return;

      const line = document.createElement("div");
      line.classList.add("flow-line");

      // Get the positions relative to the parent
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();
      const parentRect = flowWrapper.getBoundingClientRect();

      const fromCenterX = fromRect.left + fromRect.width / 2 - parentRect.left;
      const fromCenterY = fromRect.top + fromRect.height / 2 - parentRect.top;
      const toCenterX = toRect.left + toRect.width / 2 - parentRect.left;
      const toCenterY = toRect.top + toRect.height / 2 - parentRect.top;

      // Calculate distance and angle
      const dx = toCenterX - fromCenterX;
      const dy = toCenterY - fromCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Position and rotate line
      line.style.width = `${distance}px`;
      line.style.left = `${fromCenterX}px`;
      line.style.top = `${fromCenterY}px`;
      line.style.transformOrigin = "0 0";
      line.style.transform = `rotate(${angle}deg)`;

      flowWrapper.appendChild(line);
    }

    // Cleanup function
    return () => {
      if (particles) {
        while (particles.firstChild) {
          particles.removeChild(particles.firstChild);
        }
      }

      const flowLines = document.querySelectorAll(".flow-line");
      flowLines.forEach((line) => line.remove());
    };
  }, []);

  // Helper function to format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M+";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K+";
    }
    return num.toString();
  };

  return (
    <>
      <section className="hero">
        <div className="particles" id="particles"></div>
        <div className="container hero-inner">
          <div className="hero-content">
            <h1 className="hero-title">
              The Open Registry for AI Communication
            </h1>
            <p className="hero-subtitle">
              Connect, discover, and integrate MCP servers in a truly
              decentralized network. Build the future of inter-agent
              communication without centralized gatekeepers.
            </p>
            <div className="hero-buttons">
              <Link to="/registry" className="btn btn-primary">
                Register Your MCP Server
              </Link>
              <Link to="/explorer" className="btn btn-outline">
                Explore Registry
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="/assets/images/network-visualization.svg"
              alt="MCP Nexus Network Visualization"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/600x400?text=MCP+Nexus+Network";
              }}
            />
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <h2 className="stats-title">Growing Decentralized Network</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">
                {formatNumber(networkStats.totalServers)}
              </div>
              <div className="stat-label">MCP Servers Registered</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {formatNumber(networkStats.monthlyRequests)}
              </div>
              <div className="stat-label">Monthly Requests</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {formatNumber(networkStats.activeUsers)}
              </div>
              <div className="stat-label">Active Developers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{networkStats.countries}+</div>
              <div className="stat-label">Countries Represented</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why MCP Nexus?</h2>
          <p className="section-subtitle">
            Build on a truly open protocol with no centralized control. Connect
            any Agent, Resource, or Tool through a standardized interface.
          </p>

          <div className="art-flow">
            <div className="art-node agent-node">Agents</div>
            <div className="art-node resources-node">Resources</div>
            <div className="art-node tools-node">Tools</div>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={
                <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
              }
              iconExtra={<polygon points="12 15 17 21 7 21 12 15"></polygon>}
              title="Decentralized Registry"
              description="Register and discover MCP servers in a fully decentralized network. No central authority controls access or visibility."
            />
            <FeatureCard
              icon={<circle cx="12" cy="12" r="10"></circle>}
              iconExtra={
                <>
                  <circle cx="12" cy="12" r="4"></circle>
                  <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                  <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                  <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                  <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                  <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
                </>
              }
              title="Advanced Discovery"
              description="Find the perfect ARTs for your AI applications with powerful semantic search and metadata filtering."
            />
            <FeatureCard
              icon={
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
              }
              title="Security & Trust"
              description="Built-in verification, ratings, and security monitoring for all registered MCP servers. Know what you're connecting to."
            />
            <FeatureCard
              icon={
                <>
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </>
              }
              title="Open Standards"
              description="Fully compatible with MCP protocol and other emerging standards for agent communication. No vendor lock-in."
            />
            <FeatureCard
              icon={
                <>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </>
              }
              title="Easy Integration"
              description="SDK and libraries for all major languages and frameworks. Connect to any MCP server with just a few lines of code."
            />
            <FeatureCard
              icon={
                <>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </>
              }
              title="Real-time Monitoring"
              description="Track performance, uptime, and usage patterns across the network. Get alerts when services go down."
            />
          </div>
        </div>
      </section>

      <section className="search-section">
        <div className="container">
          <h2 className="section-title">Discover MCP Servers</h2>
          <p className="section-subtitle">
            Search the decentralized registry for Agents, Resources, and Tools
          </p>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search for AI services, tools, or resources..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  window.location.href = `/explorer?q=${encodeURIComponent(
                    e.target.value
                  )}`;
                }
              }}
            />
            <button
              className="search-button"
              onClick={() => {
                const input = document.querySelector(".search-input");
                if (input && input.value) {
                  window.location.href = `/explorer?q=${encodeURIComponent(
                    input.value
                  )}`;
                } else {
                  window.location.href = "/explorer";
                }
              }}
            >
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

          <div className="featured-servers">
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
              Featured MCP Servers
            </h3>

            {loading ? (
              <div className="loading-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="server-grid">
                {featuredServers.length > 0 ? (
                  featuredServers.map((server) => (
                    <ServerCard key={server.id} server={server} />
                  ))
                ) : (
                  <div className="no-servers">
                    <p>No featured servers available at the moment.</p>
                    <Link to="/explorer" className="btn btn-primary">
                      Browse All Servers
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-inner">
          <h2 className="cta-title">Join the Decentralized Network Today</h2>
          <p className="cta-subtitle">
            Be part of building a truly open AI ecosystem. Register your MCP
            servers or start integrating with existing ones.
          </p>
          <div className="cta-buttons">
            <Link to="/registry" className="btn btn-white">
              Register MCP Server
            </Link>
            <Link to="/explorer" className="btn btn-white-outline">
              Explore Registry
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

// FeatureCard Component
const FeatureCard = ({ icon, iconExtra, title, description }) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">
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
          {icon}
          {iconExtra}
        </svg>
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

export default HomePage;
