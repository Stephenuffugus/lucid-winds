/* Skitterlings service worker — DISABLED / KILL-SWITCH (2026-06-28, Stephen).
 *
 * This satellite is embedded in lucidwinds.com, which already handles caching
 * at the CDN/edge. The previous SW pinned players to a stale build that
 * survived clearing browser history (Cache Storage is separate from history),
 * which read as "the portal is serving the wrong version."
 *
 * This replacement intentionally caches NOTHING. It takes control of any
 * client still pinned to the old worker, deletes every cache, then
 * unregisters itself so future loads come straight from the network (the
 * site's normal edge cache). After one visit, affected devices self-heal.
 */
self.addEventListener("install", function (e) { self.skipWaiting(); });

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
      .then(function () { return self.registration.unregister(); })
      .catch(function () {})
  );
});

/* Pure passthrough — never serve from cache. */
self.addEventListener("fetch", function (e) { /* let the network handle it */ });
