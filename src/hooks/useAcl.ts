"use client";

import { useEffect, useMemo, useState } from "react";

import { isRouteAllowed } from "@/lib/isRouteAllowed";
import { sessionService } from "@/services/session-service";
import { LOGIN_ROLE } from "@/shared/constants";
import { allowedRoutes } from "@/shared/routeConfig";

type AclAction = "read" | "write" | "manage";

function isValidLoginRole(value: unknown): value is LOGIN_ROLE {
  return (
    typeof value === "string" &&
    Object.values(LOGIN_ROLE).includes(value as LOGIN_ROLE)
  );
}

/**
 * @param initialRoleFromServer Role from the server layout (decrypted session).
 * When set, ACL resolves immediately so RouteGuard does not wait on GET /api/session.
 */
export function useACL(initialRoleFromServer?: LOGIN_ROLE | null) {
  const hasServerRole = isValidLoginRole(initialRoleFromServer);

  const [role, setRole] = useState<LOGIN_ROLE | null>(() =>
    hasServerRole ? initialRoleFromServer : null,
  );
  const [isResolved, setIsResolved] = useState(() => hasServerRole);

  useEffect(() => {
    if (isValidLoginRole(initialRoleFromServer)) {
      return;
    }

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
  }, [initialRoleFromServer]);

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
