import { decrypt } from "@/shared/session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isRouteAllowed } from "./lib/isRouteAllowed";
import { LOGIN_ROLE } from "./shared/constants";
import {
  allowedRoutes,
  fallbackRouteByRole,
  protectedRoutes,
  publicRoutes,
} from "./shared/routeConfig";
import { PUBLIC_ROUTES } from "./shared/routes";

/** Path without basePath is used in middleware; prepend basePath for redirect URLs. */
function withBasePath(req: NextRequest, path: string): string {
  const basePath = req.nextUrl.basePath ?? "";
  return basePath ? `${basePath}${path}` : path;
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const cookie = (await cookies()).get("session")?.value;
  const session = (await decrypt(cookie)) as {
    token?: string;
    role?: LOGIN_ROLE;
  } | null;

  if (path === "/" || path === "") {
    let redirectPath = PUBLIC_ROUTES.LOGIN;
    if (session?.token && session.role) {
      redirectPath = fallbackRouteByRole[session.role];
    }

    return NextResponse.redirect(
      new URL(withBasePath(req, redirectPath), req.nextUrl),
    );
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    isRouteAllowed(path, [route]),
  );
  const isPublicRoute = publicRoutes.some((route) =>
    isRouteAllowed(path, [route]),
  );

  if (isProtectedRoute && !session?.token) {
    return NextResponse.redirect(
      new URL(withBasePath(req, PUBLIC_ROUTES.LOGIN), req.nextUrl),
    );
  }

  if (isPublicRoute && session?.token && session.role) {
    const redirectPath = fallbackRouteByRole[session.role];

    if (!isRouteAllowed(req.nextUrl.pathname, [redirectPath])) {
      return NextResponse.redirect(
        new URL(withBasePath(req, redirectPath), req.nextUrl),
      );
    }
  }

  if (session?.token && session?.role && isProtectedRoute) {
    const roleRoutes = allowedRoutes[session.role] ?? [];
    if (!isRouteAllowed(path, [...roleRoutes])) {
      const fallbackRoute = fallbackRouteByRole[session.role];
      return NextResponse.redirect(
        new URL(withBasePath(req, fallbackRoute), req.nextUrl),
      );
    }
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
