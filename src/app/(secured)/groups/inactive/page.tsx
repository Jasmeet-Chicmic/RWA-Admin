import { getInactiveGroupsAction } from "@/api/groups";
import InactiveGroupsTable from "../list/InactiveGroupsTable";
import { SORT_DIRECTION } from "@/shared/types";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_DAYS_INACTIVE = 7;
const DEFAULT_PAGE_SIZE = 10;

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    daysInactive?: string;
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
    daysInactive: daysParam,
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

  const daysInactive = daysParam ? Number(daysParam) : DEFAULT_DAYS_INACTIVE;
  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;
  const pageNumber = Math.floor(skipNum / pageSize) + 1;

  try {
    const res = await getInactiveGroupsAction({
      daysInactive: Number.isFinite(daysInactive)
        ? daysInactive
        : DEFAULT_DAYS_INACTIVE,
      pageNumber,
      pageSize,
      ...(searchText && { searchText }),
      ...(type && { type }),
      ...(isClosed && { isClosed }),
      ...(isDraft && { isDraft }),
      ...(isActive && { isActive }),
      ...(sortKey &&
        sortDirection && {
          sortBy: sortKey,
          sortDirection: sortDirection,
        }),
    });
    const items = res?.data ?? [];
    const totalCount = res?.total_count ?? 0;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <InactiveGroupsTable
          data={items}
          totalCount={totalCount}
          searchText={searchText ?? ""}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching inactive groups", error);
    return <ErrorState title="inactive groups" />;
  }
};

export default Page;
