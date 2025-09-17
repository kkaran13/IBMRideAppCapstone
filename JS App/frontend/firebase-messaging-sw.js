importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBGcHy8oxKeDgolTXNOj2naQl7VkOejq7c", // "YOUR_API_KEY"
    authDomain: "fcm-demo-5be57.firebaseapp.com", // "YOUR_PROJECT.firebaseapp.com" 
    projectId: "fcm-demo-5be57", // "YOUR_PROJECT_ID" 
    storageBucket:  "fcm-demo-5be57.firebasestorage.app", // "YOUR_PROJECT.appspot.com"
    messagingSenderId: "325809546502", // "YOUR_SENDER_ID" 
    appId: "1:325809546502:web:a7bbcdc71419e83d072a87", // "YOUR_APP_ID" 
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});