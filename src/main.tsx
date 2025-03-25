import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DevToolsProvider } from './context/DevToolsContext.tsx';
import DevTools from './components/DevTools.tsx';
import { initializeDevToolsTracking } from './services/aiService.ts';

const rootElement = document.getElementById('root')!;

// Initialize the application
const app = (
  <StrictMode>
    <DevToolsProvider>
      <App />
      <DevTools />
    </DevToolsProvider>
  </StrictMode>
);

// Render the application
createRoot(rootElement).render(app);

// Initialize DevTools tracking once the context is available
// This needs to happen after the render to ensure the context is initialized
setTimeout(() => {
  try {
    // Get the DevTools context from the window object
    const devToolsContext = window.devToolsContext;
    if (devToolsContext) {
      initializeDevToolsTracking(devToolsContext);
    }
  } catch (e) {
    console.error('Failed to initialize DevTools tracking', e);
  }
}, 0);