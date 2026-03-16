import { getReportedUsersAction } from "@/api/user";
import ReportedUsersTable from "./ReportedUsersTable";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 10;

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    searchString?: string;
    skip?: number;
    limit?: number;
  }>;
}) => {
  const { searchString, skip, limit } = await searchParams;

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;

  try {
    const res = await getReportedUsersAction({
      skip: skipNum,
      limit: pageSize,
      ...(searchString && { searchString }),
    });

    if (res && typeof res === "object" && "status" in res && !res.status) {
      return (
        <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 dark:text-red-400 mb-2">
                {res.message || "Error loading reported users"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          <ReportedUsersTable data={res} searchString={searchString ?? ""} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching reported users:", error);
    return <ErrorState title="reported users" />;
  }
};

export default Page;
