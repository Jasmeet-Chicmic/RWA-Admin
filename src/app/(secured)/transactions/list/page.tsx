import { getAdminTransactionsAction } from "@/api/adminTransactions";
import { Transaction } from "@/shared/types";
import TransactionsTable from "./TransactionsTable";
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
    minAmount?: string;
    maxAmount?: string;
    refundsOnly?: string;
    creditsOnly?: string;
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
    minAmount,
    maxAmount,
    refundsOnly,
    creditsOnly,
  } = await searchParams;

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;
  const pageNumber = Math.floor(skipNum / pageSize) + 1;

  try {
    const res = await getAdminTransactionsAction({
      pageNumber,
      pageSize,
      ...(searchText && { searchText }),
      ...(sortKey &&
        sortDirection && {
          sortBy: sortKey,
          sortDirection: sortDirection,
        }),
      ...(ownerType !== undefined && { ownerType: Number(ownerType) }),
      ...(status !== undefined && { status: Number(status) }),
      ...(minAmount !== undefined && { minAmount: Number(minAmount) }),
      ...(maxAmount !== undefined && { maxAmount: Number(maxAmount) }),
      ...(refundsOnly !== undefined && { refundsOnly: refundsOnly === "true" }),
      ...(creditsOnly !== undefined && { creditsOnly: creditsOnly === "true" }),
    });

    const transactions: Transaction[] = res?.data?.transactions ?? [];
    const totalCount = res?.data?.totalCount ?? transactions.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <TransactionsTable
          data={
            transactions as (Transaction & {
              ownerId: string;
              ownerType: number;
            })[]
          }
          totalCount={totalCount}
          searchText={searchText ?? ""}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return <ErrorState title="transactions" />;
  }
};

export default Page;
