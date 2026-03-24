import { NextResponse } from "next/server";

type KycDoneRequestBody = {
  propertyId?: string;
  txHash?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as KycDoneRequestBody;

    if (!body?.propertyId || !body?.txHash) {
      return NextResponse.json(
        {
          status: false,
          message: "propertyId and txHash are required",
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
      `${baseUrl.replace(/\/$/, "")}/v1/property-onchain/kyc-done`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: body.propertyId,
          txHash: body.txHash,
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
          error instanceof Error ? error.message : "Failed to report KYC done",
        statusCode: 500,
      },
      { status: 500 },
    );
  }
}
