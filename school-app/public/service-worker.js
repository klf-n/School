const CACHE_NAME = 'school-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/home.html',
  '/timetable.html',
  '/meal.html',
  '/homework.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});