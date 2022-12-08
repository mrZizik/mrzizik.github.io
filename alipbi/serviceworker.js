const FILES_TO_CACHE = [
  "/offline.html",
];

const CACHE = "cache-and-update-v1";

// При установке воркера мы должны закешировать часть данных (статику).
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(["/"])),
  );
});

// при событии fetch, мы используем кэш, и только потом обновляем его данным с сервера
self.addEventListener("fetch", function (event) {
  // Мы используем `respondWith()`, чтобы мгновенно ответить без ожидания ответа с сервера.
  event.respondWith(fromCache(event.request));
  // `waitUntil()` нужен, чтобы предотвратить прекращение работы worker'a до того как кэш обновиться.
  event.waitUntil(update(event.request));
});

async function fromCache(request) {
  const cache = await caches.open(CACHE);
  const matching = await cache.match(request);
  return matching || Promise.reject("no-match");
}

async function update(request) {
  const cache = await caches.open(CACHE);
  const response = await fetch(request);
  return await cache.put(request, response);
}
