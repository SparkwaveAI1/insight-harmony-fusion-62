
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Import cache utils
import { logDeploymentInfo, forceBrowserCacheRefresh } from './utils/cacheUtils';

// Update the document title with cache-busting build timestamp
const BUILD_ID = `${Date.now()}-v4personas`;
document.title = `PersonaAI - AI-Powered Qualitative Research [${BUILD_ID}]`;

// Log deployment info and force cache refresh
logDeploymentInfo();
forceBrowserCacheRefresh();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

createRoot(rootElement).render(<App />);
