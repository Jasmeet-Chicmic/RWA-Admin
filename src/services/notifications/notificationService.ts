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

const renderToastContent = (payload: NotificationPayload) => {
  const title = payload.title?.trim();
  const description = payload.body?.trim();

  if (!title && !description) return null;

  // `react-toastify` supports string content; keep services free of JSX/React.
  return title && description
    ? `${title}\n${description}`
    : (title ?? description);
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
    const content = renderToastContent(payload);
    if (!content) return;
    toast.info(content, { onClick: () => handleNotificationClick(payload) });
  },
  KYC: (payload) => {
    const content = renderToastContent(payload);
    if (!content) return;
    toast.warning(content, { onClick: () => handleNotificationClick(payload) });
  },
  PROPERTY: (payload) => {
    const content = renderToastContent(payload);
    if (!content) return;
    toast.success(content, { onClick: () => handleNotificationClick(payload) });
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

    const handlerKey: NotificationType =
      typeof notificationPayload.type === "string"
        ? notificationPayload.type
        : "PROPERTY";

    const handler = handlerMap[handlerKey];
    if (handler) {
      handler(notificationPayload);
    } else {
      // Default fallback toast
      const content = renderToastContent(notificationPayload);
      if (!content) return;
      toast.info(content, {
        onClick: () => handleNotificationClick(notificationPayload),
      });
    }
  });
};
