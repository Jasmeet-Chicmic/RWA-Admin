import { getRolesAction } from "@/api/roles";
import RolesTable from "./RolesTable";
import { SORT_DIRECTION } from "@/shared/types";

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
  const { searchText } = await searchParams;

  try {
    const res = await getRolesAction();
    const items = res?.data ?? [];

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <RolesTable
          data={items}
          totalCount={items.length}
          searchText={searchText ?? ""}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching roles:", error);
    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 dark:text-red-400 mb-2">
              Roles list failed to load.
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default Page;
