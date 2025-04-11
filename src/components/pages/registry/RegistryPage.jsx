// src/components/pages/registry/RegistryPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { serverApi } from "../../../api";
import { useAuth } from "../../../context/AuthContext";
import "./RegistryPage.css";

const RegistryPage = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // Validation state
  const [errors, setErrors] = useState({});

  // Add state for terms agreement
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/registry");
    }
  }, [isAuthenticated, navigate]);

  // Set contact email from current user
  useEffect(() => {
    if (currentUser) {
      setServerData((prev) => ({
        ...prev,
        contact_email: currentUser.email,
        provider: currentUser.organization || "",
      }));
    }
  }, [currentUser]);

  // Generate slug from name
  useEffect(() => {
    if (serverData.name && !serverData.slug) {
      const slug = serverData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      setServerData((prev) => ({
        ...prev,
        slug,
      }));
    }
  }, [serverData.name]);

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

  // Handle terms agreement change
  const handleTermsChange = (e) => {
    setTermsAgreed(e.target.checked);
  };

  // Validate form
  const validateBasicInfo = () => {
    const newErrors = {};

    if (!serverData.name.trim()) {
      newErrors.name = "Server name is required";
    }

    if (!serverData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(serverData.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (!serverData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!serverData.provider.trim()) {
      newErrors.provider = "Provider is required";
    }

    if (!serverData.url.trim()) {
      newErrors.url = "Server URL is required";
    } else if (!/^https?:\/\//.test(serverData.url)) {
      newErrors.url = "URL must start with http:// or https://";
    }

    if (
      serverData.documentation_url &&
      !/^https?:\/\//.test(serverData.documentation_url)
    ) {
      newErrors.documentation_url = "URL must start with http:// or https://";
    }

    if (!serverData.contact_email.trim()) {
      newErrors.contact_email = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(serverData.contact_email)) {
      newErrors.contact_email = "Invalid email format";
    }

    // Make sure at least one server type is selected
    if (!serverData.types || serverData.types.length === 0) {
      newErrors.types = "At least one server type is required";
      
      // Ensure we have a default type if none is selected
      if (!serverData.types || serverData.types.length === 0) {
        setServerData((prev) => ({
          ...prev,
          types: ["agent"]  // Set default type to ensure API doesn't reject the request
        }));
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Proceed to next step
  const nextStep = () => {
    if (activeStep === 1) {
      if (validateBasicInfo()) {
        setActiveStep(2);
      }
    } else if (activeStep === 2) {
      // Validate ART configuration if needed
      setActiveStep(3);
    } else if (activeStep === 3) {
      // Validate verification if needed
      setActiveStep(4);
    }
  };

  // Go back to previous step
  const prevStep = () => {
    setActiveStep(activeStep - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check terms agreement
    if (!termsAgreed) {
      setError("You must agree to the terms before submitting");
      return;
    }

    // Final validation
    if (!validateBasicInfo()) {
      return;
    }

    // Ensure we have at least one server type before submitting
    if (!serverData.types || serverData.types.length === 0) {
      setServerData(prev => ({
        ...prev,
        types: ["agent"]
      }));
      // Small timeout to ensure state is updated before proceeding
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setLoading(true);
    setError(null);

    // Create a sanitized copy of the data to send
    const sanitizedData = {
      name: serverData.name.trim(),
      slug: serverData.slug.trim(),
      description: serverData.description.trim(),
      url: serverData.url.trim(),
      provider: serverData.provider.trim(),
      contact_email: serverData.contact_email.trim(),
      
      // Handle optional fields with reasonable defaults
      documentation_url: serverData.documentation_url ? serverData.documentation_url.trim() : "",
      
      // Ensure types is an array with at least one value
      types: serverData.types && serverData.types.length > 0 ? serverData.types : ["agent"],
      
      // Ensure tags is always an array
      tags: Array.isArray(serverData.tags) ? serverData.tags : [],
      
      // Only include logo if it's a valid file
      ...(serverData.logo instanceof File ? { logo: serverData.logo } : {}),
      
      // Set capabilities to an empty array
      capabilities: [],
      
      // Format usage requirements properly
      usage_requirements: {
        authentication_required: Boolean(serverData.usage_requirements?.authentication_required),
        authentication_type: serverData.usage_requirements?.authentication_type || "none",
        rate_limits: serverData.usage_requirements?.rate_limits?.trim() || "",
        pricing: serverData.usage_requirements?.pricing?.trim() || ""
      }
    };

    // Debug: log the server data being sent
    console.log("Submitting server data:", JSON.stringify(sanitizedData, null, 2));
    
    try {
      const response = await serverApi.registerServer(sanitizedData);
      console.log("Server registration successful:", response.data);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'success-overlay';
      successMessage.innerHTML = `
        <div class="success-modal">
          <div class="success-icon">✓</div>
          <h2>Server Registered Successfully!</h2>
          <p>Your MCP server "${serverData.name}" has been registered.</p>
          <p>Redirecting to dashboard...</p>
        </div>
      `;
      document.body.appendChild(successMessage);
      
      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard/servers');
      }, 2000);
    } catch (err) {
      console.error("Server registration failed:", err);
      
      // Enhanced error logging
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers
        }
      });

      // Log full validation error details
      if (err.response?.data?.code === 'validation_error') {
        console.error("VALIDATION ERROR DETAILS:", JSON.stringify(err.response?.data, null, 2));
        
        // Display validation errors in a more readable format
        let validationMessage = "Validation failed. The server reported these issues:";
        
        if (err.response?.data?.details) {
          const details = err.response.data.details;
          Object.keys(details).forEach(key => {
            validationMessage += `\n- ${key}: ${details[key]}`;
          });
          setError(validationMessage);
        } else {
          setError("Validation failed but the server didn't provide specific details.");
        }
      }
      // Handle specific validation errors from the API
      if (err.response?.data?.details) {
        setErrors(err.response.data.details);
        setError("Please fix the validation errors below.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401 || err.message === "Authentication required. Please log in.") {
        setError("You must be logged in to register a server. Please log in and try again.");
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login?redirect=/registry');
        }, 3000);
      } else if (err.response?.status === 400) {
        // More specific 400 Bad Request handling
        setError("The server rejected the registration. Please check that all required fields are filled correctly.");
      } else {
        setError(
          "Failed to register server. Please try again or contact support."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Save as draft
  const saveAsDraft = () => {
    // For now, just save to localStorage
    localStorage.setItem("server_draft", JSON.stringify(serverData));
    alert("Draft saved successfully!");
  };

  // Render the proper step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderARTConfigStep();
      case 3:
        return renderVerificationStep();
      case 4:
        return renderReviewStep();
      default:
        return renderBasicInfoStep();
    }
  };

  // Basic information step
  const renderBasicInfoStep = () => {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Basic Information</h2>
          <p className="card-subtitle">
            Provide essential details about your MCP server
          </p>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="server_name">Server Name*</label>
              <input
                type="text"
                id="server_name"
                name="name"
                value={serverData.name}
                onChange={handleChange}
                placeholder="e.g., DataAnalyzer Pro"
                className={errors.name ? "error" : ""}
              />
              {errors.name && (
                <div className="error-message">{errors.name}</div>
              )}
              <p className="input-description">
                This will be the primary display name in the registry.
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="short_name">Short Name / Slug*</label>
              <input
                type="text"
                id="short_name"
                name="slug"
                value={serverData.slug}
                onChange={handleChange}
                placeholder="e.g., data-analyzer-pro"
                className={errors.slug ? "error" : ""}
              />
              {errors.slug && (
                <div className="error-message">{errors.slug}</div>
              )}
              <p className="input-description">
                Used for URLs and API references.
              </p>
            </div>
            <div className="form-group full-width">
              <label htmlFor="description">Description*</label>
              <textarea
                id="description"
                name="description"
                value={serverData.description}
                onChange={handleChange}
                placeholder="Briefly describe what your MCP server does and what capabilities it offers..."
                className={errors.description ? "error" : ""}
              ></textarea>
              {errors.description && (
                <div className="error-message">{errors.description}</div>
              )}
              <p className="input-description">
                Clear, concise summary of your server's purpose and
                capabilities.
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="mcp_url">MCP Server URL*</label>
              <input
                type="url"
                id="mcp_url"
                name="url"
                value={serverData.url}
                onChange={handleChange}
                placeholder="https://your-mcp-server.com/mcp"
                className={errors.url ? "error" : ""}
              />
              {errors.url && <div className="error-message">{errors.url}</div>}
              <p className="input-description">
                The full URL where your MCP server is accessible.
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="documentation_url">Documentation URL</label>
              <input
                type="url"
                id="documentation_url"
                name="documentation_url"
                value={serverData.documentation_url}
                onChange={handleChange}
                placeholder="https://docs.your-service.com"
                className={errors.documentation_url ? "error" : ""}
              />
              {errors.documentation_url && (
                <div className="error-message">{errors.documentation_url}</div>
              )}
              <p className="input-description">
                Link to API documentation or usage guides.
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="provider_name">Provider / Organization*</label>
              <input
                type="text"
                id="provider_name"
                name="provider"
                value={serverData.provider}
                onChange={handleChange}
                placeholder="Your company or organization name"
                className={errors.provider ? "error" : ""}
              />
              {errors.provider && (
                <div className="error-message">{errors.provider}</div>
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
                placeholder="contact@your-organization.com"
                className={errors.contact_email ? "error" : ""}
              />
              {errors.contact_email && (
                <div className="error-message">{errors.contact_email}</div>
              )}
              <p className="input-description">
                This will not be publicly displayed.
              </p>
            </div>
            <div className="form-group full-width">
              <label>Server Type*</label>
              {errors.types && (
                <div className="error-message">{errors.types}</div>
              )}
              <div className="checkbox-group">
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="type_agent"
                    name="type_agent"
                    checked={serverData.types.includes("agent")}
                    onChange={handleChange}
                  />
                  <label htmlFor="type_agent">Agent</label>
                </div>
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="type_resource"
                    name="type_resource"
                    checked={serverData.types.includes("resource")}
                    onChange={handleChange}
                  />
                  <label htmlFor="type_resource">Resource</label>
                </div>
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="type_tool"
                    name="type_tool"
                    checked={serverData.types.includes("tool")}
                    onChange={handleChange}
                  />
                  <label htmlFor="type_tool">Tool</label>
                </div>
              </div>
            </div>
            <div className="form-group full-width">
              <label htmlFor="tags">Tags</label>
              <div className="tag-input">
                {serverData.tags.map((tag, index) => (
                  <div className="tag" key={index}>
                    {tag}
                    <span className="tag-remove" onClick={() => removeTag(tag)}>
                      ×
                    </span>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Add tags..."
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyPress={addTag}
                  onBlur={addTag}
                />
              </div>
              <p className="input-description">
                Add keywords to help others discover your server. Press Enter to
                add a tag.
              </p>
            </div>
            <div className="form-group full-width">
              <label>Server Logo</label>
              <div className="upload-box">
                {serverData.logo ? (
                  <div className="logo-preview">
                    <img
                      src={URL.createObjectURL(serverData.logo)}
                      alt="Logo preview"
                    />
                    <button
                      className="remove-logo"
                      onClick={() =>
                        setServerData((prev) => ({ ...prev, logo: null }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="logo-upload"
                      onChange={handleLogoUpload}
                      accept="image/jpeg, image/png, image/svg+xml"
                      style={{ display: "none" }}
                    />
                    <label htmlFor="logo-upload" className="upload-label">
                      <div className="upload-icon">
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
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      </div>
                      <div className="upload-text">Upload a logo</div>
                      <div className="upload-description">
                        PNG, JPG or SVG (max. 1MB)
                      </div>
                    </label>
                  </>
                )}
                {errors.logo && (
                  <div className="error-message">{errors.logo}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <button className="btn btn-outline" onClick={saveAsDraft}>
            Save as Draft
          </button>
          <button className="btn btn-primary btn-lg" onClick={nextStep}>
            Continue to ART Configuration
          </button>
        </div>
      </div>
    );
  };

  // ART Configuration step
  const renderARTConfigStep = () => {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">ART Configuration</h2>
          <p className="card-subtitle">
            Define Agents, Resources, and Tools capabilities
          </p>
        </div>
        <div className="card-body">
          <div className="section-header">
            <h3>Usage Requirements</h3>
            <p>Define how others can use your MCP server</p>
          </div>

          {/* Usage requirements form */}
          <div className="usage-requirements-form">
            <div className="form-group">
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="auth_required"
                  name="auth_required"
                  checked={
                    serverData.usage_requirements.authentication_required
                  }
                  onChange={handleChange}
                />
                <label htmlFor="auth_required">Authentication Required</label>
              </div>
            </div>

            {serverData.usage_requirements.authentication_required && (
              <div className="form-group">
                <label htmlFor="auth_type">Authentication Type</label>
                <select
                  id="auth_type"
                  value={serverData.usage_requirements.authentication_type}
                  onChange={handleAuthTypeChange}
                >
                  <option value="none">None</option>
                  <option value="api_key">API Key</option>
                  <option value="oauth2">OAuth 2.0</option>
                  <option value="jwt">JWT</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="rate_limits">Rate Limits</label>
              <input
                type="text"
                id="rate_limits"
                name="rate_limits"
                value={serverData.usage_requirements.rate_limits}
                onChange={(e) => {
                  setServerData((prev) => ({
                    ...prev,
                    usage_requirements: {
                      ...prev.usage_requirements,
                      rate_limits: e.target.value,
                    },
                  }));
                }}
                placeholder="e.g., 100 requests per minute"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pricing">Pricing</label>
              <input
                type="text"
                id="pricing"
                name="pricing"
                value={serverData.usage_requirements.pricing}
                onChange={(e) => {
                  setServerData((prev) => ({
                    ...prev,
                    usage_requirements: {
                      ...prev.usage_requirements,
                      pricing: e.target.value,
                    },
                  }));
                }}
                placeholder="e.g., Free tier: 1000 requests/day, Pro: $0.001/request"
              />
            </div>
          </div>
        </div>
        <div className="card-footer">
          <button className="btn btn-outline" onClick={prevStep}>
            Back to Basic Information
          </button>
          <button className="btn btn-primary btn-lg" onClick={nextStep}>
            Continue to Verification
          </button>
        </div>
      </div>
    );
  };

  // Verification step
  const renderVerificationStep = () => {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Server Verification</h2>
          <p className="card-subtitle">
            Verify ownership and capabilities of your MCP server
          </p>
        </div>
        <div className="card-body">
          <div className="verification-info">
            <h3>Why Verify Your Server?</h3>
            <p>
              Verification helps build trust with users and ensures your server
              meets the MCP protocol standards. Verified servers receive a badge
              and rank higher in search results.
            </p>

            <div className="verification-methods">
              <h3>Verification Methods</h3>
              <p>
                After registration, you can verify your server using one of
                these methods:
              </p>

              <div className="method-cards">
                <div className="method-card">
                  <div className="method-icon">
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
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  </div>
                  <h4>DNS Verification</h4>
                  <p>Add a TXT record to your domain to prove ownership</p>
                </div>

                <div className="method-card">
                  <div className="method-icon">
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <h4>File Verification</h4>
                  <p>Upload a verification file to your server</p>
                </div>

                <div className="method-card">
                  <div className="method-icon">
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
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                  </div>
                  <h4>Meta Tag Verification</h4>
                  <p>Add a meta tag to your server's homepage</p>
                </div>
              </div>
            </div>

            <div className="verification-checks">
              <h3>What We Verify</h3>
              <ul className="check-list">
                <li className="check-item">
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Server ownership</span>
                </li>
                <li className="check-item">
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Server health and response time</span>
                </li>
                <li className="check-item">
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Claimed capabilities are available</span>
                </li>
                <li className="check-item">
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Basic security assessment</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <button className="btn btn-outline" onClick={prevStep}>
            Back to ART Configuration
          </button>
          <button className="btn btn-primary btn-lg" onClick={nextStep}>
            Review & Submit
          </button>
        </div>
      </div>
    );
  };

  // Review step
  const renderReviewStep = () => {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Review & Submit</h2>
          <p className="card-subtitle">
            Review your server details before submitting
          </p>
        </div>
        <div className="card-body">
          {error && (
            <div className="error-alert">
              <p>{error}</p>
            </div>
          )}

          <div className="review-section">
            <h3>Basic Information</h3>
            <div className="review-details">
              <div className="review-item">
                <span className="review-label">Name:</span>
                <span className="review-value">{serverData.name}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Slug:</span>
                <span className="review-value">{serverData.slug}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Provider:</span>
                <span className="review-value">{serverData.provider}</span>
              </div>
              <div className="review-item">
                <span className="review-label">URL:</span>
                <span className="review-value">{serverData.url}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Documentation URL:</span>
                <span className="review-value">
                  {serverData.documentation_url || "None"}
                </span>
              </div>
              <div className="review-item">
                <span className="review-label">Types:</span>
                <span className="review-value">
                  {serverData.types.map((type) => (
                    <span className="review-type" key={type}>
                      {type}
                    </span>
                  ))}
                </span>
              </div>
              <div className="review-item">
                <span className="review-label">Tags:</span>
                <span className="review-value">
                  {serverData.tags.length > 0
                    ? serverData.tags.map((tag) => (
                        <span className="review-tag" key={tag}>
                          {tag}
                        </span>
                      ))
                    : "None"}
                </span>
              </div>
              <div className="review-item">
                <span className="review-label">Contact Email:</span>
                <span className="review-value">{serverData.contact_email}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Logo:</span>
                <span className="review-value">
                  {serverData.logo ? (
                    <img
                      src={URL.createObjectURL(serverData.logo)}
                      alt="Logo preview"
                      className="review-logo"
                    />
                  ) : (
                    "None"
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="review-section">
            <h3>Description</h3>
            <p className="review-description">{serverData.description}</p>
          </div>

          <div className="review-section">
            <h3>Usage Requirements</h3>
            <div className="review-details">
              <div className="review-item">
                <span className="review-label">Authentication Required:</span>
                <span className="review-value">
                  {serverData.usage_requirements.authentication_required
                    ? "Yes"
                    : "No"}
                </span>
              </div>
              {serverData.usage_requirements.authentication_required && (
                <div className="review-item">
                  <span className="review-label">Authentication Type:</span>
                  <span className="review-value">
                    {serverData.usage_requirements.authentication_type}
                  </span>
                </div>
              )}
              <div className="review-item">
                <span className="review-label">Rate Limits:</span>
                <span className="review-value">
                  {serverData.usage_requirements.rate_limits ||
                    "None specified"}
                </span>
              </div>
              <div className="review-item">
                <span className="review-label">Pricing:</span>
                <span className="review-value">
                  {serverData.usage_requirements.pricing || "None specified"}
                </span>
              </div>
            </div>
          </div>

          <div className="terms-agreement">
            <div className="checkbox-wrapper">
              <input 
                type="checkbox" 
                id="terms_agreement" 
                checked={termsAgreed}
                onChange={handleTermsChange}
              />
              <label htmlFor="terms_agreement">
                I confirm that the information provided is accurate and that I
                have the authority to register this MCP server.
              </label>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <button className="btn btn-outline" onClick={prevStep}>
            Back to Verification
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Register Server"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Register Your MCP Server</h1>
          <p className="page-subtitle">
            Join the decentralized registry and make your AI capabilities
            discoverable to developers worldwide. No central authority, just
            pure open connectivity.
          </p>
        </div>
      </section>
      <section className="registration-form">
        <div className="container">
          <div className="steps">
            <div className={`step ${activeStep >= 1 ? "active" : ""}`}>
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-title">Basic Information</div>
                <div className="step-description">
                  Server details and contact
                </div>
              </div>
            </div>
            <div className={`step ${activeStep >= 2 ? "active" : ""}`}>
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-title">ART Configuration</div>
                <div className="step-description">
                  Define capabilities and features
                </div>
              </div>
            </div>
            <div className={`step ${activeStep >= 3 ? "active" : ""}`}>
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-title">Verification</div>
                <div className="step-description">
                  Prove ownership and functionality
                </div>
              </div>
            </div>
            <div className={`step ${activeStep >= 4 ? "active" : ""}`}>
              <div className="step-number">4</div>
              <div className="step-content">
                <div className="step-title">Review & Submit</div>
                <div className="step-description">
                  Finalize your registration
                </div>
              </div>
            </div>
          </div>

          {renderStepContent()}
        </div>
      </section>
    </>
  );
};

export default RegistryPage;
