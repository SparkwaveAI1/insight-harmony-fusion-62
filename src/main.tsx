
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Import cache utils
import { logDeploymentInfo, forceBrowserCacheRefresh } from './utils/cacheUtils';

// NUCLEAR DEPLOYMENT VERIFICATION - Force complete fresh deployment
const NUCLEAR_DEPLOYMENT_ID = `NUCLEAR_FRESH_${Date.now()}_V4_ONLY`;
document.title = `PersonaAI - FRESH DEPLOYMENT [${NUCLEAR_DEPLOYMENT_ID}]`;
console.log(`🚨 NUCLEAR DEPLOYMENT ACTIVE: ${NUCLEAR_DEPLOYMENT_ID}`);
console.log(`🔥 MAIN.TSX LOADED - If you see this, NEW main.tsx is running!`);

// Log deployment info and force cache refresh
logDeploymentInfo();
forceBrowserCacheRefresh();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

createRoot(rootElement).render(<App />);
