const CACHE_NAME = 'graphql-cache-v1';
const GRAPHQL_ENDPOINT = 'https://beta.pokeapi.co/graphql/v1beta';

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method === 'POST' && request.url === GRAPHQL_ENDPOINT) {
    console.log('[Service Worker] Intercepting GraphQL request');
    event.respondWith(handleGraphQLRequest(request));
  }
});

async function handleGraphQLRequest(request) {
  const reqClone = request.clone();
  const body = await reqClone.text();
  const cacheKey = new Request(`${request.url}?body=${body}`, { method: 'GET' });
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(cacheKey);
  if (cached) {
    console.log('[Service Worker] Serving response from cache');
    return cached;
  }
  console.log('[Service Worker] Fetching from network');
  const response = await fetch(request);
  cache.put(cacheKey, response.clone());
  console.log('[Service Worker] Cached response');
  return response;
}
