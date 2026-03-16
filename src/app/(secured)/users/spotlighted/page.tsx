import { getTranslations } from "next-intl/server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest } from "@/shared/fetcher";
import {
  GetParamsType,
  ResponseType,
  SORT_DIRECTION,
  User,
} from "@/shared/types";
import SpotlightedUsersTable from "./SpotlightedUsersTable";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 10;

const SpotlightedUsersPage = async ({
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
  const { searchString, skip, limit, sortKey, sortDirection } =
    await searchParams;
  const tUsers = await getTranslations("users");

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;

  let data:
    | (ResponseType & {
        data: {
          items: User[];
          pageNumber: number;
          pageSize: number;
          totalPages: number;
          totalCount: number;
          hasPreviousPage: boolean;
          hasNextPage: boolean;
        };
      })
    | undefined;

  try {
    data = await getRequest<
      ResponseType & {
        data: {
          items: User[];
          pageNumber: number;
          pageSize: number;
          totalPages: number;
          totalCount: number;
          hasPreviousPage: boolean;
          hasNextPage: boolean;
        };
      },
      GetParamsType
    >(API_END_POINTS.USER, {
      ...(searchString && { searchString }),
      skip: skipNum,
      limit: pageSize,
      ...(sortKey &&
        sortDirection && {
          sortBy: sortKey,
          sortDirection: sortDirection,
        }),
      isSpotlighted: true,
    });

    if (data && typeof data === "object" && "status" in data && !data.status) {
      return <ErrorState title={tUsers("Spotlighted Users")} />;
    }
  } catch (error) {
    console.error("Error fetching spotlighted users:", error);
    return <ErrorState title={tUsers("Spotlighted Users")} />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <div className="overflow-x-auto">
        <SpotlightedUsersTable data={data} searchString={searchString ?? ""} />
      </div>
    </div>
  );
};

export default SpotlightedUsersPage;
