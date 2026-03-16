import { getEventsAction } from "@/api/events";
import { AdminEvent } from "../helpers/types";
import EventsTable from "./EventsTable";
import { SORT_DIRECTION } from "@/shared/types";
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
    sortDirection?: SORT_DIRECTION;
    status?: string;
    eventCategory?: string;
    format?: string;
    ticketType?: string;
    startDateFrom?: string;
    startDateTo?: string;
  }>;
}) => {
  const {
    searchText,
    skip,
    limit,
    sortKey,
    sortDirection,
    status,
    eventCategory,
    format,
    ticketType,
    startDateFrom,
    startDateTo,
  } = await searchParams;

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;
  const pageNumber = Math.floor(skipNum / pageSize) + 1;

  try {
    const res = await getEventsAction({
      pageNumber,
      pageSize,
      ...(searchText && { searchText }),
      ...(sortKey &&
        sortDirection && {
          sortBy: sortKey,
          sortDirection: sortDirection,
        }),
      ...(status !== undefined && { status: Number(status) }),
      ...(eventCategory !== undefined && {
        eventCategory: Number(eventCategory),
      }),
      ...(format !== undefined && { format: Number(format) }),
      ...(ticketType !== undefined && { ticketType: Number(ticketType) }),
      ...(startDateFrom && { startDateFrom }),
      ...(startDateTo && { startDateTo }),
    });

    const items: AdminEvent[] = res?.data ?? [];
    const totalCount = res?.total_count ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <EventsTable
          data={items}
          totalCount={totalCount}
          searchText={searchText ?? ""}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return <ErrorState title="events" />;
  }
};

export default Page;
