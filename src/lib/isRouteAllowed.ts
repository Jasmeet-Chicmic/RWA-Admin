function normalizePath(path: string): string {
  return path.split("?")[0].replace(/\/$/, "") || "/";
}

function routePatternToRegex(pattern: string): RegExp {
  const normalized = normalizePath(pattern);
  const escaped = normalized
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\[([^\]]+)\\\]/g, "[^/]+");
  return new RegExp(`^${escaped}(\\/.*)?$`);
}

export function isRouteAllowed(
  pathname: string,
  allowedRoutes: string[],
): boolean {
  const normalizedPath = normalizePath(pathname);

  return allowedRoutes.some((allowedRoute) => {
    const normalizedAllowed = normalizePath(allowedRoute);

    if (!normalizedAllowed.includes("[")) {
      if (normalizedPath === normalizedAllowed) return true;
      if (
        normalizedAllowed !== "/" &&
        normalizedPath.startsWith(`${normalizedAllowed}/`)
      ) {
        return true;
      }
      return normalizedAllowed === "/" && normalizedPath === "/";
    }

    return routePatternToRegex(normalizedAllowed).test(normalizedPath);
  });
}
