"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest } from "@/shared/fetcher";
import { decrypt } from "@/shared/session";
import { LOGIN_ROLE } from "@/shared/constants";
import { cookies } from "next/headers";
import { ResponseType } from "@/shared/types";

export type Profile = {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
};

type ProfileResponse = ResponseType & {
  data?: Profile;
};

type CurrentProfileResult = {
  role: LOGIN_ROLE;
  profile: Profile;
};

export async function getCurrentProfileAction(): Promise<CurrentProfileResult> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  const session = await decrypt(sessionToken);

  const role = session?.role as LOGIN_ROLE | undefined;
  if (!role || !Object.values(LOGIN_ROLE).includes(role)) {
    throw new Error("Missing or invalid session role");
  }

  if (role === LOGIN_ROLE.ORGANISATION) {
    const res = await getRequest<ProfileResponse, undefined>(
      API_END_POINTS.ORGANIZATION_PROFILE,
    );
    if (!res?.status) {
      throw new Error(res?.message || "Failed to load organisation profile");
    }
    const profile = res?.data;
    if (!profile?.id) throw new Error("Organisation profile not found");
    return { role, profile };
  }

  const res = await getRequest<ProfileResponse, undefined>(
    API_END_POINTS.ADMIN_PROFILE,
  );
  if (!res?.status) {
    throw new Error(res?.message || "Failed to load admin profile");
  }
  const profile = res?.data;
  if (!profile?.id) throw new Error("Admin profile not found");
  return { role, profile };
}
