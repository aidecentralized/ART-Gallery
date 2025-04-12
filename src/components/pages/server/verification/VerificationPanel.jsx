import React, { useState } from "react";
import { verificationApi } from "../../../../api";
import "./VerificationPanel.css";

const VerificationPanel = ({
  verificationData,
  serverId,
  onComplete,
  onClose,
}) => {
  const [verificationMethod, setVerificationMethod] = useState("dns");
  const [verificationProof, setVerificationProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await verificationApi.completeVerification(
        verificationData.id,
        {
          verification_method: verificationMethod,
          verification_proof: verificationProof,
        }
      );

      onComplete(response.data);
    } catch (err) {
      console.error("Verification failed:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Verification failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="verification-overlay">
      <div className="verification-panel">
        <div className="verification-header">
          <h2>Verify Your Server</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && (
          <div className="verification-error">
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
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="verification-instructions">
          <div className="instruction-note">
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
            <span>
              Follow the instructions below to verify ownership of your server
            </span>
          </div>
          <div className="instruction-content">
            {verificationData.verification_instructions}
          </div>
          <div className="verification-token">
            <span className="token-label">Your Verification Token:</span>
            <div className="token-value">
              {verificationData.verification_token}
              <button
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    verificationData.verification_token
                  );
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
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="verification-form">
          <div className="form-group">
            <label htmlFor="verificationMethod">Verification Method</label>
            <select
              id="verificationMethod"
              value={verificationMethod}
              onChange={(e) => setVerificationMethod(e.target.value)}
              className="method-select"
            >
              <option value="dns">DNS Verification</option>
              <option value="file">File Verification</option>
              <option value="meta_tag">Meta Tag Verification</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="verificationProof">
              Additional Proof (optional)
              <span className="help-text">Only required if instructed</span>
            </label>
            <input
              id="verificationProof"
              type="text"
              value={verificationProof}
              onChange={(e) => setVerificationProof(e.target.value)}
              placeholder="Enter verification proof if needed"
              className="proof-input"
            />
          </div>

          <div className="verification-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Implement Verification</h4>
                <p>Add the verification token using your chosen method</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Select Method</h4>
                <p>Choose the verification method you implemented</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Complete Verification</h4>
                <p>Submit the form to verify server ownership</p>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Verifying...
                </>
              ) : (
                "Complete Verification"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationPanel;
