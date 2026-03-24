import { NextResponse } from "next/server";

type InitiateRequestBody = {
  propertyId?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as InitiateRequestBody;

    if (!body?.propertyId) {
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
      `${baseUrl.replace(/\/$/, "")}/v1/property-onchain/initiate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: body.propertyId,
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
            : "Failed to initiate onchain property tracking",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
