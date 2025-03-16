
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Detailed console logs for debugging
console.log('Main.tsx is executing');

try {
  const rootElement = document.getElementById("root");
  console.log('Root element found:', !!rootElement);
  
  if (!rootElement) {
    console.error("Failed to find the root element");
    throw new Error("Failed to find the root element");
  }

  console.log('Creating React root and mounting app');
  
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('App rendered successfully');
} catch (error) {
  console.error('Critical error in main.tsx:', error);
  
  // Try fallback rendering directly in the DOM if React mounting fails
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: system-ui, sans-serif;">
        <h1>Application Error</h1>
        <p>There was a problem loading the application. Check the browser console for details.</p>
      </div>
    `;
  }
}
