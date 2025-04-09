import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverApi } from "../../../api";
import { useAuth } from "../../../context/AuthContext";
import "../registry/RegistryPage.css";

const EditServerPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { serverId } = useParams();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Server form state
  const [serverData, setServerData] = useState({
    name: "",
    slug: "",
    description: "",
    provider: "",
    url: "",
    documentation_url: "",
    types: [],
    tags: [],
    logo: null,
    contact_email: "",
    capabilities: [],
    usage_requirements: {
      authentication_required: false,
      authentication_type: "none",
      rate_limits: "",
      pricing: "",
    },
  });

  // Original server data for comparison
  const [originalData, setOriginalData] = useState(null);

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // Validation state
  const [errors, setErrors] = useState({});

  // Fetch server data
  useEffect(() => {
    const fetchServerData = async () => {
      setFetching(true);
      try {
        const response = await serverApi.getServer(serverId);
        const serverData = response.data;
        
        // Format data for the form
        const formattedData = {
          ...serverData,
          logo: serverData.logo || null,
          types: serverData.types || [],
          tags: serverData.tags || [],
          capabilities: serverData.capabilities || [],
          usage_requirements: {
            authentication_required: serverData.usage_requirements?.authentication_required || false,
            authentication_type: serverData.usage_requirements?.authentication_type || "none",
            rate_limits: serverData.usage_requirements?.rate_limits || "",
            pricing: serverData.usage_requirements?.pricing || "",
          },
        };
        
        setServerData(formattedData);
        setOriginalData(formattedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch server data:", err);
        setError("Failed to load server data. Please try again.");
      } finally {
        setFetching(false);
      }
    };

    if (serverId && isAuthenticated) {
      fetchServerData();
    }
  }, [serverId, isAuthenticated]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/dashboard/servers");
    }
  }, [isAuthenticated, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name.startsWith("type_")) {
        const serverType = name.replace("type_", "");
        const updatedTypes = checked
          ? [...serverData.types, serverType]
          : serverData.types.filter((type) => type !== serverType);

        setServerData((prev) => ({
          ...prev,
          types: updatedTypes,
        }));
      } else if (name.startsWith("auth_required")) {
        setServerData((prev) => ({
          ...prev,
          usage_requirements: {
            ...prev.usage_requirements,
            authentication_required: checked,
          },
        }));
      }
    } else {
      setServerData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        // 1MB limit
        setErrors((prev) => ({
          ...prev,
          logo: "File size exceeds 1MB",
        }));
        return;
      }

      if (!["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          logo: "File must be JPG, PNG, or SVG",
        }));
        return;
      }

      setServerData((prev) => ({
        ...prev,
        logo: file,
      }));

      // Clear error
      if (errors.logo) {
        setErrors((prev) => ({
          ...prev,
          logo: null,
        }));
      }
    }
  };

  // Handle tag input
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Add a tag
  const addTag = (e) => {
    if ((e.key === "Enter" || e.type === "blur") && tagInput.trim()) {
      e.preventDefault();

      const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");

      if (!serverData.tags.includes(newTag)) {
        setServerData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }

      setTagInput("");
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    setServerData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle authentication type change
  const handleAuthTypeChange = (e) => {
    setServerData((prev) => ({
      ...prev,
      usage_requirements: {
        ...prev.usage_requirements,
        authentication_type: e.target.value,
      },
    }));
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!serverData.name.trim()) {
      newErrors.name = "Server name is required";
    }

    if (!serverData.slug.trim()) {
      newErrors.slug = "Server slug is required";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(serverData.slug)) {
      newErrors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    if (!serverData.description.trim()) {
      newErrors.description = "Server description is required";
    }

    if (!serverData.provider.trim()) {
      newErrors.provider = "Provider name is required";
    }

    if (!serverData.url.trim()) {
      newErrors.url = "Server URL is required";
    } else if (!isValidUrl(serverData.url)) {
      newErrors.url = "Please enter a valid URL";
    }

    if (
      serverData.documentation_url &&
      !isValidUrl(serverData.documentation_url)
    ) {
      newErrors.documentation_url = "Please enter a valid URL";
    }

    if (serverData.types.length === 0) {
      newErrors.types = "Please select at least one server type";
    }

    if (!serverData.contact_email.trim()) {
      newErrors.contact_email = "Contact email is required";
    } else if (!isValidEmail(serverData.contact_email)) {
      newErrors.contact_email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // Sanitize data before sending to API
      const sanitizedData = {
        ...serverData,
        name: serverData.name.trim(),
        slug: serverData.slug.trim(),
        description: serverData.description.trim(),
        provider: serverData.provider.trim(),
        url: serverData.url.trim(),
        documentation_url: serverData.documentation_url.trim() || undefined,
        contact_email: serverData.contact_email.trim(),
        // Only include logo if it's a File object (has been changed)
        logo: serverData.logo instanceof File ? serverData.logo : undefined,
        // Ensure types is an array with at least one value
        types: serverData.types.length ? serverData.types : ["agent"],
        // Ensure tags is always an array
        tags: serverData.tags || [],
      };

      await serverApi.updateServer(serverId, sanitizedData);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to update server:", err);
      
      // Handle validation errors from the API
      if (err.response?.data) {
        const apiErrors = {};
        // Format API errors into our errors object
        Object.entries(err.response.data).forEach(([key, value]) => {
          apiErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        
        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
        } else {
          setError("Failed to update server. Please try again.");
        }
      } else {
        setError("Failed to update server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to validate email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Helper function to validate URL
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (fetching) {
    return (
      <div className="registry-container">
        <div className="container">
          <div className="enhanced-loading-indicator">
            <div className="loading-spinner-container">
              <div className="enhanced-loading-spinner"></div>
            </div>
            <h2 className="loading-title">Loading Server</h2>
            <p className="loading-description">Retrieving server data from the MCP Nexus...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registry-container">
      <div className="container">
        <div className="registry-header">
          <h1>Edit MCP Server</h1>
          <p>Update your server details in the MCP Nexus registry.</p>
        </div>

        {error && <div className="message error">{error}</div>}
        {saveSuccess && (
          <div className="message success">Server updated successfully!</div>
        )}

        <div className="registry-form-container">
          <form className="registry-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2 className="section-title">Basic Information</h2>

              <div className="form-group">
                <label htmlFor="name">Server Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={serverData.name}
                  onChange={handleChange}
                  className={errors.name ? "error" : ""}
                />
                {errors.name && (
                  <div className="error-message">{errors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="slug">Slug*</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={serverData.slug}
                  onChange={handleChange}
                  className={errors.slug ? "error" : ""}
                />
                {errors.slug && (
                  <div className="error-message">{errors.slug}</div>
                )}
                <div className="input-description">
                  The slug is used in the URL for your server and must be unique.
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description*</label>
                <textarea
                  id="description"
                  name="description"
                  value={serverData.description}
                  onChange={handleChange}
                  rows="4"
                  className={errors.description ? "error" : ""}
                ></textarea>
                {errors.description && (
                  <div className="error-message">{errors.description}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="provider">Provider*</label>
                <input
                  type="text"
                  id="provider"
                  name="provider"
                  value={serverData.provider}
                  onChange={handleChange}
                  className={errors.provider ? "error" : ""}
                />
                {errors.provider && (
                  <div className="error-message">{errors.provider}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="url">Server URL*</label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={serverData.url}
                  onChange={handleChange}
                  className={errors.url ? "error" : ""}
                  placeholder="https://example.com/api/mcp"
                />
                {errors.url && <div className="error-message">{errors.url}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="documentation_url">Documentation URL</label>
                <input
                  type="url"
                  id="documentation_url"
                  name="documentation_url"
                  value={serverData.documentation_url}
                  onChange={handleChange}
                  className={errors.documentation_url ? "error" : ""}
                  placeholder="https://example.com/docs"
                />
                {errors.documentation_url && (
                  <div className="error-message">
                    {errors.documentation_url}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Server Type*</label>
                <div className="checkbox-group">
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      id="type_agent"
                      name="type_agent"
                      checked={serverData.types.includes("agent")}
                      onChange={handleChange}
                    />
                    <label htmlFor="type_agent">ART Agent</label>
                  </div>
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      id="type_model"
                      name="type_model"
                      checked={serverData.types.includes("model")}
                      onChange={handleChange}
                    />
                    <label htmlFor="type_model">Foundation Model</label>
                  </div>
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      id="type_tool"
                      name="type_tool"
                      checked={serverData.types.includes("tool")}
                      onChange={handleChange}
                    />
                    <label htmlFor="type_tool">Tool Provider</label>
                  </div>
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      id="type_other"
                      name="type_other"
                      checked={serverData.types.includes("other")}
                      onChange={handleChange}
                    />
                    <label htmlFor="type_other">Other</label>
                  </div>
                </div>
                {errors.types && (
                  <div className="error-message">{errors.types}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <div className="tag-input-container">
                  <input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={addTag}
                    onBlur={addTag}
                    placeholder="Add a tag and press Enter"
                    className="tag-input"
                  />
                  <div className="tags-list">
                    {serverData.tags.map((tag) => (
                      <div className="tag" key={tag}>
                        <span>{tag}</span>
                        <button
                          type="button"
                          className="remove-tag"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="input-description">
                  Add keywords to help others discover your server. Press Enter to add each tag.
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="logo">Logo</label>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  onChange={handleLogoUpload}
                  accept="image/jpeg,image/png,image/svg+xml"
                  className={errors.logo ? "error" : ""}
                />
                {errors.logo && <div className="error-message">{errors.logo}</div>}
                <div className="input-description">
                  Maximum file size: 1MB. Accepted formats: JPG, PNG, SVG.
                </div>
                {serverData.logo && typeof serverData.logo === 'string' && (
                  <div className="current-logo">
                    <p>Current logo:</p>
                    <img 
                      src={serverData.logo} 
                      alt="Current server logo" 
                      style={{ maxWidth: '200px', maxHeight: '100px' }} 
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="contact_email">Contact Email*</label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={serverData.contact_email}
                  onChange={handleChange}
                  className={errors.contact_email ? "error" : ""}
                />
                {errors.contact_email && (
                  <div className="error-message">{errors.contact_email}</div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">Usage Requirements</h2>

              <div className="form-group">
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="auth_required"
                    name="auth_required"
                    checked={serverData.usage_requirements.authentication_required}
                    onChange={handleChange}
                  />
                  <label htmlFor="auth_required">
                    Authentication Required
                  </label>
                </div>
              </div>

              {serverData.usage_requirements.authentication_required && (
                <div className="form-group">
                  <label htmlFor="authentication_type">
                    Authentication Type
                  </label>
                  <select
                    id="authentication_type"
                    value={serverData.usage_requirements.authentication_type}
                    onChange={handleAuthTypeChange}
                  >
                    <option value="none">None</option>
                    <option value="api_key">API Key</option>
                    <option value="oauth">OAuth</option>
                    <option value="jwt">JWT</option>
                    <option value="basic">Basic Auth</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="rate_limits">Rate Limits</label>
                <textarea
                  id="rate_limits"
                  name="rate_limits"
                  value={serverData.usage_requirements.rate_limits}
                  onChange={(e) =>
                    setServerData((prev) => ({
                      ...prev,
                      usage_requirements: {
                        ...prev.usage_requirements,
                        rate_limits: e.target.value,
                      },
                    }))
                  }
                  rows="3"
                  placeholder="Describe any rate limits that apply to your server"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="pricing">Pricing</label>
                <textarea
                  id="pricing"
                  name="pricing"
                  value={serverData.usage_requirements.pricing}
                  onChange={(e) =>
                    setServerData((prev) => ({
                      ...prev,
                      usage_requirements: {
                        ...prev.usage_requirements,
                        pricing: e.target.value,
                      },
                    }))
                  }
                  rows="3"
                  placeholder="Describe your pricing model or any costs associated with using your server"
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditServerPage; 