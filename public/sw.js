// FitDiary Service Worker v1
const CACHE = 'fitdiary-v1'

// Assets to pre-cache on install
const PRECACHE = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
]

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

// ── Activate: delete old caches ───────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// ── Fetch strategy ────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Always network-first for: API routes, Supabase, auth, external APIs
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('openfoodfacts') ||
    url.hostname.includes('mistral') ||
    e.request.method !== 'GET'
  ) {
    e.respondWith(fetch(e.request))
    return
  }

  // Cache-first for static assets (JS bundles, images, fonts)
  if (
    url.pathname.match(/\.(js|css|png|jpg|svg|woff2?|ico)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached
        return fetch(e.request).then((res) => {
          if (!res || res.status !== 200) return res
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, clone))
          return res
        })
      })
    )
    return
  }

  // Network-first for HTML pages (always fresh, fallback to cache)
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (!res || res.status !== 200) return res
        const clone = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
