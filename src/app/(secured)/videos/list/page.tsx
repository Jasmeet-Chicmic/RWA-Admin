import { getTranslations } from "next-intl/server";

import { getVideosAction } from "@/api/videos";
import { Video } from "../helpers/types";
import VideosTable from "../list/VideosTable";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 10;

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    searchText?: string;
    skip?: number;
    limit?: number;
    sortKey?: string;
    sortDirection?: string;
  }>;
}) => {
  const { searchText, skip, limit, sortDirection } = await searchParams;
  const tVideos = await getTranslations("videos");

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;
  const sortDir = sortDirection === "desc" || sortDirection === "-1" ? -1 : 1;

  try {
    const res = await getVideosAction({
      skip: skipNum,
      limit: pageSize,
      sortDirection: sortDir,
      ...(searchText && { searchText }),
    });

    const items: Video[] = res?.data?.items ?? [];
    const totalCount = res?.data?.totalCount ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <VideosTable
          data={items}
          totalCount={totalCount}
          searchText={searchText ?? ""}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching videos:", error);
    return <ErrorState title={tVideos("Videos")} />;
  }
};

export default Page;
