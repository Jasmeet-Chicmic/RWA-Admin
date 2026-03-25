import { NextResponse } from "next/server";

type LoginRequestBody = {
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginRequestBody;

    if (!body?.email || !body?.password) {
      return NextResponse.json(
        {
          status: false,
          message: "email and password are required",
          statusCode: 400,
        },
        { status: 400 },
      );
    }

    const baseUrl = process.env.NEXT_NODE_API_URL;
    if (!baseUrl) {
      return NextResponse.json(
        {
          status: false,
          message: "Missing required env var: NEXT_NODE_API_URL",
          statusCode: 500,
        },
        { status: 500 },
      );
    }

    const upstreamResponse = await fetch(
      `${baseUrl.replace(/\/$/, "")}/admin/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          email: body.email,
          password: body.password,
        }),
        cache: "no-store",
      },
    );

    const responseText = await upstreamResponse.text();
    const payload = responseText ? JSON.parse(responseText) : null;

    return NextResponse.json(payload, { status: upstreamResponse.status });
  } catch (error) {
    return NextResponse.json(
      {
        status: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to perform login request",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
