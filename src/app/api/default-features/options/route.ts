import { NextRequest, NextResponse } from "next/server";

import { getDefaultFeaturesAction } from "@/api/features";
import { SystemFeature } from "@/shared/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const skip = Number(searchParams.get("skip") ?? "0");
  const limit = Number(searchParams.get("limit") ?? "20");
  const searchText = searchParams.get("searchText") ?? "";

  const res = await getDefaultFeaturesAction(skip, limit, searchText);

  if (!res?.status) {
    return NextResponse.json({ data: [], count: 0 });
  }

  const items = (res.data?.items ?? []) as SystemFeature[];

  return NextResponse.json({
    data: items.map((item) => ({
      label: item.displayName,
      value: item.id,
      featureCode: item.featureCode,
      defaultValue: item.defaultValue,
    })),
    count: res.data?.totalCount ?? items.length,
  });
}
