import { getGroupsAction } from "@/api/groups";
import { AdminGroup } from "../helpers/types";
import GroupsTable from "./GroupsTable";
import { SORT_DIRECTION } from "@/shared/types";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 10;

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    searchText?: string;
    skip?: string;
    limit?: string;
    sortKey?: string;
    sortDirection?: SORT_DIRECTION;
    type?: string;
    isClosed?: string;
    isDraft?: string;
    isActive?: string;
  }>;
}) => {
  const {
    searchText,
    skip,
    limit,
    sortKey,
    sortDirection,
    type,
    isClosed,
    isDraft,
    isActive,
  } = await searchParams;

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;
  const pageNumber = Math.floor(skipNum / pageSize) + 1;

  try {
    const res = await getGroupsAction({
      pageNumber,
      pageSize,
      type,
      isClosed,
      isDraft,
      isActive,
      ...(searchText && { searchText }),
      ...(sortKey &&
        sortDirection && {
          sortBy: sortKey,
          sortDirection: sortDirection,
        }),
    });

    const items: AdminGroup[] = res?.data ?? [];
    const totalCount = res?.total_count ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <GroupsTable
          data={items}
          totalCount={totalCount}
          searchText={searchText ?? ""}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching groups:", error);
    return <ErrorState title="groups" />;
  }
};

export default Page;
