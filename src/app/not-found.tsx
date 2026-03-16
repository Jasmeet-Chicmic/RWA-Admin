"use client";

import { ROUTES } from "@/shared/routes";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-xl text-gray-600 mt-4">
        {"Oops! The page you're looking for doesn't exist."}
      </p>
      <Link
        href={ROUTES.DASHBOARD_ANALYTICS}
        className="mt-6 inline-block px-6 py-2 bg-blue-600 text-bgwhite rounded hover:bg-blue-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
