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
    setActiveTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
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
  const handleSearch = useCallback(async () => {
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
  }, [searchQuery, buildFilterParams]);

  // Update search when filters change
  useEffect(() => {
    // Add a small delay to prevent too many API calls when changing multiple filters
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filterTypes, filterVerified, activeTags, searchQuery, handleSearch]);

  // Initial data fetch
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter servers based on active tab
  const filteredServers = useCallback(() => {
    // Apply type filters
    let filtered = servers;
    
    const selectedTypes = Object.entries(filterTypes)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => type);
      
    if (selectedTypes.length < Object.keys(filterTypes).length) {
      filtered = filtered.filter(server => {
        if (Array.isArray(server.types)) {
          return server.types.some(type => 
            selectedTypes.includes(type.toLowerCase())
          );
        }
        return server.type && selectedTypes.includes(server.type.toLowerCase());
      });
    }
    
    // Apply verification filters
    if (filterVerified.verified && !filterVerified.unverified) {
      filtered = filtered.filter(server => server.verified);
    } else if (!filterVerified.verified && filterVerified.unverified) {
      filtered = filtered.filter(server => !server.verified);
    }
    
    // Apply tag filters
    if (activeTags.length > 0) {
      filtered = filtered.filter(server => {
        if (!Array.isArray(server.tags)) return false;
        return activeTags.every(tag => server.tags.includes(tag));
      });
    }
    
    return filtered;
  }, [servers, filterTypes, filterVerified, activeTags]);

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

  // Get the filtered server list
  const displayedServers = filteredServers();

  return (
    <div className="explorer-page">
      <div className="container">
        <div className="explorer-hero">
          <h1 className="explorer-title">Explore NANDA Servers</h1>
          <p className="explorer-subtitle">
            Discover Agents, Resources, and Tools in the decentralized NANDA network.
          </p>
        </div>

        <div className="explorer-filters">
          <aside className="filter-sidebar">
            <h2 className="filters-title">Filters</h2>
            
            <div className="filter-group">
              <h3 className="filter-group-title">Server Type</h3>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filterTypes.agent}
                    onChange={() =>
                      setFilterTypes({
                        ...filterTypes,
                        agent: !filterTypes.agent,
                      })
                    }
                  />
                  <span className="filter-checkbox"></span>
                  Agent
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filterTypes.resource}
                    onChange={() =>
                      setFilterTypes({
                        ...filterTypes,
                        resource: !filterTypes.resource,
                      })
                    }
                  />
                  <span className="filter-checkbox"></span>
                  Resource
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filterTypes.tool}
                    onChange={() =>
                      setFilterTypes({
                        ...filterTypes,
                        tool: !filterTypes.tool,
                      })
                    }
                  />
                  <span className="filter-checkbox"></span>
                  Tool
                </label>
              </div>
            </div>

            <div className="filter-group">
              <h3 className="filter-group-title">Verification Status</h3>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filterVerified.verified}
                    onChange={() =>
                      setFilterVerified({
                        ...filterVerified,
                        verified: !filterVerified.verified,
                      })
                    }
                  />
                  <span className="filter-checkbox"></span>
                  Verified
                </label>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filterVerified.unverified}
                    onChange={() =>
                      setFilterVerified({
                        ...filterVerified,
                        unverified: !filterVerified.unverified,
                      })
                    }
                  />
                  <span className="filter-checkbox"></span>
                  Unverified
                </label>
              </div>
            </div>

            <div className="filter-group">
              <h3 className="filter-group-title">Categories</h3>
              <div className="filter-options">
                {availableTags.slice(0, 10).map((tag, index) => (
                  <label key={index} className="filter-option">
                    <input
                      type="checkbox"
                      checked={activeTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                    />
                    <span className="filter-checkbox"></span>
                    {tag}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="filter-actions">
              <button className="apply-filters-btn" onClick={handleSearch}>
                Apply Filters
              </button>
              <button className="reset-filters-btn" onClick={resetFilters}>
                Reset
              </button>
            </div>
          </aside>

          <div className="results-section">
            <div className="search-container">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}>
                <div className="search-wrapper">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search for servers, agents, or tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="search-button">
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
              </form>
            </div>

            {activeTags.length > 0 && (
              <div className="active-filters">
                {activeTags.map(tag => (
                  <span key={tag} className="filter-pill">
                    {tag}
                    <button
                      className="filter-pill-remove"
                      onClick={() => toggleTag(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="results-header">
              <div className="results-count">
                Showing {displayedServers.length} of{" "}
                {pagination.total || servers.length} servers
              </div>
              <select
                className="sort-select"
                value={sort}
                onChange={handleSortChange}
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {loading ? (
              <div className="loading-container">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <ErrorMessage message={error} />
            ) : (
              <>
                {displayedServers.length === 0 ? (
                  <div className="no-results">
                    <p>No servers found matching your criteria.</p>
                    <button className="btn" onClick={resetFilters}>
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="results-grid">
                    {displayedServers.map((server) => (
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
    </div>
  );
};

export default ExplorerPage;
