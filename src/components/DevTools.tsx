import React, { useState } from 'react';
import { useDevTools, ApiCall } from '../context/DevToolsContext';
import { 
  Wrench, 
  XCircle, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const DevTools: React.FC = () => {
  const { 
    apiCalls, 
    isOpen, 
    isEnabled, 
    toggleDevTools, 
    toggleEnabled, 
    clearApiCalls 
  } = useDevTools();
  
  const [expandedCalls, setExpandedCalls] = useState<Record<string, boolean>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  if (!isEnabled) {
    return (
      <div className="fixed bottom-3 right-3 z-50">
        <button 
          onClick={toggleEnabled}
          className="bg-gray-600 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Enable Developer Tools"
        >
          <Wrench className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const toggleCall = (id: string) => {
    setExpandedCalls(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (data: any, type: string, callId: string) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    
    // Set copied state
    setCopiedStates(prev => ({
      ...prev,
      [`${callId}-${type}`]: true
    }));
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedStates(prev => ({
        ...prev,
        [`${callId}-${type}`]: false
      }));
    }, 2000);
  };

  const getStatusIcon = (call: ApiCall) => {
    switch (call.status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-3 right-3 z-50">
        <button 
          onClick={toggleDevTools}
          className="bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
          title="Open Developer Tools"
        >
          <Wrench className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full md:w-1/2 lg:w-1/3 h-96 bg-gray-900 text-white shadow-xl rounded-t-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <Wrench className="h-5 w-5 mr-2" />
          <h3 className="text-sm font-medium">HireWrite Developer Tools</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={clearApiCalls}
            className="text-gray-400 hover:text-white transition-colors"
            title="Clear All"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button 
            onClick={toggleDevTools}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-48px)] p-2 bg-gray-950 text-xs">
        {apiCalls.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No API calls recorded yet. Start using the application to see API calls here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {apiCalls.map((call) => (
              <div key={call.id} className="border border-gray-800 rounded-md overflow-hidden">
                <div 
                  className="flex items-center justify-between p-2 bg-gray-800 cursor-pointer hover:bg-gray-700"
                  onClick={() => toggleCall(call.id)}
                >
                  <div className="flex items-center">
                    {getStatusIcon(call)}
                    <span className="ml-2 font-mono truncate max-w-xs">
                      {call.endpoint}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">{formatTime(call.timestamp)}</span>
                    {call.duration && (
                      <span className="text-gray-400">{call.duration}ms</span>
                    )}
                    {expandedCalls[call.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
                
                {expandedCalls[call.id] && (
                  <div className="p-2 bg-gray-900">
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400">Request:</span>
                        <button 
                          onClick={() => copyToClipboard(call.request, 'request', call.id)}
                          className="text-gray-400 hover:text-white"
                          title="Copy to clipboard"
                        >
                          {copiedStates[`${call.id}-request`] ? (
                            <span className="text-green-500 flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" /> Copied
                            </span>
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <pre className="bg-gray-950 p-2 rounded overflow-x-auto">
                        {JSON.stringify(call.request, null, 2)}
                      </pre>
                    </div>
                    
                    {call.response && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400">Response:</span>
                          <button 
                            onClick={() => copyToClipboard(call.response, 'response', call.id)}
                            className="text-gray-400 hover:text-white"
                            title="Copy to clipboard"
                          >
                            {copiedStates[`${call.id}-response`] ? (
                              <span className="text-green-500 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" /> Copied
                              </span>
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <pre className="bg-gray-950 p-2 rounded overflow-x-auto">
                          {JSON.stringify(call.response, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {call.error && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-red-400">Error:</span>
                          <button 
                            onClick={() => copyToClipboard(call.error, 'error', call.id)}
                            className="text-gray-400 hover:text-white"
                            title="Copy to clipboard"
                          >
                            {copiedStates[`${call.id}-error`] ? (
                              <span className="text-green-500 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" /> Copied
                              </span>
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <pre className="bg-gray-950 p-2 rounded text-red-400 overflow-x-auto">
                          {JSON.stringify(call.error, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevTools;