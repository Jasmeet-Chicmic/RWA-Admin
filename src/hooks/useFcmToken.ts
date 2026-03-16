"use client";
import { useState, useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/firebase";
import { toast } from "react-toastify";

export const useFCMToken = () => {
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState<NotificationPermission>("default");

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermissionStatus(permission);
      if (permission === "granted") {
        await retrieveToken();
      }
    }
  };

  const retrieveToken = async () => {
    try {
      if (!messaging) return;
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      localStorage.setItem("fcmToken", token);
      console.log("FCM Token:", token);
    } catch (error) {
      console.error("Error retrieving FCM token:", error);
    }
  };
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      messaging
    ) {
      requestNotificationPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      messaging &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground push notification received:", payload);
        const { title, body } = payload.notification || {};
        if (title && body) {
          toast.info(`${title}: ${body}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      });
      return () => unsubscribe();
    }
  }, []);
  if (typeof window == "undefined") return;
  const fcmToken = localStorage.getItem("fcmToken");
  return {
    fcmToken,
    notificationPermissionStatus,
  };
};
