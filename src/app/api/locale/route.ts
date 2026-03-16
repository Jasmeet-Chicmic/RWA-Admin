// app/api/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { locale } = await req.json();

  (await cookies()).set("locale", locale, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + 60 * 60 * 24 * 365), // 1 year
  });

  return NextResponse.json({ message: "locale created" });
}

export async function GET() {
  const locale = (await cookies()).get("locale")?.value || "en";

  return NextResponse.json({ locale });
}
