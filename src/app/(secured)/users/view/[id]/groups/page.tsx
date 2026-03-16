import { getTranslations } from "next-intl/server";

import { getGroupsAction } from "@/api/groups";
import { AdminGroup } from "@/app/(secured)/groups/helpers/types";
import UserGroupsTable from "./UserGroupsTable";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 10;

const UserGroupsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    searchText?: string;
    skip?: string;
    limit?: string;
    sortKey?: string;
    sortDirection?: string;
  }>;
}) => {
  const { id } = await params;
  const { searchText, skip, limit, sortKey, sortDirection } =
    await searchParams;
  const tGroups = await getTranslations("groups");

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;
  const pageNumber = Math.floor(skipNum / pageSize) + 1;

  try {
    const res = await getGroupsAction({
      pageNumber,
      pageSize,
      userId: id,
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
      <UserGroupsTable
        data={items}
        totalCount={totalCount}
        userId={id}
        searchText={searchText ?? ""}
      />
    );
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return <ErrorState title={tGroups("User Groups")} />;
  }
};

export default UserGroupsPage;
