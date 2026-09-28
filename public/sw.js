self.addEventListener("install", (event) => {
  console.log("PWA Service Worker Installé");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("PWA Service Worker Activé");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass-through simple pour valider la PWA (le navigateur a juste besoin d'un fetch handler)
});
