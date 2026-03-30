"use client";

import { useEffect, useMemo, useState } from "react";

import { isRouteAllowed } from "@/lib/isRouteAllowed";
import { sessionService } from "@/services/session-service";
import { LOGIN_ROLE } from "@/shared/constants";
import { allowedRoutes } from "@/shared/routeConfig";

type AclAction = "read" | "write" | "manage";

export function useACL() {
  const [role, setRole] = useState<LOGIN_ROLE | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    const fetchSessionRole = async () => {
      try {
        const data = await sessionService.getSession();
        if (data.role && Object.values(LOGIN_ROLE).includes(data.role)) {
          setRole(data.role);
        }
      } catch (error) {
        console.error("Failed to resolve ACL role:", error);
      } finally {
        setIsResolved(true);
      }
    };

    void fetchSessionRole();
  }, []);

  const resolvedRole = role;

  const currentAllowedRoutes = useMemo(() => {
    if (!resolvedRole) return [];
    return [...(allowedRoutes[resolvedRole] ?? [])];
  }, [resolvedRole]);

  const hasAccess = (route: string): boolean =>
    isRouteAllowed(route, currentAllowedRoutes);

  const can = (action: AclAction, resource: string): boolean => {
    // Parameters are part of the ACL API; we don't enforce permissions yet.
    void action;
    void resource;
    return isResolved;
  };

  return {
    hasAccess,
    can,
    role: resolvedRole,
    isResolved,
    allowedRoutes: currentAllowedRoutes,
  };
}
