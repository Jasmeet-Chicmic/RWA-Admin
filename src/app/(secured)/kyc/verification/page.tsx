import IdentityClaimRequestsTable from "./IdentityClaimRequestsTable";
import { getAdminIdentityClaimRequestsAction } from "@/api/adminKyc";
import ErrorState from "@/components/atoms/ErrorState";
import { getTranslations } from "next-intl/server";

const DEFAULT_PAGE_SIZE = 10;

const KycVerificationPage = async ({
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

    const res = await getAdminIdentityClaimRequestsAction({
      page: pageNumber,
      pageSize,
    });

    const items = res?.items ?? [];
    const totalCount = res?.totalCount ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          <IdentityClaimRequestsTable data={items} totalCount={totalCount} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching identity claim requests:", error);
    const t = await getTranslations("common");
    return <ErrorState title={t("kyc")} />;
  }
};

export default KycVerificationPage;
