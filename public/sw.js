self.addEventListener("push", function (event) {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    tag: data.tag || "apna-notification",
    data: { url: data.url || "/" },
    vibrate: [100, 50, 100],
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
