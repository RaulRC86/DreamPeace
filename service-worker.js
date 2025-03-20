// Cache name
const CACHE_NAME = 'despertador-v1';

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
  
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: All Files Cached');
        return self.skipWaiting();
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
    // Try the cache first
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          console.log('Service Worker: Found in Cache', event.request.url);
          return response;
        }
        
        // Not in cache - fetch from network
        console.log('Service Worker: Not in Cache, Fetching', event.request.url);
        return fetch(event.request)
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
                console.log('Service Worker: New Resource Cached', event.request.url);
              });
              
            return response;
          })
          .catch(error => {
            console.error('Service Worker: Fetch Failed', error);
            // You could return a custom offline page here
          });
      })
  );
});