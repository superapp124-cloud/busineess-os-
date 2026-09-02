/**
 * CHATR OS — Self-Destructing Cache Purge Service Worker
 * Immediately unregisters, purges all caches, and releases network control to native browser.
 */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        // Notify all open tabs that caches are purged
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_PURGED' });
        });
      })
  );
});

// No fetch listener: all requests pass directly to the network without interception
