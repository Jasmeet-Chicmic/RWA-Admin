"use server";

import { API_END_POINTS } from "@/shared/api";
import { postRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";
import { LOGIN_ROLE } from "@/shared/constants";
import { decrypt } from "@/shared/session";
import { cookies } from "next/headers";

export async function loginAction(payload: {
  email: string;
  password: string;
  redirectUrl?: string | null;
}) {
  return await postRequest<
    Omit<ResponseType, "data"> & {
      data: {
        token: string;
        userId: string;
        email: string;
        appleId: string | null;
        firstName: string | null;
        lastName: string | null;
        isProfileCreated: boolean;
        isProfileCompleted: boolean;
        redirectUrl: string | null;
        role: string;
      };
    },
    { email: string; password: string; redirectUrl?: string | null }
  >(API_END_POINTS.LOGIN, {
    ...payload,
    redirectUrl: payload.redirectUrl ?? null,
  });
}

export async function forgotPassowrdAction(payload: { email: string }) {
  return await postRequest<ResponseType, { email: string }>(
    API_END_POINTS.FORGOT_PASSWORD,
    payload,
  );
}

export async function resetPassowordAction({
  resetPasswordToken,
  password,
}: {
  resetPasswordToken: string;
  password: string;
}) {
  return await postRequest<ResponseType, { password: string }>(
    API_END_POINTS.RESET_PASSWORD,
    { password },
    {
      headers: {
        Authorization: resetPasswordToken,
      },
    },
  );
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  const session = await decrypt(sessionToken);
  const role = session?.role;

  const logoutEndpoint =
    role === LOGIN_ROLE.ORGANISATION
      ? API_END_POINTS.LOGOUT_ORGANISATION
      : API_END_POINTS.LOGOUT;

  return await postRequest<ResponseType, object>(logoutEndpoint, {});
}
