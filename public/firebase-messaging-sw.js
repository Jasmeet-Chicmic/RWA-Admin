// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Background message received:",
    payload,
  );

  const notificationTitle = payload.notification?.title || "Project Alert";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/admin-portal/favicon.ico", // Updated to match base path if possible
    data: payload.data, // Preserve data for click handling
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click in background
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const type = event.notification.data?.type;
  const basePath = "/admin-portal"; // Match NEXT_PUBLIC_BASE_PATH

  let targetUrl = `${basePath}/dashboard`;

  if (type === "TRANSACTION") {
    targetUrl = `${basePath}/transactions/list`;
  } else if (type === "KYC") {
    targetUrl = `${basePath}/kyc/verification`;
  } else if (type === "PROPERTY") {
    targetUrl = `${basePath}/properties`;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
