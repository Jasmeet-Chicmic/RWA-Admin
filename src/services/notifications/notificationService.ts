import { onMessage, MessagePayload } from "firebase/messaging";
import { messaging } from "./firebase";
import { NotificationPayload, NotificationType } from "./notificationTypes";
import { toast } from "react-toastify";
import { PRIVATE_ROUTES } from "@/shared/routes";

/**
 * Handle notification click and redirect to the relevant page
 */
export const handleNotificationClick = (payload: NotificationPayload) => {
  const { type, data } = payload;

  // Base path from environment or default
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  switch (type) {
    case "TRANSACTION":
      window.location.href = `${basePath}${PRIVATE_ROUTES.TRANSACTIONS_LIST}`;
      break;
    case "KYC":
      window.location.href = `${basePath}${PRIVATE_ROUTES.KYC_VERIFICATION}`;
      break;
    case "PROPERTY":
      const propertyId = data?.propertyId;
      if (propertyId) {
        // Assuming property view route exists or dashboard
        window.location.href = `${basePath}${PRIVATE_ROUTES.PROPERTIES_LIST}`;
      } else {
        window.location.href = `${basePath}${PRIVATE_ROUTES.PROPERTIES_LIST}`;
      }
      break;
    default:
      console.warn("Unknown notification type:", type);
      break;
  }
};

/**
 * Global handler map for foreground notifications
 * This allows adding new notification types easily.
 */
const handlerMap: Record<
  NotificationType,
  (payload: NotificationPayload) => void
> = {
  TRANSACTION: (payload) => {
    toast.info(`Transaction Update: ${payload.body}`, {
      onClick: () => handleNotificationClick(payload),
    });
  },
  KYC: (payload) => {
    toast.warning(`KYC Alert: ${payload.body}`, {
      onClick: () => handleNotificationClick(payload),
    });
  },
  PROPERTY: (payload) => {
    toast.success(`Property Update: ${payload.body}`, {
      onClick: () => handleNotificationClick(payload),
    });
  },
};

/**
 * Initialize the foreground notification listener
 */
export const initializeForegroundListener = () => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload: MessagePayload) => {
    console.log("Foreground message received:", payload);

    const notificationPayload: NotificationPayload = {
      type: (payload.data?.type as NotificationType) || "PROPERTY", // Default or extract from data
      title: payload.notification?.title,
      body: payload.notification?.body,
      data: payload.data as Record<string, string>,
    };

    const handler = handlerMap[notificationPayload.type];
    if (handler) {
      handler(notificationPayload);
    } else {
      // Default fallback toast
      toast.info(`${notificationPayload.title}: ${notificationPayload.body}`, {
        onClick: () => handleNotificationClick(notificationPayload),
      });
    }
  });
};
