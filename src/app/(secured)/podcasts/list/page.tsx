import { SORT_DIRECTION } from "@/shared/types";
import { getPodcastsAction } from "@/api/podcasts";
import PodcastsTable from "./PodcastsTable";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 10;

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    searchString?: string;
    skip?: number;
    limit?: number;
    sortKey?: string;
    sortDirection?: SORT_DIRECTION;
  }>;
}) => {
  const { searchString, skip, limit } = await searchParams;

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const pageNumber =
    skip && limit ? Math.floor(Number(skip) / Number(limit)) + 1 : 1;

  try {
    const res = await getPodcastsAction({
      pageNumber,
      pageSize,
      searchText: searchString,
    });

    const items = res?.data?.data ?? [];
    const totalCount = res?.data?.total_count ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <PodcastsTable
          data={items}
          totalCount={totalCount}
          searchString={searchString || ""}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    return <ErrorState title="podcasts" />;
  }
};

export default Page;
