import PendingKycTable from "./PendingKycTable";
import { getAdminPendingKycAction } from "@/api/adminKyc";
import ErrorState from "@/components/atoms/ErrorState";
import { getTranslations } from "next-intl/server";

const DEFAULT_PAGE_SIZE = 10;

const PendingKycPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    skip?: number;
    limit?: number;
  }>;
}) => {
  try {
    const { skip, limit } = await searchParams;
    const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
    const skipNum = skip ? Number(skip) : 0;
    const pageNumber = Math.floor(skipNum / pageSize) + 1;

    const res = await getAdminPendingKycAction({
      page: pageNumber,
      pageSize,
      Status: 1,
    });

    const items = res?.items ?? [];
    const totalCount = res?.totalCount ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          <PendingKycTable data={items} totalCount={totalCount} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching pending kyc:", error);
    const t = await getTranslations("common");
    return <ErrorState title={t("KYC")} />;
  }
};

export default PendingKycPage;

