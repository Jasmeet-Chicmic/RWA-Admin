"use client";
import { useFCMToken } from "@/hooks/useFcmToken";

const FcmProvider = () => {
  useFCMToken();
  return null;
};

export default FcmProvider;
