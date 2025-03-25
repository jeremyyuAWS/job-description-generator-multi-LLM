import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface ApiCall {
  id: string;
  timestamp: number;
  endpoint: string;
  request: any;
  response?: any;
  error?: any;
  duration?: number;
  status?: 'pending' | 'success' | 'error';
}

interface DevToolsContextType {
  apiCalls: ApiCall[];
  isOpen: boolean;
  isEnabled: boolean;
  addApiCall: (call: Omit<ApiCall, 'id' | 'timestamp'>) => string;
  updateApiCall: (id: string, data: Partial<ApiCall>) => void;
  clearApiCalls: () => void;
  toggleDevTools: () => void;
  toggleEnabled: () => void;
}

const DevToolsContext = createContext<DevToolsContextType | undefined>(undefined);

export const DevToolsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // Check localStorage for enabled state, default to false
  const [isEnabled, setIsEnabled] = useState(() => {
    try {
      return localStorage.getItem('devtools-enabled') === 'true';
    } catch {
      return false;
    }
  });

  const addApiCall = useCallback((call: Omit<ApiCall, 'id' | 'timestamp'>): string => {
    const id = Date.now().toString();
    const newCall: ApiCall = {
      ...call,
      id,
      timestamp: Date.now(),
      status: 'pending',
    };
    
    setApiCalls(prev => [newCall, ...prev].slice(0, 50)); // Keep last 50 calls
    return id;
  }, []);

  const updateApiCall = useCallback((id: string, data: Partial<ApiCall>) => {
    setApiCalls(prev => 
      prev.map(call => 
        call.id === id ? { ...call, ...data } : call
      )
    );
  }, []);

  const clearApiCalls = useCallback(() => {
    setApiCalls([]);
  }, []);

  const toggleDevTools = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem('devtools-enabled', newValue.toString());
      } catch (e) {
        console.error('Could not save devtools state to localStorage', e);
      }
      return newValue;
    });
  }, []);

  return (
    <DevToolsContext.Provider
      value={{
        apiCalls,
        isOpen,
        isEnabled,
        addApiCall,
        updateApiCall,
        clearApiCalls,
        toggleDevTools,
        toggleEnabled,
      }}
    >
      {children}
    </DevToolsContext.Provider>
  );
};

export const useDevTools = (): DevToolsContextType => {
  const context = useContext(DevToolsContext);
  if (context === undefined) {
    throw new Error('useDevTools must be used within a DevToolsProvider');
  }
  return context;
};