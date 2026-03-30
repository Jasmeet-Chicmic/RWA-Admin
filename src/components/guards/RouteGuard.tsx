"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import Loader from "@/components/atoms/Loader/Loader";
import { useACL } from "@/hooks/useAcl";
import { fallbackRouteByRole } from "@/shared/routeConfig";

type RouteGuardProps = {
  children: React.ReactNode;
};

const RouteGuard = ({ children }: RouteGuardProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isResolved, role, hasAccess } = useACL();

  useEffect(() => {
    if (!isResolved || !role) return;

    if (!hasAccess(pathname)) {
      router.replace(fallbackRouteByRole[role]);
    }
  }, [hasAccess, isResolved, pathname, role, router]);

  if (!isResolved) {
    return (
      <div className="min-h-[160px] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (role && !hasAccess(pathname)) {
    return (
      <div className="min-h-[160px] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
