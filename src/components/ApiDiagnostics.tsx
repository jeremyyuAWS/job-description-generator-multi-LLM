import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../services/aiService';

// Interface for endpoint diagnostics results
interface EndpointDiagnostic {
  url: string;
  name: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  responseTime?: number;
  errorMessage?: string;
  lastTestedAt?: Date;
}

const ApiDiagnostics: React.FC = () => {
  // Initialize diagnostics state with all endpoints
  const [diagnostics, setDiagnostics] = useState<EndpointDiagnostic[]>(() => 
    Object.entries(API_ENDPOINTS).map(([name, url]) => ({
      name,
      url,
      status: 'idle'
    }))
  );
  
  const [isRunningAll, setIsRunningAll] = useState(false);

  // Test a single endpoint
  const testEndpoint = async (endpointName: string, endpointUrl: string) => {
    // Update the status to loading
    setDiagnostics(prev => 
      prev.map(diag => 
        diag.name === endpointName 
          ? { ...diag, status: 'loading' as const } 
          : diag
      )
    );
    
    const startTime = Date.now();
    
    try {
      // Send a simple OPTIONS request to check if the endpoint is reachable
      // We use OPTIONS to avoid triggering actual API processing
      const response = await fetch(endpointUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok || response.status === 204) {
        // Update with success status
        setDiagnostics(prev => 
          prev.map(diag => 
            diag.name === endpointName 
              ? { 
                  ...diag, 
                  status: 'success', 
                  responseTime,
                  errorMessage: undefined,
                  lastTestedAt: new Date()
                } 
              : diag
          )
        );
      } else {
        // Handle non-OK response
        const errorText = await response.text();
        
        // Get response headers for additional debugging
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        
        // Create detailed error message
        let detailedError = `Status ${response.status}: ${response.statusText}\n\n`;
        
        // Add authentication-specific context for 401 errors
        if (response.status === 401) {
          detailedError += "Authentication Error: The request was rejected due to invalid credentials.\n";
          detailedError += "This may be caused by an invalid or missing Supabase anon key.\n\n";
        }
        
        // Add response body
        detailedError += `Response Body: ${errorText || 'No response body'}\n\n`;
        
        // Add key headers that might be relevant for debugging
        detailedError += "Key Headers:\n";
        ['content-type', 'www-authenticate', 'x-error', 'server'].forEach(key => {
          if (headers[key]) {
            detailedError += `${key}: ${headers[key]}\n`;
          }
        });
        
        console.error(`API Diagnostics Error for ${endpointName}:`, {
          status: response.status,
          headers,
          body: errorText
        });
        
        setDiagnostics(prev => 
          prev.map(diag => 
            diag.name === endpointName 
              ? { 
                  ...diag, 
                  status: 'error', 
                  responseTime,
                  errorMessage: detailedError,
                  lastTestedAt: new Date()
                } 
              : diag
          )
        );
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      // Handle network or other errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error(`API Diagnostics Network Error for ${endpointName}:`, error);
      
      // Check if this might be related to CORS or authentication
      const detailedError = errorMessage.includes('NetworkError') || errorMessage.includes('CORS') 
        ? `${errorMessage}\n\nThis may be a CORS issue or the endpoint may not be accessible.`
        : errorMessage;
      
      setDiagnostics(prev => 
        prev.map(diag => 
          diag.name === endpointName 
            ? { 
                ...diag, 
                status: 'error', 
                responseTime,
                errorMessage: detailedError,
                lastTestedAt: new Date()
              } 
            : diag
        )
      );
    }
  };

  // Run diagnostics on all endpoints
  const runAllDiagnostics = async () => {
    setIsRunningAll(true);
    
    // Reset all diagnostics to loading state
    setDiagnostics(prev => 
      prev.map(diag => ({
        ...diag,
        status: 'loading'
      }))
    );
    
    // Test each endpoint sequentially
    for (const [name, url] of Object.entries(API_ENDPOINTS)) {
      await testEndpoint(name, url);
    }
    
    setIsRunningAll(false);
  };

  // Get status badge color
  const getStatusColor = (status: EndpointDiagnostic['status']) => {
    switch (status) {
      case 'idle': return '#888';
      case 'loading': return '#f5a623';
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      default: return '#888';
    }
  };

  // Get status badge text
  const getStatusText = (status: EndpointDiagnostic['status']) => {
    switch (status) {
      case 'idle': return 'Not Tested';
      case 'loading': return 'Testing...';
      case 'success': return 'OK';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="api-diagnostics" style={{ padding: '12px', fontSize: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>API Endpoint Diagnostics</h3>
        <button 
          onClick={runAllDiagnostics} 
          disabled={isRunningAll}
          style={{
            padding: '6px 12px',
            backgroundColor: '#4a4a4a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunningAll ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {isRunningAll ? 'Running...' : 'Test All Endpoints'}
        </button>
      </div>
      
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        {diagnostics.map((diag, index) => (
          <div 
            key={diag.name}
            style={{ 
              padding: '12px',
              borderBottom: index < diagnostics.length - 1 ? '1px solid #ddd' : 'none',
              backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{diag.name}</span>
                <span 
                  style={{ 
                    marginLeft: '8px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: getStatusColor(diag.status),
                    color: 'white'
                  }}
                >
                  {getStatusText(diag.status)}
                </span>
              </div>
              <button 
                onClick={() => testEndpoint(diag.name, diag.url)}
                disabled={diag.status === 'loading'}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#4a4a4a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: diag.status === 'loading' ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                Test
              </button>
            </div>
            
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div>{diag.url}</div>
              
              {diag.responseTime && (
                <div style={{ marginTop: '4px' }}>
                  Response time: <span style={{ fontWeight: 500 }}>{diag.responseTime}ms</span>
                </div>
              )}
              
              {diag.lastTestedAt && (
                <div style={{ marginTop: '4px' }}>
                  Last tested: <span style={{ fontWeight: 500 }}>{diag.lastTestedAt.toLocaleTimeString()}</span>
                </div>
              )}
              
              {diag.errorMessage && (
                <div 
                  style={{ 
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#ffebee',
                    borderRadius: '4px',
                    color: '#d32f2f',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  {diag.errorMessage}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiDiagnostics;
