// Install event — skip waiting so the new SW takes over immediately (optional)
import {precacheAndRoute} from 'workbox-precaching'
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {getMessaging, onBackgroundMessage} from "firebase/messaging/sw";

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing new service worker...');
    self.skipWaiting(); // Activate new SW immediately
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating new service worker...');
    event.waitUntil(self.clients.claim()); // Take control of pages immediately
});


precacheAndRoute(self.__WB_MANIFEST)

const firebaseConfig = {
    apiKey: "AIzaSyATiV0l2mg9TDOHifVvBxZzMZg8frN-b4k",
    authDomain: "timetracker-401b1.firebaseapp.com",
    projectId: "timetracker-401b1",
    storageBucket: "timetracker-401b1.firebasestorage.app",
    messagingSenderId: "334321788755",
    appId: "1:334321788755:web:bf47d86043c11a742b23a6",
    measurementId: "G-8K9S2ZFNS3"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);





// Fetch event — do nothing, let the browser handle all requests (bypass all)
self.addEventListener('fetch', (event) => {
    // No event.respondWith() — means requests are not intercepted
});