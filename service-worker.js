// Cache name - cambia la versión para forzar actualización
const CACHE_NAME = 'dreampeace-v3'; // Incrementado a v3

// Files to cache
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './alarma.mp3',
  './logoDP.png',
  './manifest.json'
];

// Install event
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  // Skip waiting para activar inmediatamente
  self.skipWaiting();
  
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: All Files Cached');
      })
      .catch(error => {
        console.error('Service Worker: Cache Failed', error);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Service Worker: Activated');
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  
  // Ensure the service worker takes control immediately
  return self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching', event.request.url);
  
  event.respondWith(
    // Try the network first, then fall back to cache
    fetch(event.request)
      .then(response => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response
        var responseToCache = response.clone();
        
        // Add to cache for next time
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
          
        return response;
      })
      .catch(() => {
        // If network fails, try the cache
        return caches.match(event.request);
      })
  );
});