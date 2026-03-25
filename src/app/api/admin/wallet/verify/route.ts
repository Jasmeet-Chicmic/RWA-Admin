import { NextResponse } from "next/server";

type VerifyRequestBody = {
  message?: string;
  signature?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VerifyRequestBody;

    if (!body?.message || !body?.signature) {
      return NextResponse.json(
        {
          status: false,
          message: "message and signature are required",
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

    const authHeader = req.headers.get("authorization");
    const upstreamHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      accept: "application/json",
    };
    if (authHeader) {
      upstreamHeaders.Authorization = authHeader;
    }

    const upstreamResponse = await fetch(
      `${baseUrl.replace(/\/$/, "")}/admin/wallet/verify`,
      {
        method: "POST",
        headers: upstreamHeaders,
        body: JSON.stringify({
          message: body.message,
          signature: body.signature,
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
            : "Failed to verify wallet signature",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
