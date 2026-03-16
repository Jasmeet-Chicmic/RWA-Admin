import { getAdminSubscriptionsAction } from "@/api/adminSubscriptions";
import { Subscription } from "@/shared/types";
import SubscriptionsTable from "./SubscriptionsTable";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 10;

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    searchText?: string;
    skip?: string;
    limit?: string;
    sortKey?: string;
    sortDirection?: string;
    ownerType?: string;
    status?: string;
    billingCycle?: string;
  }>;
}) => {
  const {
    searchText,
    skip,
    limit,
    sortKey,
    sortDirection,
    ownerType,
    status,
    billingCycle,
  } = await searchParams;

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;
  const pageNumber = Math.floor(skipNum / pageSize) + 1;

  try {
    const res = await getAdminSubscriptionsAction({
      pageNumber,
      pageSize,
      ...(searchText && { search: searchText }),
      ...(sortKey &&
        sortDirection && {
          sortBy: sortKey,
          sortDirection: sortDirection,
        }),
      ...(ownerType !== undefined && { ownerType: Number(ownerType) }),
      ...(status !== undefined && { status: Number(status) }),
      ...(billingCycle !== undefined && { billingCycle: Number(billingCycle) }),
    });

    const subscriptions: Subscription[] = res?.data?.items ?? [];
    const totalCount = res?.data?.totalCount ?? subscriptions.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <SubscriptionsTable
          data={subscriptions}
          totalCount={totalCount}
          searchText={searchText ?? ""}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return <ErrorState title="subscriptions" />;
  }
};

export default Page;
