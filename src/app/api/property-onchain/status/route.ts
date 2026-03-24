import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const propertyId = url.searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json(
        {
          status: false,
          message: "propertyId is required",
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
      `${baseUrl.replace(/\/$/, "")}/v1/property-onchain/status?propertyId=${encodeURIComponent(
        propertyId,
      )}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
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
            : "Failed to fetch onchain status",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
