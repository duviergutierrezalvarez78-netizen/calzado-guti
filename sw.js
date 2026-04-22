const CACHE_NAME = 'calzado-guti-v3';
const BASE = '/calzado-guti';
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/mujeres.html',
  BASE + '/mujeres2.html',
  BASE + '/pagina2.html',
  BASE + '/pagina3.html',
  BASE + '/somos.html',
  BASE + '/style.css',
  BASE + '/script.js',
  BASE + '/products.json',
  BASE + '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});