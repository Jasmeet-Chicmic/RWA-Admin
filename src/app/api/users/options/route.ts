import { NextRequest, NextResponse } from "next/server";

import { getUsersAction } from "@/api/user";
import { GetParamsType, User } from "@/shared/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const skip = Number(searchParams.get("skip") ?? "0");
  const limit = Number(searchParams.get("limit") ?? "20");
  const searchString = searchParams.get("searchString") ?? "";

  const params: GetParamsType = {
    skip,
    limit,
    ...(searchString && { searchString }),
    isSpotlighted: false,
  };

  const res = await getUsersAction(params);

  if (!res?.status) {
    return NextResponse.json({ data: [], count: 0 });
  }

  const items = (res.data?.items ?? []) as User[];

  return NextResponse.json({
    data: items.map((user) => ({
      value: user.userId,
      label: user.email
        ? `${user.fullName || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()} (${user.email})`
        : user.fullName ||
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    })),
    count: res.data?.totalCount ?? items.length,
  });
}
