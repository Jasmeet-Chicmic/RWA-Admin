import { getBroadcastChannelsAction } from "@/api/broadcast";
import { BroadcastChannel } from "../helpers/types";
import BroadcastChannelsTable from "./BroadcastChannelsTable";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 10;

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    searchText?: string;
    skip?: string;
    limit?: string;
  }>;
}) => {
  const { searchText, skip, limit } = await searchParams;

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;

  try {
    const res = await getBroadcastChannelsAction({
      ...(searchText && { searchString: searchText }),
      skip: skipNum,
      limit: pageSize,
    });

    const items: BroadcastChannel[] = res?.data?.items ?? [];
    const totalCount = res?.data?.totalCount ?? 0;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <BroadcastChannelsTable
          data={items}
          totalCount={totalCount}
          searchText={searchText ?? ""}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching broadcast channels:", error);
    return <ErrorState title="broadcast channels" />;
  }
};

export default Page;
