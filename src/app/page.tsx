import { redirect } from "next/navigation";
import { decrypt } from "@/shared/session";
import { cookies } from "next/headers";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/shared/routes";

export default async function RootPage() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (session?.token) {
    redirect(PRIVATE_ROUTES.DASHBOARD_ANALYTICS);
  }

  redirect(PUBLIC_ROUTES.LOGIN);
}
