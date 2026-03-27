import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/shared/session";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "./shared/routes";
import { LOGIN_ROLE } from "./shared/constants";

const protectedRoutes = Object.values(PRIVATE_ROUTES);
const publicRoutes = Object.values(PUBLIC_ROUTES);

/** Path without basePath is used in middleware; prepend basePath for redirect URLs. */
function withBasePath(req: NextRequest, path: string): string {
  const basePath = req.nextUrl.basePath ?? "";
  return basePath ? `${basePath}${path}` : path;
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log("🔥 Middleware is running:", path);

  // 1. Decrypt the session from the cookie
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (path === "/" || path === "") {
    let redirectPath = PUBLIC_ROUTES.LOGIN;
    if (session?.token) {
      redirectPath =
        session.role === LOGIN_ROLE.ORGANISATION
          ? PRIVATE_ROUTES.ORGANISATIONS_PROPERTIES
          : PRIVATE_ROUTES.DASHBOARD_ANALYTICS;
    }

    return NextResponse.redirect(
      new URL(withBasePath(req, redirectPath), req.nextUrl),
    );
  }

  // 2. Check if the current route is protected or public
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.token) {
    return NextResponse.redirect(
      new URL(withBasePath(req, PUBLIC_ROUTES.LOGIN), req.nextUrl),
    );
  }

  // 4. Redirect to appropriate home page if the user is authenticated and tries to access public routes
  if (isPublicRoute && session?.token) {
    const isOrganisation = session.role === LOGIN_ROLE.ORGANISATION;
    const redirectPath = isOrganisation
      ? PRIVATE_ROUTES.ORGANISATIONS_PROPERTIES
      : PRIVATE_ROUTES.DASHBOARD_ANALYTICS;

    if (!req.nextUrl.pathname.startsWith(redirectPath)) {
      return NextResponse.redirect(
        new URL(withBasePath(req, redirectPath), req.nextUrl),
      );
    }
  }

  // 5. Restrict Organisation users to ONLY access the Properties route
  if (
    session?.token &&
    session.role === LOGIN_ROLE.ORGANISATION &&
    isProtectedRoute &&
    path !== PRIVATE_ROUTES.ORGANISATIONS_PROPERTIES
  ) {
    console.log("🚫 Organisation access restricted:", path);
    return NextResponse.redirect(
      new URL(
        withBasePath(req, PRIVATE_ROUTES.ORGANISATIONS_PROPERTIES),
        req.nextUrl,
      ),
    );
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
