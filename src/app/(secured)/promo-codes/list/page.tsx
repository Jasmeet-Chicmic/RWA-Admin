import { PromoCode, SORT_DIRECTION } from "@/shared/types";
import { getAdminPromoCodesAction, AdminPromoCode } from "@/api/promoCodes";
import PromoCodesTable from "./PromoCodesTable";

const PromoCodesListPage = async ({
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

  const response = await getAdminPromoCodesAction({
    searchText,
    skip: skip ? Number(skip) : undefined,
    limit: limit ? Number(limit) : undefined,
    sortKey,
    sortDirection,
  });
  const adminData: AdminPromoCode[] = response?.data?.promoCodes || [];

  // Map new admin promo code structure to existing PromoCode shape used by table
  const promoCodes: PromoCode[] = adminData.map((item) => ({
    _id: item.id,
    id: item.id,
    code: item.code,
    title: item.description,
    description: item.description,
    isActive: item.isActive,
    discountType: item.discountType,
    discountValue: item.discountValue,
    currency: item.currency,
    duration: item.duration,
    durationInMonths: item.durationInMonths,
    validFrom: item.validFrom,
    validUntil: item.validUntil,
    maxRedemptions: item.maxRedemptions,
    redemptionCount: item.redemptionCount,
  }));

  const data = {
    data: promoCodes,
    count: adminData.length,
  };
  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <PromoCodesTable data={data} searchText={searchText ?? ""} />
    </div>
  );
};

export default PromoCodesListPage;
