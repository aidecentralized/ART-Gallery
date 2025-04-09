import React from "react";
import "./DocsPage.css";

const DocsPage = () => {
  return (
    <div className="docs-container">
      <div className="docs-header">
        <div className="container">
          <h1 className="docs-title">MCP Server Documentation</h1>
          <p className="docs-subtitle">
            A comprehensive guide to building and registering Model Context Protocol servers
          </p>
        </div>
      </div>

      <div className="container">
        <div className="docs-content">
          <div className="docs-toc">
            <div className="toc-header">Table of Contents</div>
            <ul className="toc-links">
              <li><a href="#introduction">Introduction to MCP</a></li>
              <li><a href="#prerequisites">Prerequisites</a></li>
              <li><a href="#building">Building an MCP Server</a></li>
              <li><a href="#registration">Registering on NANDA</a></li>
              <li><a href="#verification">Server Verification Process</a></li>
              <li><a href="#best-practices">Best Practices</a></li>
              <li><a href="#resources">Additional Resources</a></li>
            </ul>
          </div>

          <div className="docs-main">
            <section id="introduction" className="docs-section">
              <h2 className="section-title">Introduction to MCP</h2>
              <div className="section-content">
                <p>
                  The <strong>Model Context Protocol (MCP)</strong> is a standardized protocol for communication between AI applications (clients) and tools or resources (servers). It enables AI models to access external data and functionality through a well-defined interface.
                </p>
                
                <div className="info-box">
                  <h3>MCP Core Primitives</h3>
                  <ul>
                    <li><strong>Tools:</strong> Functions the AI model can call</li>
                    <li><strong>Resources:</strong> Data the client application can access</li>
                    <li><strong>Prompts:</strong> Templates for user interaction</li>
                  </ul>
                </div>
                
                <p>
                  MCP servers enable AI systems to extend their capabilities beyond what's available in their training data. By implementing the MCP protocol, your server can provide specialized tools and resources to AI models, allowing them to perform tasks like retrieving real-time data, running calculations, or accessing proprietary information.
                </p>
                
                <div className="image-container">
                  <img src="/assets/images/mcp-image.webp" alt="MCP Architecture" className="docs-image" />
                  <span className="image-caption">Figure 1: Model Context Protocol Architecture</span>
                </div>
              </div>
            </section>

            <section id="prerequisites" className="docs-section">
              <h2 className="section-title">Prerequisites</h2>
              <div className="section-content">
                <p>Before you begin building an MCP server, ensure you have:</p>
                
                <ul className="requirements-list">
                  <li>
                    <span className="requirement-icon">✓</span>
                    <div>
                      <strong>Programming Knowledge:</strong> Familiarity with Python, JavaScript, or another server-side language
                    </div>
                  </li>
                  <li>
                    <span className="requirement-icon">✓</span>
                    <div>
                      <strong>API Understanding:</strong> Knowledge of RESTful APIs or Server-Sent Events (SSE)
                    </div>
                  </li>
                  <li>
                    <span className="requirement-icon">✓</span>
                    <div>
                      <strong>Development Environment:</strong> Node.js (v14+) or Python (v3.9+)
                    </div>
                  </li>
                  <li>
                    <span className="requirement-icon">✓</span>
                    <div>
                      <strong>Server Hosting:</strong> A platform to host your server (e.g., AWS, Vercel, Heroku)
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <section id="building" className="docs-section">
              <h2 className="section-title">Building an MCP Server</h2>
              <div className="section-content">
                <h3 className="subsection-title">Basic Server Architecture</h3>
                <p>
                  An MCP server consists of several key components:
                </p>
                
                <div className="architecture-diagram">
                  <div className="architecture-item">
                    <div className="architecture-icon">🔌</div>
                    <div className="architecture-details">
                      <strong>Transport Layer</strong>
                      <span>SSE or WebSockets for real-time communication</span>
                    </div>
                  </div>
                  <div className="architecture-item">
                    <div className="architecture-icon">🛠️</div>
                    <div className="architecture-details">
                      <strong>Tool Implementations</strong>
                      <span>Functions that provide capabilities to AI models</span>
                    </div>
                  </div>
                  <div className="architecture-item">
                    <div className="architecture-icon">📊</div>
                    <div className="architecture-details">
                      <strong>Resource Providers</strong>
                      <span>Data sources accessible to client applications</span>
                    </div>
                  </div>
                  <div className="architecture-item">
                    <div className="architecture-icon">📝</div>
                    <div className="architecture-details">
                      <strong>Prompt Templates</strong>
                      <span>Structured interaction patterns</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="subsection-title">Implementation Steps</h3>
                
                <div className="step-container">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Set Up Your Project</h4>
                    <div className="code-block">
                      <pre><code>mkdir my-mcp-server
cd my-mcp-server
npm init -y  # For JavaScript
# OR
python -m venv venv  # For Python
source venv/bin/activate</code></pre>
                    </div>
                  </div>
                </div>
                
                <div className="step-container">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Install Dependencies</h4>
                    <div className="code-block">
                      <pre><code># For JavaScript
npm install @modelcontextprotocol/mcp-server express cors

# For Python
pip install mcp uvicorn starlette httpx</code></pre>
                    </div>
                  </div>
                </div>
                
                <div className="step-container">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Create Server Structure</h4>
                    <p>Basic server implementation in Python:</p>
                    <div className="code-block">
                      <pre>{`from mcp.server.fastmcp import FastMCP
from starlette.applications import Starlette
from mcp.server.sse import SseServerTransport
from starlette.requests import Request
from starlette.routing import Mount, Route
import uvicorn

# Initialize FastMCP server
mcp = FastMCP("my-company-api")

# Define a tool
@mcp.tool()
async def get_weather(latitude: float, longitude: float) -> str:
    """Get the weather forecast for a location.
    
    Args:
        latitude: The latitude coordinate
        longitude: The longitude coordinate
        
    Returns:
        A string containing the weather forecast
    """
    # Implement API call to weather service
    return f"Weather forecast for {latitude}, {longitude}: Sunny, 25°C"

# Create SSE transport
def create_app():
    sse = SseServerTransport("/messages/")
    
    async def handle_sse(request: Request):
        async with sse.connect_sse(request.scope, request.receive, request._send) as (read, write):
            await mcp._mcp_server.run(read, write, mcp._mcp_server.create_initialization_options())
    
    return Starlette(
        routes=[
            Route("/sse", endpoint=handle_sse),
            Mount("/messages/", app=sse.handle_post_message),
        ],
    )

if __name__ == "__main__":
    app = create_app()
    uvicorn.run(app, host="0.0.0.0", port=8080)`}</pre>
                    </div>
                  </div>
                </div>
                
                <div className="step-container">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Test Your Server</h4>
                    <p>Use the MCP Inspector to test your implementation:</p>
                    <div className="code-block">
                      <pre><code>npx @modelcontextprotocol/inspector

&gt; connect sse http://localhost:8080/sse
&gt; list tools
&gt; call get_weather --latitude 37.7749 --longitude -122.4194</code></pre>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="registration" className="docs-section">
              <h2 className="section-title">Registering on NANDA</h2>
              <div className="section-content">
                <p>To make your MCP server available to AI models, you need to register it with NANDA, the central registry for MCP servers.</p>
                
                <h3 className="subsection-title">Creating a NANDA Account</h3>
                
                <div className="registration-steps">
                  <div className="registration-step">
                    <div className="step-number">1</div>
                    <div className="step-details">
                      <h4>Sign Up</h4>
                      <p>Visit the NANDA registration page and click "Sign Up" to create a new account.</p>
                    </div>
                  </div>
                  
                  <div className="registration-step">
                    <div className="step-number">2</div>
                    <div className="step-details">
                      <h4>Complete Your Profile</h4>
                      <p>Fill in your personal and organization details. This information helps us verify your identity and server ownership.</p>
                      <ul className="profile-fields">
                        <li>First Name & Last Name</li>
                        <li>Email Address (for verification)</li>
                        <li>Password (min. 8 characters)</li>
                        <li>Organization Name</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="registration-step">
                    <div className="step-number">3</div>
                    <div className="step-details">
                      <h4>Verify Email</h4>
                      <p>Check your inbox for a verification email from NANDA. Click the link to verify your account.</p>
                      <div className="note-box">
                        <strong>Note:</strong> If you don't see the email, check your spam folder or request a new verification email.
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="subsection-title">Registering Your MCP Server</h3>
                
                <div className="registration-steps">
                  <div className="registration-step">
                    <div className="step-number">1</div>
                    <div className="step-details">
                      <h4>Access Server Registration</h4>
                      <p>Log in to your NANDA account and navigate to "Register Server" in the main navigation.</p>
                    </div>
                  </div>
                  
                  <div className="registration-step">
                    <div className="step-number">2</div>
                    <div className="step-details">
                      <h4>Enter Server Details</h4>
                      <p>Complete the server registration form with the following information:</p>
                      <div className="server-form-fields">
                        <div className="form-field">
                          <span className="field-name">Name:</span>
                          <span className="field-desc">A descriptive name for your server</span>
                        </div>
                        <div className="form-field">
                          <span className="field-name">Slug:</span>
                          <span className="field-desc">A unique URL-friendly identifier</span>
                        </div>
                        <div className="form-field">
                          <span className="field-name">Description:</span>
                          <span className="field-desc">Detailed explanation of your server's purpose and capabilities</span>
                        </div>
                        <div className="form-field">
                          <span className="field-name">Provider:</span>
                          <span className="field-desc">Your organization or personal name</span>
                        </div>
                        <div className="form-field">
                          <span className="field-name">URL:</span>
                          <span className="field-desc">The SSE endpoint URL of your MCP server</span>
                        </div>
                        <div className="form-field">
                          <span className="field-name">Documentation URL:</span>
                          <span className="field-desc">(Optional) Link to additional documentation</span>
                        </div>
                        <div className="form-field">
                          <span className="field-name">Types:</span>
                          <span className="field-desc">Server type (e.g., agent, resource, tool)</span>
                        </div>
                        <div className="form-field">
                          <span className="field-name">Tags:</span>
                          <span className="field-desc">Relevant keywords to help users find your server</span>
                        </div>
                        <div className="form-field">
                          <span className="field-name">Logo:</span>
                          <span className="field-desc">(Optional) An image representing your server</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="registration-step">
                    <div className="step-number">3</div>
                    <div className="step-details">
                      <h4>Submit Registration</h4>
                      <p>Review your information and click "Register Server" to submit your registration. Your server will be added to the NANDA directory once approved.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="verification" className="docs-section">
              <h2 className="section-title">Server Verification Process</h2>
              <div className="section-content">
                <p>To ensure quality and security in the MCP ecosystem, NANDA implements a verification process for all registered servers.</p>
                
                <div className="verification-methods">
                  <h3 className="subsection-title">Verification Methods</h3>
                  <p>To verify your server ownership, you must choose one of the following verification methods:</p>
                  
                  <div className="method-cards">
                    <div className="method-card">
                      <div className="method-icon">🔗</div>
                      <h4>DNS Verification</h4>
                      <p>Add a TXT record to your domain with the name '_mcp-verification' and the provided verification value.</p>
                      <div className="code-block">
                        <pre><code>Record Type: TXT
Name: _mcp-verification
Value: [your verification token]</code></pre>
                      </div>
                    </div>
                    
                    <div className="method-card">
                      <div className="method-icon">📄</div>
                      <h4>File Verification</h4>
                      <p>Create a verification file at your server URL with the provided content.</p>
                      <div className="code-block">
                        <pre><code>File Path: /mcp-verification.txt
Content: [your verification token]</code></pre>
                      </div>
                    </div>
                    
                    <div className="method-card">
                      <div className="method-icon">🏷️</div>
                      <h4>Meta Tag Verification</h4>
                      <p>Add a meta tag to your server's homepage with the verification content.</p>
                      <div className="code-block">
                        <pre><code>&lt;meta 
  name='mcp-verification'
  content='[your verification token]'
&gt;</code></pre>
                      </div>
                    </div>
                  </div>
                  
                  <div className="note-box warning">
                    <strong>Important:</strong> Verification is required for servers to be listed in the public directory and accessible to AI models through NANDA. You will receive a unique verification token when requesting verification.
                  </div>
                </div>
              </div>
            </section>

            <section id="best-practices" className="docs-section">
              <h2 className="section-title">Best Practices</h2>
              <div className="section-content">
                <div className="best-practices-grid">
                  <div className="practice-card">
                    <h4>📝 Documentation</h4>
                    <p>Provide clear documentation for all tools and resources, including parameter descriptions and usage examples.</p>
                  </div>
                  
                  <div className="practice-card">
                    <h4>⚡ Performance</h4>
                    <p>Optimize response times and implement proper caching to ensure your server remains responsive.</p>
                  </div>
                  
                  <div className="practice-card">
                    <h4>🔒 Security</h4>
                    <p>Use HTTPS, implement rate limiting, and validate all inputs to protect your server and users.</p>
                  </div>
                  
                  <div className="practice-card">
                    <h4>🔄 Versioning</h4>
                    <p>Use semantic versioning for your API and maintain backward compatibility when possible.</p>
                  </div>
                  
                  <div className="practice-card">
                    <h4>🔍 Monitoring</h4>
                    <p>Implement logging and monitoring to track usage and quickly identify issues.</p>
                  </div>
                  
                  <div className="practice-card">
                    <h4>📊 Error Handling</h4>
                    <p>Provide helpful error messages and implement proper error codes for different scenarios.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="resources" className="docs-section">
              <h2 className="section-title">Additional Resources</h2>
              <div className="section-content">
                <div className="resources-list">
                  <div className="resource-item">
                    <div className="resource-icon">📚</div>
                    <div className="resource-details">
                      <h4>MCP Specification</h4>
                      <p>The complete Model Context Protocol specification document</p>
                      <a href="https://modelcontextprotocol.io/specification" target="_blank" rel="noopener noreferrer" className="resource-link">View Specification</a>
                    </div>
                  </div>
                  
                  <div className="resource-item">
                    <div className="resource-icon">💻</div>
                    <div className="resource-details">
                      <h4>GitHub Repository</h4>
                      <p>Example servers and implementation libraries</p>
                      <a href="https://github.com/aidecentralized/nanda-servers" target="_blank" rel="noopener noreferrer" className="resource-link">View Repository</a>
                    </div>
                  </div>
                  
                  <div className="resource-item">
                    <div className="resource-icon">🧪</div>
                    <div className="resource-details">
                      <h4>MCP Inspector</h4>
                      <p>Tool for testing and debugging MCP servers</p>
                      <a href="https://www.npmjs.com/package/@modelcontextprotocol/inspector" target="_blank" rel="noopener noreferrer" className="resource-link">View Inspector</a>
                    </div>
                  </div>
                  
                  <div className="resource-item">
                    <div className="resource-icon">🎓</div>
                    <div className="resource-details">
                      <h4>Developer Community</h4>
                      <p>Join our forum to connect with other MCP developers</p>
                      <a href="https://community.nanda.ai" target="_blank" rel="noopener noreferrer" className="resource-link">Join Community</a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage; 