const APP_PREFIX = 'BudgetTracker-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  "/",
  "index.html",
  "manifest.json",
  "css/styles.css",
  "icons/icon-72x72.png",
  "icons/icon-96x96.png",
  "icons/icon-128x128.png",
  "icons/icon-144x144.png",
  "icons/icon-152x152.png",
  "icons/icon-192x192.png",
  "icons/icon-384x384.png",
  "icons/icon-512x512.png",
  "js/index.js",
  "js/idb.js"
];

self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(FILES_TO_CACHE))
    )
    self.skipWaiting()
})

self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME) {
              return caches.delete(key)
            }
          })
        )
      })
    )
    self.clients.claim()
})

self.addEventListener('fetch', event => {
    // Requests for data
    // Strategy: Network-first, fallback to cache
    if (event.request.method === 'GET') {
      event.respondWith(
        // open caches
        caches.open(CACHE_NAME)
          .then(cache => {
            // try network with a fetch request
            return fetch(event.request)
              .then(response => {
                // if success
                if (response.status === 200) {
                  // save response in cache
                  cache.put(event.request.url, response.clone())
                }
                return response
              })
              // if fails pull last saved data from cache
              .catch(() => caches.match(event.request))
          })
          .catch(err => console.log(err))
      )
      return
    }
  
    // Request for static assets (.html, .css, .js, .jpg, .png)
    // Strategy: Cache-first, fallback to Network
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    )
})