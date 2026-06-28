/* firebase-messaging-sw.js
 * Service worker do Firebase Cloud Messaging — recebe notificações Web Push
 * quando a aba está fechada/em segundo plano.
 *
 * A config do Firebase é PÚBLICA (NEXT_PUBLIC_*) e é passada via query string
 * no register() do cliente, então este arquivo não embute nenhum segredo.
 */
/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js",
);

const params = new URL(self.location).searchParams;
const firebaseConfig = {
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};

if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title =
      (payload.notification && payload.notification.title) ||
      (payload.data && payload.data.title) ||
      "LeadBellus";
    const options = {
      body:
        (payload.notification && payload.notification.body) ||
        (payload.data && payload.data.body) ||
        "",
      icon: "/LEADBELLUS.png",
      badge: "/LEADBELLUS.png",
      data: payload.data || {},
    };
    self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((wins) => {
        const hit = wins.find((w) => w.url.includes(url));
        if (hit) return hit.focus();
        return clients.openWindow(url);
      }),
  );
});
