/**
 * This API route is intentionally server-side only.
 * Reason: manages encrypted httpOnly session cookies.
 * Do NOT migrate this to a client-side service.
 */
import { decrypt, encrypt } from "@/shared/session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, role } = await req.json();

  const session = await encrypt({ token, role });
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });

  return NextResponse.json({ message: "Session created" });
}

export async function DELETE() {
  (await cookies()).delete("session");

  return NextResponse.json({ message: "Session deleted" });
}

export async function GET() {
  const payload = await decrypt((await cookies()).get("session")?.value);

  return NextResponse.json({
    token: payload?.token || "",
    role: payload?.role || "",
  });
}
