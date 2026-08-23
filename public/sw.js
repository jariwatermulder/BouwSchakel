/*
 * BouwSchakel service worker (minimaal & veilig).
 *
 * Doel: de app installeerbaar maken (PWA) en een nette offline-pagina tonen
 * wanneer er geen netwerk is. We cachen bewust GEEN persoonlijke of dynamische
 * data — navigaties gaan altijd network-first, zodat je nooit verouderde of
 * andermans gegevens ziet. Alleen een paar statische bestanden worden vooraf
 * gecachet voor de offline-terugval.
 */
const CACHE = "bouwschakel-v1";
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Alleen paginanavigaties afvangen; API/POST/data laten we met rust.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }
});
