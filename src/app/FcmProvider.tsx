"use client";
import { useEffect } from "react";
import {
  requestNotificationPermission,
  getFCMToken,
} from "@/services/notifications/tokenManager";
import { initializeForegroundListener } from "@/services/notifications/notificationService";

const FcmProvider = () => {
  useEffect(() => {
    const setupFCM = async () => {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        await getFCMToken();
        const unsubscribe = initializeForegroundListener();
        return () => unsubscribe();
      }
    };

    setupFCM();
  }, []);

  return null;
};

export default FcmProvider;
