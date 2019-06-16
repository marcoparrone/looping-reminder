var cacheName = 'looping-reminder-static-cache-v1';
var filesToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/reminder.js',
  '/manifest.json',
  '/reminder-128.png',
  '/reminder-144.png',
  '/reminder-192.png',
  '/reminder-256.png',
  '/reminder-512.png'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});