"use client";

import React, { useEffect, useState } from "react";
import { loadingManager } from "@/lib/loadingManager";
import Loader from "@/components/atoms/Loader";

const GlobalLoader: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return loadingManager.subscribe(setLoading);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Loader />
    </div>
  );
};

export default GlobalLoader;
