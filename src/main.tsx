
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Add console log for debugging
console.log('Main.tsx is executing');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Failed to find the root element");
  throw new Error("Failed to find the root element");
}

console.log('Root element found, mounting app');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('App rendered');
