import { getTranslations } from "next-intl/server";

import { getAdminTransactionsAction } from "@/api/adminTransactions";
import ErrorState from "@/components/atoms/ErrorState";
import { Transaction } from "@/shared/types";
import UserTransactionsTable from "./UserTransactionsTable";

const DEFAULT_PAGE_SIZE = 10;

const UserTransactionsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    skip?: string;
    limit?: string;
  }>;
}) => {
  const { id } = await params;
  const { skip, limit } = await searchParams;
  const tTransactions = await getTranslations("transactions");

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;
  const pageNumber = Math.floor(skipNum / pageSize) + 1;

  try {
    const res = await getAdminTransactionsAction({
      ownerId: id,
      page: pageNumber,
      pageSize,
    });

    const transactions: Transaction[] = res?.data?.transactions ?? [];
    const totalCount = res?.data?.totalCount ?? transactions.length;

    return (
      <UserTransactionsTable data={transactions} totalCount={totalCount} />
    );
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return <ErrorState title={tTransactions("Transactions")} />;
  }
};

export default UserTransactionsPage;
