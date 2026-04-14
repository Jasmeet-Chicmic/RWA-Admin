import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications not supported in this browser");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) return null;

  try {
    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (currentToken) {
      localStorage.setItem("fcm_token", currentToken);
      return currentToken;
    } else {
      console.warn(
        "No registration token available. Request permission to generate one.",
      );
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving token:", error);
    return null;
  }
};

export const handleTokenRefresh = () => {
  // FCM automatically handles token refresh in most cases.
  // We can listen for token refresh if needed by checking storage or using specific FCM hooks if available.
  // For standard web implementation, we usually just get the token on app load.
};
