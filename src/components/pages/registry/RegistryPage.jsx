import React from "react";
import { Link } from "react-router-dom";
import "./RegistryPage.css";

const RegistryPage = () => {
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
            <div className="step active">
              <div className="step-number">1</div>
              <div className="step-content">
                <div className="step-title">Basic Information</div>
                <div className="step-description">
                  Server details and contact
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <div className="step-title">ART Configuration</div>
                <div className="step-description">
                  Define capabilities and features
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <div className="step-title">Verification</div>
                <div className="step-description">
                  Prove ownership and functionality
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <div className="step-title">Review & Submit</div>
                <div className="step-description">
                  Finalize your registration
                </div>
              </div>
            </div>
          </div>
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
                    placeholder="e.g., DataAnalyzer Pro"
                  />
                  <p className="input-description">
                    This will be the primary display name in the registry.
                  </p>
                </div>
                <div className="form-group">
                  <label htmlFor="short_name">Short Name / Slug*</label>
                  <input
                    type="text"
                    id="short_name"
                    placeholder="e.g., data-analyzer-pro"
                  />
                  <p className="input-description">
                    Used for URLs and API references.
                  </p>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="description">Description*</label>
                  <textarea
                    id="description"
                    placeholder="Briefly describe what your MCP server does and what capabilities it offers..."
                  ></textarea>
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
                    placeholder="https://your-mcp-server.com/mcp"
                  />
                  <p className="input-description">
                    The full URL where your MCP server is accessible.
                  </p>
                </div>
                <div className="form-group">
                  <label htmlFor="documentation_url">Documentation URL</label>
                  <input
                    type="url"
                    id="documentation_url"
                    placeholder="https://docs.your-service.com"
                  />
                  <p className="input-description">
                    Link to API documentation or usage guides.
                  </p>
                </div>
                <div className="form-group">
                  <label htmlFor="provider_name">
                    Provider / Organization*
                  </label>
                  <input
                    type="text"
                    id="provider_name"
                    placeholder="Your company or organization name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact_email">Contact Email*</label>
                  <input
                    type="email"
                    id="contact_email"
                    placeholder="contact@your-organization.com"
                  />
                  <p className="input-description">
                    This will not be publicly displayed.
                  </p>
                </div>
                <div className="form-group full-width">
                  <label>Server Type*</label>
                  <div className="checkbox-group">
                    <div className="checkbox-wrapper">
                      <input type="checkbox" id="type_agent" />
                      <label htmlFor="type_agent">Agent</label>
                    </div>
                    <div className="checkbox-wrapper">
                      <input type="checkbox" id="type_resource" />
                      <label htmlFor="type_resource">Resource</label>
                    </div>
                    <div className="checkbox-wrapper">
                      <input type="checkbox" id="type_tool" />
                      <label htmlFor="type_tool">Tool</label>
                    </div>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="tags">Tags</label>
                  <div className="tag-input">
                    <div className="tag">
                      data-processing
                      <span className="tag-remove">×</span>
                    </div>
                    <div className="tag">
                      machine-learning
                      <span className="tag-remove">×</span>
                    </div>
                    <input type="text" placeholder="Add tags..." />
                  </div>
                  <p className="input-description">
                    Add keywords to help others discover your server.
                  </p>
                </div>
                <div className="form-group full-width">
                  <label>Server Logo</label>
                  <div className="upload-box">
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
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button className="btn btn-outline">Save as Draft</button>
              <button className="btn btn-primary btn-lg">
                Continue to ART Configuration
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RegistryPage;
