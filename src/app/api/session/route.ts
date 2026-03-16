// app/api/session/route.ts
import { NextResponse } from "next/server";
import { decrypt, encrypt } from "@/shared/session";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { token } = await req.json();

  const session = await encrypt({ token });
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
  const token = await decrypt((await cookies()).get("session")?.value);

  return NextResponse.json({ token: token?.token || "" });
}
