"use client";
import { useEffect } from "react";
import {
  requestNotificationPermission,
  getFCMToken,
} from "@/services/notifications/tokenManager";
import { initializeForegroundListener } from "@/services/notifications/notificationService";

const FcmProvider = () => {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission || cancelled) return;

      await getFCMToken();
      if (cancelled) return;

      unsubscribe = initializeForegroundListener();
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return null;
};

export default FcmProvider;
