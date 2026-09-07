import KycReviewTable from "./KycReviewTable";
import { getKycReviewQueueAction } from "@/api/adminKyc";
import ErrorState from "@/components/atoms/ErrorState";
import { DEFAULT_KYC_PAGE_SIZE } from "@/constants/kyc";
import { getTranslations } from "next-intl/server";

const KycReviewPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    skip?: string;
    limit?: string;
    sortKey?: string;
    sortDirection?: string;
    searchString?: string;
    level?: string;
  }>;
}) => {
  try {
    const { skip, limit, sortKey, sortDirection, searchString, level } =
      await searchParams;
    const pageSize = limit ? Number(limit) : DEFAULT_KYC_PAGE_SIZE;
    const skipNum = skip ? Number(skip) : 0;

    const res = await getKycReviewQueueAction({
      skip: skipNum,
      limit: pageSize,
      ...(sortKey ? { sortKey: sortKey as "createdAt" | "kycLevel" } : {}),
      ...(sortDirection
        ? { sortDirection: sortDirection as "asc" | "desc" }
        : {}),
      ...(searchString ? { searchString } : {}),
      ...(level ? { level: Number(level) } : {}),
    });

    const items = res?.items ?? [];
    const totalCount = res?.totalCount ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          <KycReviewTable
            data={items}
            totalCount={totalCount}
            searchString={searchString || ""}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching kyc review queue:", error);
    const t = await getTranslations("common");
    return <ErrorState title={t("kyc")} />;
  }
};

export default KycReviewPage;
