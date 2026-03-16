import { getTranslations } from "next-intl/server";

import { getEventsAction } from "@/api/events";
import { AdminEvent } from "@/app/(secured)/events/helpers/types";
import UserEventsTable from "./UserEventsTable";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 10;

const UserEventsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    searchText?: string;
    skip?: string;
    limit?: string;
  }>;
}) => {
  const { id } = await params;
  const { searchText, skip, limit } = await searchParams;
  const tEvents = await getTranslations("events");

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;
  const pageNumber = Math.floor(skipNum / pageSize) + 1;

  try {
    const res = await getEventsAction({
      pageNumber,
      pageSize,
      userId: id,
      ...(searchText && { searchText }),
    });

    const items: AdminEvent[] = res?.data ?? [];
    const totalCount = res?.total_count ?? items.length;

    return (
      <UserEventsTable
        data={items}
        totalCount={totalCount}
        userId={id}
        searchText={searchText ?? ""}
      />
    );
  } catch (error) {
    console.error("Error fetching user events:", error);
    return <ErrorState title={tEvents("User Events")} />;
  }
};

export default UserEventsPage;
