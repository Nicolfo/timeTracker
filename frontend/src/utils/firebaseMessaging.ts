import  {initializeApp} from "firebase/app";
import {getToken,getMessaging} from "firebase/messaging"

const firebaseConfig = {
    apiKey: "AIzaSyATiV0l2mg9TDOHifVvBxZzMZg8frN-b4k",
    authDomain: "timetracker-401b1.firebaseapp.com",
    projectId: "timetracker-401b1",
    storageBucket: "timetracker-401b1.firebasestorage.app",
    messagingSenderId: "334321788755",
    appId: "1:334321788755:web:bf47d86043c11a742b23a6",
    measurementId: "G-8K9S2ZFNS3"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);


// Get device token and send it to your backend
export const requestFirebaseNotificationPermission: () => Promise<boolean> = async () => {
    try {

        const token = await getToken(messaging, {
            vapidKey: "BLj9w07uTJ9o9VNfrVb_wSEM1IEZ-uLb4JOdRp-DhMkAV2pPeAZXEl1m9Rwqq8_1XbDmhxZfni5brtdBqC0Blw8",
            serviceWorkerRegistration: await navigator.serviceWorker.ready,
        });

        if (token) {
            console.log("FCM Token:", token);
            try {
                const response = await fetch("/api/device/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({firebaseId: token})
                });
                if (!response.ok) {
                    const errMsg = await response.text();
                    console.error("Failed to register token:", errMsg);
                    return false
                } else
                    return true
            } catch (err) {
                console.error("Error sending FCM token:", err);
                return false
            }
        } else return false
    } catch (err) {
        console.error("An error occurred while retrieving token.", err);
        return false
    }

};