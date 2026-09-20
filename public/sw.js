const CACHE = 'color-pallet-v1'
const CORE = ['/', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith('color-pallet-') && key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstShell(request))
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
  } else {
    event.respondWith(networkFirst(request))
  }
})

async function precache() {
  const cache = await caches.open(CACHE)
  const urls = new Set(CORE)
  const stylesheets = []

  try {
    const response = await fetch('/asset-manifest.json', { cache: 'no-store' })
    if (response.ok) {
      const manifest = await response.json()
      for (const entry of Object.values(manifest)) {
        urls.add('/' + entry.file)
        for (const file of entry.css || []) {
          urls.add('/' + file)
          stylesheets.push('/' + file)
        }
        for (const file of entry.assets || []) urls.add('/' + file)
      }
    }
  } catch {
  }

  for (const sheet of stylesheets) {
    try {
      const css = await (await fetch(sheet)).text()
      for (const match of css.matchAll(/url\(([^)]+\.woff2)\)/g)) {
        const path = match[1].replace(/["']/g, '')
        if (path.includes('latin-wght') && !path.includes('latin-ext')) {
          urls.add(new URL(path, self.location.origin + sheet).pathname)
        }
      }
    } catch {
    }
  }

  await Promise.allSettled([...urls].map((url) => cache.add(url)))
}

async function networkFirstShell(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE)
      cache.put('/', response.clone())
    }
    return response
  } catch {
    return (await caches.match('/')) || Response.error()
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return (await caches.match(request)) || Response.error()
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE)
    cache.put(request, response.clone())
  }
  return response
}
