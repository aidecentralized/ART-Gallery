import React, { useState, useEffect } from 'react';
import { testApiConnection } from '../../utils/apiTest';

const ApiStatus = () => {
  const [status, setStatus] = useState({
    loading: true,
    success: false,
    message: 'Checking API connection...',
    baseUrl: '',
  });
  const [mode, setMode] = useState(
    localStorage.getItem('use_direct_api') === 'true' ? 'direct' : 'proxy'
  );
  const [testingDirect, setTestingDirect] = useState(
    localStorage.getItem('use_direct_api') === 'true'
  );

  const checkConnection = async (useDirect = localStorage.getItem('use_direct_api') === 'true') => {
    setStatus({
      loading: true,
      success: false,
      message: `Checking ${useDirect ? 'direct' : 'proxy'} API connection...`,
      baseUrl: '',
    });
    
    try {
      const result = await testApiConnection(useDirect);
      setStatus({
        loading: false,
        ...result
      });
      setTestingDirect(useDirect);
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        message: `Failed to check API: ${error.message}`,
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);
  
  const toggleMode = () => {
    const newMode = mode === 'direct' ? 'proxy' : 'direct';
    setMode(newMode);
    localStorage.setItem('use_direct_api', newMode === 'direct' ? 'true' : 'false');
    // Test connection with the new mode
    checkConnection(newMode === 'direct');
  };

  return (
    <div className="api-status" style={{ 
      padding: '1rem', 
      margin: '1rem 0', 
      borderRadius: '8px',
      backgroundColor: status.loading 
        ? '#f0f0f0' 
        : status.success 
          ? 'rgba(0, 200, 83, 0.1)' 
          : 'rgba(255, 51, 102, 0.1)',
      color: status.loading 
        ? '#666' 
        : status.success 
          ? '#00a86b' 
          : '#ff3366',
      border: status.loading 
        ? '1px solid #ddd' 
        : status.success 
          ? '1px solid rgba(0, 200, 83, 0.3)' 
          : '1px solid rgba(255, 51, 102, 0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ marginTop: 0 }}>
          {status.loading ? 'Checking API Connection...' : 
          status.success ? 'API Connected Successfully' : 
          'API Connection Failed'}
        </h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#444', 
          borderRadius: '4px',
          padding: '2px'
        }}>
          <button 
            onClick={() => {
              if (mode !== 'proxy') toggleMode();
            }}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: mode === 'proxy' ? '#777' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Proxy
          </button>
          <button 
            onClick={() => {
              if (mode !== 'direct') toggleMode();
            }}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: mode === 'direct' ? '#777' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Direct
          </button>
        </div>
      </div>
      <p>
        <strong>Mode:</strong> {testingDirect ? 'Direct API' : 'Proxy'} 
        {status.success && <span> ✓</span>}
      </p>
      <p>{status.message}</p>
      {status.baseUrl && (
        <p>
          <strong>API URL:</strong> {status.baseUrl}
        </p>
      )}
      {!status.loading && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => checkConnection(testingDirect)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Connection Again
          </button>
          <button 
            onClick={() => checkConnection(!testingDirect)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#555',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test {testingDirect ? 'Proxy' : 'Direct API'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiStatus; 