import { LOGIN_ROLE } from "@/shared/constants";
import { fallbackRouteByRole } from "@/shared/routeConfig";
import { PUBLIC_ROUTES } from "@/shared/routes";
import { decrypt } from "@/shared/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const cookie = (await cookies()).get("session")?.value;
  const session = (await decrypt(cookie)) as {
    token?: string;
    role?: LOGIN_ROLE;
  } | null;

  if (session?.token && session.role) {
    redirect(fallbackRouteByRole[session.role]);
  }

  redirect(PUBLIC_ROUTES.LOGIN);
}
