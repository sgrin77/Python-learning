// Offline support. Serves the app from the cache right away (so it opens at
// a field with no signal) and checks GitHub for newer files in the
// background. When a file has changed, it tells the open app, which reloads
// itself so the new version shows up right away.
const CACHE = 'ksl-v4';
const SHELL = [
  './',
  'index.html',
  'app.css',
  'app.js',
  'plays.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  // cache: 'reload' skips the browser's own short-term cache, so a new version never precaches old files.
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ksl-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const versionOf = (res) => res.headers.get('etag') || res.headers.get('last-modified') || '';
const notifyUpdated = () =>
  self.clients.matchAll({ type: 'window' }).then((cs) => cs.forEach((c) => c.postMessage({ type: 'ksl-updated' })));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !isFont) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: sameOrigin });
    // no-cache: always ask GitHub whether the file changed, instead of trusting
    // the browser's 10-minute copy.
    const fresh = fetch(req, sameOrigin ? { cache: 'no-cache' } : undefined)
      .then(async (res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          await cache.put(req, res.clone());
          if (sameOrigin && cached && versionOf(res) && versionOf(res) !== versionOf(cached)) notifyUpdated();
        }
        return res;
      })
      .catch(() => null);
    if (cached) {
      event.waitUntil(fresh);
      return cached;
    }
    const res = await fresh;
    if (res) return res;
    if (req.mode === 'navigate') {
      const shell = await cache.match('index.html');
      if (shell) return shell;
    }
    return Response.error();
  })());
});
