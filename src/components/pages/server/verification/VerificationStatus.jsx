import React from "react";
import "./VerificationStatus.css";

const VerificationStatus = ({ status, onClose }) => {
  const isSuccess = status && 
    ((status.server && status.server.verified) || 
     (status.verification_details && status.verification_details.is_verified) || 
     (status.status === "completed"));

  return (
    <div className="verification-overlay">
      <div className="verification-status-panel">
        <div className="verification-header">
          <h2>Verification Status</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="status-content">
          {isSuccess ? (
            <div className="success-status">
              <div className="status-icon success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
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
              </div>
              <h3>Verification Successful!</h3>
              <p>Your server has been successfully verified.</p>

              {status.badge_url && (
                <div className="badge-container">
                  <h4>Verification Badge</h4>
                  <div className="badge-preview">
                    <img src={status.badge_url} alt="Verification Badge" />
                  </div>
                  <div className="badge-code">
                    <p className="badge-instruction">Add this code to your website to display your verification badge:</p>
                    <div className="code-box">
                      <code>{`<img src="${status.badge_url}" alt="Verified MCP Server" />`}</code>
                      <button
                        className="copy-button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `<img src="${status.badge_url}" alt="Verified MCP Server" />`
                          );
                          // Show a temporary "Copied!" message
                          const button = document.querySelector('.badge-code .copy-button');
                          const originalInnerHTML = button.innerHTML;
                          button.innerHTML = '<span style="font-size: 12px;">Copied!</span>';
                          setTimeout(() => {
                            button.innerHTML = originalInnerHTML;
                          }, 2000);
                        }}
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
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="failed-status">
              <div className="status-icon failed">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <h3>Verification Failed</h3>
              <p>We encountered issues during the verification process.</p>

              {status &&
                status.failed_checks &&
                status.failed_checks.length > 0 && (
                  <div className="failed-checks">
                    <h4>Failed Checks</h4>
                    <ul>
                      {status.failed_checks.map((check, index) => (
                        <li key={index}>
                          <strong>{check.type}:</strong> {check.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="status-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;
