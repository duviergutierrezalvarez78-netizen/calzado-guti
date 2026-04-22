// sw.js — Service Worker de Calzado Guti
const CACHE_NAME = 'calzado-guti-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/mujeres.html',
  '/mujeres2.html',
  '/pagina2.html',
  '/pagina3.html',
  '/somos.html',
  '/style.css',
  '/script.js',
  '/products.json',
  '/manifest.json'
];
 
// Instalación: cachear todos los assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});
 
// Activación: limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
 
// Fetch: network-first para JSON, cache-first para assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
 
  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) return;
 
  if (url.pathname.endsWith('products.json')) {
    // Network first para datos frescos
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first para HTML, CSS, JS, imágenes
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});