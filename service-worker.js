self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('despertador-v1').then(cache => {
        const urlsToCache = [
          '/DreamPeace/index.html',
          '/DreamPeace/styles.css',
          '/DreamPeace/script.js',
          '/DreamPeace/alarma.mp3',
          '/DreamPeace/logoDP.png',
          '/DreamPeace/manifest.json' // Añade el manifest.json
        ];
  
        // Usamos Promise.all para cachear los archivos
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.error(`Error al cachear ${url}:`, err);
              // No lanzamos el error para que el Service Worker continúe instalándose
              return null; // O puedes devolver un valor para indicar que falló
            });
          })
        ).then(() => {
          console.log('Recursos cacheados correctamente');
        }).catch(err => {
          console.error('Error general al cachear recursos:', err);
        });
      }).catch(err => {
        console.error('Error al abrir el caché:', err);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).catch(() => {
          // Opcional: si la solicitud falla (por ejemplo, sin conexión), puedes devolver un recurso por defecto
          console.error('Error al hacer fetch:', event.request.url);
        });
      })
    );
  });