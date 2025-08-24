// Cache busting utilities for forcing fresh deployments

export const BUILD_TIMESTAMP = Date.now();

export function logDeploymentInfo() {
  console.log(`🚀 CACHE BUSTER ACTIVE - Build: ${BUILD_TIMESTAMP}`);
  console.log(`🔧 Using v4_personas table exclusively`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📅 Deploy time: ${new Date().toISOString()}`);
}

export function forceBrowserCacheRefresh() {
  // Clear service worker cache if available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        console.log('🧹 Unregistering service worker');
        registration.unregister();
      });
    });
  }

  // Clear browser caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        console.log(`🧹 Clearing cache: ${name}`);
        caches.delete(name);
      });
    });
  }

  // Clear localStorage persona cache
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('persona') || key.includes('query'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      console.log(`🧹 Clearing localStorage: ${key}`);
      localStorage.removeItem(key);
    });
  } catch (e) {
    console.log('Could not clear localStorage');
  }
}

export function addCacheBustingParams(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}bust=${BUILD_TIMESTAMP}`;
}