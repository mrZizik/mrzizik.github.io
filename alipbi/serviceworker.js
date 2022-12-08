const FILES_TO_CACHE = [
  "/*",
  "/font/*",
  "/img/*",
  "img/letters/thumb/*",
  "img/letters/*",
  "/snd/*",
];

const CACHE_NAME = "static-cache-v2";

self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    }),
  );
});

self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log("[ServiceWorker] Removing old cache", key);
          return caches.delete(key);
        }
      }));
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  event.respondWith(fromCache(event.request));
  event.waitUntil(update(event.request));
});

function fromCache(request) {
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((matching) =>
      matching || Promise.reject("no-match")
    )
  );
}

function update(request) {
  return caches.open(CACHE).then((cache) =>
    fetch(request).then((response) => cache.put(request, response))
  );
}
