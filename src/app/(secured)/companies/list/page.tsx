import { getCompaniesAction } from "@/api/companies";
import { AdminCompany } from "../helpers/types";
import CompaniesTable from "./CompaniesTable";
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
  }>;
}) => {
  const { searchText, skip, limit, sortKey, sortDirection } =
    await searchParams;

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;
  const pageNumber = Math.floor(skipNum / pageSize) + 1;

  try {
    const res = await getCompaniesAction({
      pageNumber,
      pageSize,
      ...(searchText && { searchText }),
      ...(sortKey &&
        sortDirection && {
          sortBy: sortKey,
          sortDirection: sortDirection,
        }),
    });

    const items: AdminCompany[] = res?.data ?? [];
    const totalCount = res?.total_count ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <CompaniesTable
          data={items}
          totalCount={totalCount}
          searchText={searchText ?? ""}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching companies:", error);
    return <ErrorState title="companies" />;
  }
};

export default Page;
