// src/components/pages/explorer/ExplorerPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { serverApi, discoveryApi } from "../../../api";
import ServerCard from "../../common/ServerCard";
import LoadingSpinner from "../../common/LoadingSpinner";
import ErrorMessage from "../../common/ErrorMessage";
import "./ExplorerPage.css";

const ExplorerPage = () => {
  // State for servers data
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTypes, setFilterTypes] = useState({
    agent: true,
    resource: true,
    tool: true,
  });
  const [filterVerified, setFilterVerified] = useState({
    verified: true,
    unverified: true,
  });
  const [activeTags, setActiveTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [sort, setSort] = useState("relevance");

  // State for pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 20,
    last_page: 1,
  });

  // Collect available tags from all servers
  useEffect(() => {
    if (servers.length > 0) {
      const tags = new Set();
      servers.forEach((server) => {
        if (Array.isArray(server.tags)) {
          server.tags.forEach((tag) => tags.add(tag));
        }
      });
      setAvailableTags(Array.from(tags));
    }
  }, [servers]);

  // Function to toggle a tag
  const toggleTag = (tag) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter((t) => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };

  // Function to build filter params
  const buildFilterParams = useCallback(() => {
    const params = {};

    // Add type filters
    const types = Object.keys(filterTypes).filter((key) => filterTypes[key]);
    if (types.length > 0 && types.length < 3) {
      params.types = types.join(",");
    }

    // Add verified filter
    if (filterVerified.verified && !filterVerified.unverified) {
      params.verified = true;
    } else if (!filterVerified.verified && filterVerified.unverified) {
      params.verified = false;
    }

    // Add tag filters
    if (activeTags.length > 0) {
      params.tags = activeTags.join(",");
    }

    return params;
  }, [filterTypes, filterVerified, activeTags]);

  // Function to handle search
  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      const filterParams = buildFilterParams();

      if (searchQuery.trim()) {
        // Use discovery search API
        response = await discoveryApi.searchServers(searchQuery, filterParams);
      } else {
        // Use regular server listing API
        response = await serverApi.getServers(filterParams);
      }

      setServers(response.data.data || response.data);

      // Update pagination if available
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching servers:", err);
      setError(err.message || "Failed to load servers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter servers based on active tab
  const getFilteredServers = () => {
    if (activeTab === "all") return servers;
    return servers.filter((server) => {
      // Handle both formats (array of types or single type property)
      if (Array.isArray(server.types)) {
        return server.types.some(
          (type) => type.toLowerCase() === activeTab.toLowerCase()
        );
      }
      return (
        server.type && server.type.toLowerCase() === activeTab.toLowerCase()
      );
    });
  };

  // Handle page change
  const changePage = async (page) => {
    setLoading(true);

    try {
      const filterParams = buildFilterParams();
      filterParams.page = page;

      let response;
      if (searchQuery.trim()) {
        response = await discoveryApi.searchServers(searchQuery, filterParams);
      } else {
        response = await serverApi.getServers(filterParams);
      }

      setServers(response.data.data || response.data);

      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error("Error changing page:", err);
      setError(err.message || "Failed to load servers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter reset
  const resetFilters = () => {
    setFilterTypes({
      agent: true,
      resource: true,
      tool: true,
    });
    setFilterVerified({
      verified: true,
      unverified: true,
    });
    setActiveTags([]);
    setSearchQuery("");
    setActiveTab("all");
    setSort("relevance");
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSort(e.target.value);

    // Sort the current servers list
    const sortedServers = [...servers];

    switch (e.target.value) {
      case "newest":
        sortedServers.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "highest_rating":
        sortedServers.sort((a, b) => b.rating - a.rating);
        break;
      case "name_asc":
        sortedServers.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "most_popular":
        sortedServers.sort(
          (a, b) => (b.usage_count || 0) - (a.usage_count || 0)
        );
        break;
      default:
        // For relevance, we'll rely on the API's ordering
        break;
    }

    setServers(sortedServers);
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
                    <input
                      type="checkbox"
                      id="type-agent"
                      checked={filterTypes.agent}
                      onChange={() =>
                        setFilterTypes({
                          ...filterTypes,
                          agent: !filterTypes.agent,
                        })
                      }
                    />
                    <label htmlFor="type-agent">Agent</label>
                  </li>
                  <li className="checkbox-item">
                    <input
                      type="checkbox"
                      id="type-resource"
                      checked={filterTypes.resource}
                      onChange={() =>
                        setFilterTypes({
                          ...filterTypes,
                          resource: !filterTypes.resource,
                        })
                      }
                    />
                    <label htmlFor="type-resource">Resource</label>
                  </li>
                  <li className="checkbox-item">
                    <input
                      type="checkbox"
                      id="type-tool"
                      checked={filterTypes.tool}
                      onChange={() =>
                        setFilterTypes({
                          ...filterTypes,
                          tool: !filterTypes.tool,
                        })
                      }
                    />
                    <label htmlFor="type-tool">Tool</label>
                  </li>
                </ul>
              </div>
              <div className="filter-group">
                <label className="filter-label">Verification Status</label>
                <ul className="checkbox-list">
                  <li className="checkbox-item">
                    <input
                      type="checkbox"
                      id="verified-yes"
                      checked={filterVerified.verified}
                      onChange={() =>
                        setFilterVerified({
                          ...filterVerified,
                          verified: !filterVerified.verified,
                        })
                      }
                    />
                    <label htmlFor="verified-yes">Verified</label>
                  </li>
                  <li className="checkbox-item">
                    <input
                      type="checkbox"
                      id="verified-no"
                      checked={filterVerified.unverified}
                      onChange={() =>
                        setFilterVerified({
                          ...filterVerified,
                          unverified: !filterVerified.unverified,
                        })
                      }
                    />
                    <label htmlFor="verified-no">Unverified</label>
                  </li>
                </ul>
              </div>
              <div className="filter-group">
                <label className="filter-label">Categories</label>
                <div className="tag-filters">
                  {availableTags.slice(0, 10).map((tag, index) => (
                    <div
                      key={index}
                      className={`tag-filter ${
                        activeTags.includes(tag) ? "active" : ""
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
              <button className="reset-filters" onClick={resetFilters}>
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button className="search-button" onClick={handleSearch}>
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
                  Showing {getFilteredServers().length} of{" "}
                  {pagination.total || servers.length} servers
                </div>
                <div className="results-sort">
                  <span className="results-sort-label">Sort by:</span>
                  <select
                    className="results-sort-select"
                    value={sort}
                    onChange={handleSortChange}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="most_popular">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="highest_rating">Highest Rating</option>
                    <option value="name_asc">A-Z</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="loading-container">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <ErrorMessage message={error} />
              ) : (
                <>
                  {getFilteredServers().length === 0 ? (
                    <div className="no-results">
                      <p>No servers found matching your criteria.</p>
                      <button className="btn" onClick={resetFilters}>
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="results-grid">
                      {getFilteredServers().map((server) => (
                        <ServerCard key={server.id} server={server} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {pagination.last_page > 1 && (
                <div className="pagination">
                  <ul className="pagination-list">
                    <li className="pagination-item">
                      <button
                        className="pagination-link"
                        disabled={pagination.current_page === 1}
                        onClick={() => changePage(pagination.current_page - 1)}
                      >
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
                      </button>
                    </li>

                    {/* First page */}
                    {pagination.current_page > 2 && (
                      <li className="pagination-item">
                        <button
                          className="pagination-link"
                          onClick={() => changePage(1)}
                        >
                          1
                        </button>
                      </li>
                    )}

                    {/* Ellipsis if needed */}
                    {pagination.current_page > 3 && (
                      <li className="pagination-item">
                        <div className="pagination-ellipsis">…</div>
                      </li>
                    )}

                    {/* Previous page if not on first page */}
                    {pagination.current_page > 1 && (
                      <li className="pagination-item">
                        <button
                          className="pagination-link"
                          onClick={() =>
                            changePage(pagination.current_page - 1)
                          }
                        >
                          {pagination.current_page - 1}
                        </button>
                      </li>
                    )}

                    {/* Current page */}
                    <li className="pagination-item">
                      <button className="pagination-link active">
                        {pagination.current_page}
                      </button>
                    </li>

                    {/* Next page if not on last page */}
                    {pagination.current_page < pagination.last_page && (
                      <li className="pagination-item">
                        <button
                          className="pagination-link"
                          onClick={() =>
                            changePage(pagination.current_page + 1)
                          }
                        >
                          {pagination.current_page + 1}
                        </button>
                      </li>
                    )}

                    {/* Ellipsis if needed */}
                    {pagination.current_page < pagination.last_page - 2 && (
                      <li className="pagination-item">
                        <div className="pagination-ellipsis">…</div>
                      </li>
                    )}

                    {/* Last page */}
                    {pagination.current_page < pagination.last_page - 1 && (
                      <li className="pagination-item">
                        <button
                          className="pagination-link"
                          onClick={() => changePage(pagination.last_page)}
                        >
                          {pagination.last_page}
                        </button>
                      </li>
                    )}

                    <li className="pagination-item">
                      <button
                        className="pagination-link"
                        disabled={
                          pagination.current_page === pagination.last_page
                        }
                        onClick={() => changePage(pagination.current_page + 1)}
                      >
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
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ExplorerPage;
