import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { serverApi } from "../../../api";
import { useAuth } from "../../../context/AuthContext";
import "../registry/RegistryPage.css";

// Create a global variable to store the server data as a last resort fallback
window.CURRENT_SERVER_DATA = null;

const EditServerPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate(); 
  const { id } = useParams();
  const location = useLocation();
  
  // Debug serverId and location
  console.log("EditServerPage - Debug Info:", {
    id,
    pathname: location.pathname,
    search: location.search,
    hash: location.hash
  });
  
  // Redirect if id is missing
  useEffect(() => {
    if (!id) {
      console.error("Server ID is missing, redirecting to dashboard");
      setError("Missing server ID. Redirecting to dashboard...");
      
      // Wait a moment before redirecting to show the error
      setTimeout(() => {
        navigate("/dashboard/servers");
      }, 2000);
    }
  }, [id, navigate]);
  
  // Loading and UI states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  
  // Server data state - this will be populated from the API
  const [initialData, setInitialData] = useState(null);
  const [formData, setFormData] = useState({
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
    usage_requirements: {
      authentication_required: false,
      authentication_type: "none",
      rate_limits: "",
      pricing: "",
    },
  });

  // Fetch server data on component mount
  useEffect(() => {
    async function fetchData() {
      if (!id) {
        console.error("Server ID is undefined, cannot fetch data");
        setError("Missing server ID. Please return to your servers list and try again.");
        setFetching(false);
        return;
      }
      
      if (!isAuthenticated) {
        return;
      }
      
      setFetching(true);
      setError(null);
      
      try {
        console.log(`Fetching server data for ID: ${id}`);
        const response = await serverApi.getServer(id);
        const serverData = response.data;
        
        console.log("✅ Server data received:", serverData);
        
        // Store the raw server data for comparison when saving
        setInitialData(serverData);
        
        // Format and set form data
        const formattedData = {
          name: serverData.name || "",
          slug: serverData.slug || "",
          description: serverData.description || "",
          provider: serverData.provider || "",
          url: serverData.url || "",
          documentation_url: serverData.documentation_url || "",
          contact_email: serverData.owner_email || serverData.contact_email || "",
          logo: serverData.logo_url || serverData.logo || null,
          types: serverData.types || [],
          tags: serverData.tags || [],
          usage_requirements: {
            authentication_required: Boolean(serverData.usage_requirements?.authentication_required),
            authentication_type: serverData.usage_requirements?.authentication_type || "none",
            rate_limits: serverData.usage_requirements?.rate_limits || "",
            pricing: serverData.usage_requirements?.pricing || ""
          },
        };
        
        console.log("Form data set to:", formattedData);
        setFormData(formattedData);
      } catch (err) {
        console.error("Failed to fetch server data:", err);
        setError("Could not load server data. Please try again or contact support.");
      } finally {
        setFetching(false);
      }
    }
    
    fetchData();
  }, [id, isAuthenticated]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/dashboard/servers");
    }
  }, [isAuthenticated, navigate]);

  // Handle input changes for text fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name.startsWith("type_")) {
        const serverType = name.replace("type_", "");
        const updatedTypes = checked
          ? [...formData.types, serverType]
          : formData.types.filter((type) => type !== serverType);

        setFormData((prev) => ({
          ...prev,
          types: updatedTypes,
        }));
      } else if (name === "auth_required") {
        setFormData((prev) => ({
          ...prev,
          usage_requirements: {
            ...prev.usage_requirements,
            authentication_required: checked,
          },
        }));
      }
    } else {
      // For regular text fields
      const nameParts = name.split('.');
      
      if (nameParts.length === 1) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      } else if (nameParts.length === 2 && nameParts[0] === 'usage_requirements') {
        // Handle nested usage_requirements fields
        setFormData((prev) => ({
          ...prev,
          usage_requirements: {
            ...prev.usage_requirements,
            [nameParts[1]]: value,
          },
        }));
      }
    }

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
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

      setFormData((prev) => ({
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

      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }

      setTagInput("");
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Server name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Server slug is required";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Server description is required";
    }

    if (!formData.provider.trim()) {
      newErrors.provider = "Provider name is required";
    }

    if (!formData.url.trim()) {
      newErrors.url = "Server URL is required";
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = "Please enter a valid URL";
    }

    if (
      formData.documentation_url &&
      !isValidUrl(formData.documentation_url)
    ) {
      newErrors.documentation_url = "Please enter a valid URL";
    }

    if (formData.types.length === 0) {
      newErrors.types = "Please select at least one server type";
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "Contact email is required";
    } else if (!isValidEmail(formData.contact_email)) {
      newErrors.contact_email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (!id) {
      setError("Missing server ID. Cannot update server.");
      return;
    }

    setLoading(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // Create payload with only changed fields
      const sanitizedData = {};
      
      
      // No need to compare with original data if it's not available
      if (!initialData) {
        setError("Cannot update server: original data not loaded.");
        setLoading(false);
        return;
      }
      
      // Compare with original data and only include changed fields
      if (formData.name !== initialData.name) sanitizedData.name = formData.name.trim();
      if (formData.slug !== initialData.slug) sanitizedData.slug = formData.slug.trim();
      if (formData.description !== initialData.description) sanitizedData.description = formData.description.trim();
      if (formData.provider !== initialData.provider) sanitizedData.provider = formData.provider.trim();
      if (formData.url !== initialData.url) sanitizedData.url = formData.url.trim();
      
      if (formData.documentation_url !== initialData.documentation_url) {
        sanitizedData.documentation_url = formData.documentation_url.trim() || null;
      }
      
      if (formData.contact_email !== (initialData.owner_email || initialData.contact_email)) {
        sanitizedData.contact_email = formData.contact_email.trim();
      }
      
      // Handle arrays
      if (JSON.stringify(formData.types) !== JSON.stringify(initialData.types)) {
        sanitizedData.types = formData.types.length ? formData.types : ["agent"];
      }
      
      if (JSON.stringify(formData.tags) !== JSON.stringify(initialData.tags)) {
        sanitizedData.tags = formData.tags || [];
      }
      
      // Handle nested usage_requirements
      const oldUsageReq = initialData.usage_requirements || {};
      const usageReqChanged = 
        formData.usage_requirements.authentication_required !== Boolean(oldUsageReq.authentication_required) ||
        formData.usage_requirements.authentication_type !== oldUsageReq.authentication_type ||
        formData.usage_requirements.rate_limits !== oldUsageReq.rate_limits ||
        formData.usage_requirements.pricing !== oldUsageReq.pricing;
      
      if (usageReqChanged) {
        sanitizedData.usage_requirements = {
          authentication_required: Boolean(formData.usage_requirements.authentication_required),
          authentication_type: formData.usage_requirements.authentication_type || "none",
          rate_limits: formData.usage_requirements.rate_limits?.trim() || "",
          pricing: formData.usage_requirements.pricing?.trim() || ""
        };
      }
      
      // Only include logo if it's a File object (has been changed)
      if (formData.logo instanceof File) {
        sanitizedData.logo = formData.logo;
      }
      
      // Only proceed if there are changes to submit
      if (Object.keys(sanitizedData).length === 0) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
        setLoading(false);
        return;
      }
      
      console.log("Updating server with:", sanitizedData);
      
      // Make the API call
      await serverApi.updateServer(id, sanitizedData);
      
      // Show success message
      setSaveSuccess(true);
  
      
      // Refresh the data
      const response = await serverApi.getServer(id);
      const updatedServerData = response.data;
      
      // Update initial data
      setInitialData(updatedServerData);
      
      // Update form data
      setFormData({
        name: updatedServerData.name || "",
        slug: updatedServerData.slug || "",
        description: updatedServerData.description || "",
        provider: updatedServerData.provider || "",
        url: updatedServerData.url || "",
        documentation_url: updatedServerData.documentation_url || "",
        contact_email: updatedServerData.owner_email || updatedServerData.contact_email || "",
        logo: updatedServerData.logo_url || updatedServerData.logo || null,
        types: updatedServerData.types || [],
        tags: updatedServerData.tags || [],
        usage_requirements: {
          authentication_required: Boolean(updatedServerData.usage_requirements?.authentication_required),
          authentication_type: updatedServerData.usage_requirements?.authentication_type || "none",
          rate_limits: updatedServerData.usage_requirements?.rate_limits || "",
          pricing: updatedServerData.usage_requirements?.pricing || ""
        },
      });

      // Navigate back to previous page 
      navigate(-1);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error("Failed to update server:", err);
      setError("Failed to update server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // For debugging
  console.log("RENDER STATE:", {
    fetching,
    formData,
    initialData,
    isAuthenticated
  });

  return (
    <div className="registry-container">
      <div className="container">
        <div className="registry-header">
          <h1>Edit MCP Server</h1>
          <p>Update your server details in the NANDA registry.</p>
          {initialData && (
            <div className="debug-info" style={{background: '#333', padding: '10px', marginTop: '10px', borderRadius: '5px'}}>
              <strong>Server: {initialData.name}</strong>
            </div>
          )}
        </div>

        {error && <div className="message error">{error}</div>}
        {saveSuccess && <div className="message success">Server updated successfully!</div>}
        {fetching && <div className="message info">Loading server data...</div>}

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
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "error" : ""}
                  placeholder="e.g., DataAnalyzer Pro"
                  disabled={fetching}
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="slug">Slug*</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={errors.slug ? "error" : ""}
                  placeholder="e.g., data-analyzer-pro"
                  disabled={fetching}
                />
                {errors.slug && <div className="error-message">{errors.slug}</div>}
                <div className="input-description">
                  The slug is used in the URL for your server and must be unique.
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description*</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={errors.description ? "error" : ""}
                  placeholder="e.g., A powerful data analysis tool"
                  disabled={fetching}
                ></textarea>
                {errors.description && <div className="error-message">{errors.description}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="provider">Provider*</label>
                <input
                  type="text"
                  id="provider"
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  className={errors.provider ? "error" : ""}
                  placeholder="e.g., DataAnalyzer Inc."
                  disabled={fetching}
                />
                {errors.provider && <div className="error-message">{errors.provider}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="url">Server URL*</label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className={errors.url ? "error" : ""}
                  placeholder="https://example.com/api/mcp"
                  disabled={fetching}
                />
                {errors.url && <div className="error-message">{errors.url}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="documentation_url">Documentation URL</label>
                <input
                  type="url"
                  id="documentation_url"
                  name="documentation_url"
                  value={formData.documentation_url}
                  onChange={handleChange}
                  className={errors.documentation_url ? "error" : ""}
                  placeholder="https://example.com/docs"
                  disabled={fetching}
                />
                {errors.documentation_url && (
                  <div className="error-message">{errors.documentation_url}</div>
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
                      checked={formData.types.includes("agent")}
                      onChange={handleChange}
                      disabled={fetching}
                    />
                    <label htmlFor="type_agent">ART Agent</label>
                  </div>
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      id="type_model"
                      name="type_model"
                      checked={formData.types.includes("model")}
                      onChange={handleChange}
                      disabled={fetching}
                    />
                    <label htmlFor="type_model">Foundation Model</label>
                  </div>
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      id="type_tool"
                      name="type_tool"
                      checked={formData.types.includes("tool")}
                      onChange={handleChange}
                      disabled={fetching}
                    />
                    <label htmlFor="type_tool">Tool Provider</label>
                  </div>
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      id="type_other"
                      name="type_other"
                      checked={formData.types.includes("other")}
                      onChange={handleChange}
                      disabled={fetching}
                    />
                    <label htmlFor="type_other">Other</label>
                  </div>
                </div>
                {errors.types && <div className="error-message">{errors.types}</div>}
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
                    disabled={fetching}
                  />
                  <div className="tags-list">
                    {formData.tags.map((tag) => (
                      <div className="tag" key={tag}>
                        <span>{tag}</span>
                        <button
                          type="button"
                          className="remove-tag"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                          disabled={fetching}
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
                  disabled={fetching}
                />
                {errors.logo && <div className="error-message">{errors.logo}</div>}
                <div className="input-description">
                  Maximum file size: 1MB. Accepted formats: JPG, PNG, SVG.
                </div>
                {typeof formData.logo === 'string' && (
                  <div className="current-logo">
                    <p>Current logo:</p>
                    <img 
                      src={formData.logo} 
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
                  value={formData.contact_email}
                  onChange={handleChange}
                  className={errors.contact_email ? "error" : ""}
                  placeholder="e.g., info@dataanalyzer.com"
                  disabled={fetching}
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
                    checked={formData.usage_requirements.authentication_required}
                    onChange={handleChange}
                    disabled={fetching}
                  />
                  <label htmlFor="auth_required">
                    Authentication Required
                  </label>
                </div>
              </div>

              {formData.usage_requirements.authentication_required && (
                <div className="form-group">
                  <label htmlFor="authentication_type">
                    Authentication Type
                  </label>
                  <select
                    id="authentication_type"
                    name="usage_requirements.authentication_type"
                    value={formData.usage_requirements.authentication_type}
                    onChange={handleChange}
                    disabled={fetching}
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
                  name="usage_requirements.rate_limits"
                  value={formData.usage_requirements.rate_limits}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe any rate limits that apply to your server"
                  disabled={fetching}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="pricing">Pricing</label>
                <textarea
                  id="pricing"
                  name="usage_requirements.pricing"
                  value={formData.usage_requirements.pricing}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe your pricing model or any costs associated with using your server"
                  disabled={fetching}
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(-1)}
                disabled={loading || fetching}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || fetching}
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