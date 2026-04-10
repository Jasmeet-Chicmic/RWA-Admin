import { getAdminWhitelistRequestsAction } from "@/api/adminKyc";
import ErrorState from "@/components/atoms/ErrorState";
import { getTranslations } from "next-intl/server";
import RegisterPropertyRequestsTable from "./RegisterPropertyRequestsTable";

const DEFAULT_PAGE_SIZE = 10;

const RegisterPropertyRequestsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    skip?: number;
    limit?: number;
    status?: string;
    searchText?: string;
  }>;
}) => {
  try {
    const { skip, limit, status, searchText } = await searchParams;
    const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
    const skipNum = skip ? Number(skip) : 0;
    const statusNum = status ? Number(status) : undefined;

    const res = await getAdminWhitelistRequestsAction({
      skip: skipNum,
      limit: pageSize,
      ...(Number.isFinite(statusNum) ? { status: statusNum } : {}),
      ...(searchText ? { search: searchText } : {}),
    });

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          <RegisterPropertyRequestsTable
            data={res?.items ?? []}
            totalCount={res?.totalCount ?? 0}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching whitelist requests:", error);
    const t = await getTranslations("common");
    return <ErrorState title={t("registerPropertyRequests")} />;
  }
};

export default RegisterPropertyRequestsPage;
