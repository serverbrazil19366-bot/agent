// Service worker for the Sathya Klassy admin app.
// - Shows a phone notification when the shop sends one (new paid order, etc.)
// - Opens the admin at the right order when the notification is tapped
// - Keeps the app shell so the app opens quickly. Shop data (/api) is never cached.
const SHELL = 'sk-admin-v1';
const FILES = ['/admin/', '/css/admin.css', '/js/admin.js', '/admin/icon-192.png', '/assets/logo.webp', '/assets/favicon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// network first, cached copy only when offline; never touch /api
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  if (!FILES.includes(url.pathname)) return;
  e.respondWith(fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(SHELL).then((c) => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match(e.request)));
});

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: 'Sathya Klassy', body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Sathya Klassy', {
    body: d.body || '',
    icon: '/admin/icon-192.png',
    badge: '/admin/icon-192.png',
    tag: d.tag || undefined,
    renotify: Boolean(d.tag),
    vibrate: [120, 60, 120],
    data: { url: d.url || '/admin/' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || '/admin/', location.origin);
  if (!target.pathname.startsWith('/admin/')) return;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (new URL(w.url).pathname.startsWith('/admin/')) { await w.focus(); return w.navigate(target.href); }
    }
    return self.clients.openWindow(target.href);
  })());
});
