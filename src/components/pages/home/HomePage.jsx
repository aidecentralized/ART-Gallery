// src/components/pages/home/HomePage.jsx
import React, { useEffect, useState, useRef } from "react";
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
  const [animatedStats, setAnimatedStats] = useState({
    totalServers: 0,
    monthlyRequests: 0,
    activeUsers: 0,
    countries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0); // For highlighting features
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const heroRef = useRef(null);

  // Add scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      observer.observe(section);
    });

    return () => sections.forEach(section => observer.unobserve(section));
  }, []);

  // Cycle through features for highlighting
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animate numbers
  useEffect(() => {
    const duration = 2000; // 2 seconds animation
    const steps = 60; // 60 steps for smooth animation
    const interval = duration / steps;
    
    // Set placeholder values for demo purposes
    const targetStats = {
      totalServers: networkStats.totalServers || 1250,
      monthlyRequests: networkStats.monthlyRequests || 45000,
      activeUsers: networkStats.activeUsers || 3200,
      countries: networkStats.countries || 75,
    };

    let currentStep = 0;

    const timer = setInterval(() => {
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
        return;
      }

      const progress = easeOutQuart(currentStep / steps);
      
      setAnimatedStats({
        totalServers: Math.round(targetStats.totalServers * progress),
        monthlyRequests: Math.round(targetStats.monthlyRequests * progress),
        activeUsers: Math.round(targetStats.activeUsers * progress),
        countries: Math.round(targetStats.countries * progress),
      });

      currentStep++;
    }, interval);

    return () => clearInterval(timer);
  }, [networkStats]);

  // Easing function for smooth animation
  const easeOutQuart = (x) => {
    return 1 - Math.pow(1 - x, 4);
  };

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
            totalServers: totalServers || 1250,
            monthlyRequests: 45000,
            activeUsers: 3200,
            countries: 75,
          });
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
        // Set fallback stats for demo purposes
        setNetworkStats({
          totalServers: 1250,
          monthlyRequests: 45000,
          activeUsers: 3200,
          countries: 75,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle particles animation
  useEffect(() => {
    // Enhanced particle animation
    const particles = document.getElementById("particles");
    const particleCount = 50; // Increased particle count

    if (particles) {
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        // Random position, size, and opacity
        const size = Math.random() * 12 + 1;
        const isLarge = Math.random() > 0.8;
        
        particle.style.width = `${isLarge ? size * 2 : size}px`;
        particle.style.height = `${isLarge ? size * 2 : size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.opacity = Math.random() * 0.6 + 0.1;
        
        // Add glow effect to some particles
        if (isLarge) {
          particle.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
          particle.style.background = 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0) 100%)';
        }

        // Animation properties with more variation
        const duration = Math.random() * 30 + 10;
        const delay = Math.random() * 5;

        particle.style.animation = `float ${duration}s ${delay}s infinite`;
        particle.style.animationTimingFunction = Math.random() > 0.5 ? 'ease-in-out' : 'cubic-bezier(0.45, 0.05, 0.55, 0.95)';
        particles.appendChild(particle);
      }
    }

    // Dynamic flow lines between ART nodes
    const agent = document.querySelector(".agent-node");
    const resources = document.querySelector(".resources-node");
    const tools = document.querySelector(".tools-node");

    if (agent && resources && tools) {
      createFlowLine(agent, resources, 'pulse-blue');
      createFlowLine(resources, tools, 'pulse-green');
      createFlowLine(agent, tools, 'pulse-purple');
    }

    function createFlowLine(from, to, animationClass) {
      const flowWrapper = document.querySelector(".art-flow");
      if (!flowWrapper) return;

      const line = document.createElement("div");
      line.classList.add("flow-line", animationClass);

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
      
      // Add animated dot that travels along the line
      const dot = document.createElement("div");
      dot.classList.add("flow-dot");
      line.appendChild(dot);
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

  // Helper function for scroll to section
  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

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
      <section ref={heroRef} className="hero fade-in">
        <div className="particles" id="particles"></div>
        <div className="container hero-inner">
          <div className="hero-content slide-up">
            <h1 className="hero-title animate-gradient">
              The Open Registry for AI Communication
            </h1>
            <p className="hero-subtitle">
              Connect, discover, and integrate NANDA servers in a truly
              decentralized network. Build the future of inter-agent
              communication without centralized gatekeepers.
            </p>
            <div className="hero-buttons">
              <Link to="/registry" className="btn btn-primary pulse-button">
                Register Your NANDA Server
              </Link>
              <Link to="/explorer" className="btn btn-outline hover-glow">
                Explore Registry
              </Link>
            </div>
          </div>
          <div className="hero-image float-animation">
            <img
              src="/assets/images/network-visualization.png"
              alt="MCP Nexus Network Visualization"
              onError={(e) => {
                // Prevent infinite loops by checking if we're already using a fallback
                if (!e.target.src.includes('fallback')) {
                  // Use a data URI for a simple colored square as fallback
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%231a1a2e'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='white' text-anchor='middle' dominant-baseline='middle'%3ENetwork Visualization%3C/text%3E%3C/svg%3E";
                  e.target.onerror = null; // Prevent further error callbacks
                }
              }}
            />
          </div>
        </div>
      </section>

      <section ref={featuresRef} className="features">
        <div className="container">
          <h2 className="section-title slide-up">Why NANDA?</h2>
          <p className="section-subtitle slide-up-delayed">
            Build on a truly open protocol with no centralized control. Connect
            any Agent, Resource, or Tool through a standardized interface.
          </p>

          <div className="art-flow">
            <div className="art-node agent-node pulse-hover">Agents</div>
            <div className="art-node resources-node pulse-hover">Resources</div>
            <div className="art-node tools-node pulse-hover">Tools</div>
          </div>

          <div className="features-grid">
            <FeatureCard
              active={activeFeature === 0}
              icon={
                <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
              }
              iconExtra={<polygon points="12 15 17 21 7 21 12 15"></polygon>}
              title="Decentralized Registry"
              description="Register and discover NANDA servers in a fully decentralized network. No central authority controls access or visibility."
            />
            <FeatureCard
              active={activeFeature === 1}
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
              active={activeFeature === 2}
              icon={
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
              }
              title="Security & Trust"
              description="Built-in verification, ratings, and security monitoring for all registered NANDA servers. Know what you're connecting to."
            />
            <FeatureCard
              active={activeFeature === 3}
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
              active={activeFeature === 4}
              icon={
                <>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </>
              }
              title="Easy Integration"
              description="SDK and libraries for all major languages and frameworks. Connect to any NANDA server with just a few lines of code."
            />
            <FeatureCard
              active={activeFeature === 5}
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

      {/* <section className="search-section slide-up">
        <div className="container">
          <h2 className="section-title">Discover NANDA Servers</h2>
          <p className="section-subtitle">
            Search the decentralized registry for Agents, Resources, and Tools
          </p>

          <div className="search-container glow-hover">
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
              className="search-button pulse-on-hover"
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
        </div>
      </section> */}
      {/* <section className="search-section slide-up">
        <div className="container">
          <h2 className="section-title">Discover NANDA Servers</h2>
          <p className="section-subtitle">
            Browse the decentralized registry for Agents, Resources, and Tools
          </p>

          <div className="explorer-link-container">
            <a href="/explorer" className="explore-button pulse-on-hover">
              Go to Explorer
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="arrow-icon"
                style={{ marginLeft: '8px' }}
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </section> */}


      <section className="search-section slide-up">
        <div className="container">
          <h2 className="section-title">Discover NANDA Servers</h2>
          <p className="section-subtitle">
            Browse the decentralized registry for Agents, Resources, and Tools.
          </p>

          <div className="explore-button-wrapper">
            <a href="/explorer" className="btn btn-primary explore-link pulse-on-hover">
              Explore Now →
            </a>
          </div>
        </div>
      </section>



      {/* Featured servers */}
      {featuredServers.length > 0 && (
        <section className="featured slide-up">
          <div className="container">
            <h2 className="section-title">Featured Servers</h2>
            <p className="section-subtitle">
              Popular and highly-rated MCP servers in the network
            </p>

            <div className="featured-grid">
              {featuredServers.map((server) => (
                <ServerCard key={server.id} server={server} />
              ))}
            </div>

            <div className="featured-cta">
              <Link to="/explorer" className="btn btn-outline hover-glow">
                Explore All Servers
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="cta parallax-effect">
        <div className="container cta-inner">
          <h2 className="cta-title fade-in">Join the Decentralized Network Today</h2>
          <p className="cta-subtitle fade-in-delayed">
            Be part of building a truly open AI ecosystem. Register your MCP
            servers or start integrating with existing ones.
          </p>
          <div className="cta-buttons fade-in-delayed">
            <Link to="/registry" className="btn btn-white pulse-button">
              Register MCP Server
            </Link>
            <Link to="/explorer" className="btn btn-white-outline hover-glow">
              Explore Registry
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

// FeatureCard Component
const FeatureCard = ({ active, icon, iconExtra, title, description }) => {
  return (
    <div className={`feature-card hover-lift ${active ? 'feature-active' : ''}`}>
      <div className={`feature-icon ${active ? 'pulse' : ''}`}>
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
