// Service Worker for Afoozo CRM PWA

const CACHE_NAME = 'afoozo-pwa-v3';
const STATIC_CACHE_NAME = 'afoozo-static-v3';
const DYNAMIC_CACHE_NAME = 'afoozo-dynamic-v3';

// Assets to cache immediately on install
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/offline.html'
];

// Install a service worker
self.addEventListener('install', event => {
  // Skip waiting so the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME)
        .then(cache => {
          console.log('Caching static assets');
          return cache.addAll(urlsToCache);
        }),
      // Create dynamic cache
      caches.open(DYNAMIC_CACHE_NAME)
    ])
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // For HTML navigation requests, use network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }
  
  // For all other requests like CSS, JS, images, use cache-first strategy
  event.respondWith(cacheFirstStrategy(request));
});

// Cache-first strategy: try cache, fall back to network
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    await updateCache(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // For image requests, return a fallback if available
    if (request.destination === 'image') {
      return caches.match('/android-chrome-192x192.png');
    }
    
    // Return default response for other failed requests
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Network-first strategy: try network, fall back to cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    await updateCache(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return JSON error for API requests
    return new Response(JSON.stringify({ error: 'Network connection error' }), {
      status: 408,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper to update the dynamic cache
async function updateCache(request, response) {
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return;
  }
  
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  cache.put(request, response);
}

// Update a service worker
self.addEventListener('activate', event => {
  // Become active immediately
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches except current ones
          if (
            cacheName !== STATIC_CACHE_NAME && 
            cacheName !== DYNAMIC_CACHE_NAME
          ) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});