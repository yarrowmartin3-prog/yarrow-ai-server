self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("nova-cache-v1").then(cache => {
      return cache.addAll([
        "/yarrow-ai-server/",
        "/yarrow-ai-server/index.html",
        "/yarrow-ai-server/manifest.webmanifest",
        "/yarrow-ai-server/icon-192.png",
        "/yarrow-ai-server/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
