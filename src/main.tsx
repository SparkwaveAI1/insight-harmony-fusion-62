
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Import cache utils
import { logDeploymentInfo, forceBrowserCacheRefresh } from './utils/cacheUtils';

// Log deployment info and force cache refresh
logDeploymentInfo();
forceBrowserCacheRefresh();

// Global chunk load error handler — auto-reload when a lazy chunk 404s after deploy
window.addEventListener('error', (event) => {
  const msg = event?.message || '';
  const src = (event?.filename || '');
  const isChunkError =
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    src.includes('/assets/');
  if (isChunkError) {
    console.warn('[chunk-reload] Stale chunk detected, reloading…', msg);
    window.location.reload();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const msg = event?.reason?.message || String(event?.reason || '');
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module')
  ) {
    console.warn('[chunk-reload] Unhandled chunk load rejection, reloading…', msg);
    window.location.reload();
  }
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

createRoot(rootElement).render(<App />);
