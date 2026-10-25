// DoughTally service worker.
//
// Deliberately small: it never caches pages or data, so prices and margins
// are always live. It only
//   - shows /offline when a page can't load because there's no connection, and
//   - keeps Next's hashed static files (/_next/static/…) and the icons, which
//     never change once published, so the app shell loads fast.
// Bump VERSION to drop old caches after changing this file or the icons.
const VERSION = "v4";
const CACHE = `doughtally-${VERSION}`;
const OFFLINE_URL = "/offline";
// Hashed files from older deploys are never requested again but would stay
// cached forever (one cache name across deploys), so keep only the newest
// MAX_ENTRIES; the offline page and icons are always kept.
const MAX_ENTRIES = 150;

async function trim(cache) {
  const keys = (await cache.keys()).filter((req) => new URL(req.url).pathname.startsWith("/_next/static/"));
  // cache.keys() lists entries oldest first.
  for (const req of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) await cache.delete(req);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const res = await fetch(OFFLINE_URL, { cache: "reload" });
      await cache.put(OFFLINE_URL, res.clone());
      // Precache the offline page's own scripts, styles and fonts so it
      // renders fully with no network at all.
      const html = await res.text();
      const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s)]+/g) ?? [])];
      await cache.addAll(["/icons/icon-192.png", ...assets]);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        // "doughline-" caches predate the rename.
        if ((key.startsWith("doughtally-") || key.startsWith("doughline-")) && key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) ?? Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        if (res.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(request, res.clone());
          // In the background: if it's cut short, the next fetch finishes it.
          trim(cache).catch(() => {});
        }
        return res;
      })(),
    );
  }
  // Everything else (pages' data, API routes, Supabase) goes straight to the network.
});
