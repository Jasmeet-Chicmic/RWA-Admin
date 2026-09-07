import KycReviewDetailContent from "./KycReviewDetailContent";
import { getKycReviewDetailAction } from "@/api/adminKyc";
import ErrorState from "@/components/atoms/ErrorState";
import { getTranslations } from "next-intl/server";

const KycReviewDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  try {
    const { id } = await params;
    const detail = await getKycReviewDetailAction(id);

    if (!detail?.id) {
      const t = await getTranslations("common");
      return <ErrorState title={t("kyc")} />;
    }

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <KycReviewDetailContent detail={detail} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching kyc review detail:", error);
    const t = await getTranslations("common");
    return <ErrorState title={t("kyc")} />;
  }
};

export default KycReviewDetailPage;
