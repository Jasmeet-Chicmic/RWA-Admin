"use client";

import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";

import Pagination from "@/components/atoms/Pagination";
import Table, { TableColumn } from "@/components/atoms/Table";
import { TableHeaderWithInfo } from "@/components/atoms/TableHeaderWithInfo";
import { Transaction } from "@/shared/types";
import { PAYMENT_STATUS, PAYMENT_STATUS_LABELS } from "@/shared/constants";
import FormattedDate from "@/components/atoms/FormattedDate";
import { useTableQuerySync } from "@/hooks/useTableQuerySync";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { formatToFixed } from "@/shared/utils/unitUtils";

const PAYMENT_STATUS_BADGE_STYLES: Record<number, string> = {
  [PAYMENT_STATUS.INITIATED]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  [PAYMENT_STATUS.SUCCESS]:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  [PAYMENT_STATUS.FAILED]:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  [PAYMENT_STATUS.REFUNDED]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const DEFAULT_BADGE_STYLE =
  "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";

const getTransactionTypeLabel = (transaction: Transaction): string => {
  if (transaction.isRefund) return "Refund";
  if (transaction.isCredit) return "Credit";
  return "Debit";
};

interface UserTransactionsTableProps {
  data: Transaction[];
  totalCount: number;
}

const UserTransactionsTable = ({
  data,
  totalCount,
}: UserTransactionsTableProps) => {
  const t = useTranslations("transactions");
  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    sortKey,
    sortDirection,
  } = useTableQuerySync({
    defaultPageSize: 10,
    defaultSortKey: "date",
    defaultSortDirection: "DESC",
  });

  const columns: TableColumn<Transaction>[] = [
    {
      title: t("Transaction Date"),
      field: "date",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          {item.date ? <FormattedDate date={item.date} /> : "—"}
        </span>
      ),
      sortable: true,
      sortKey: "date",
    },
    {
      title: t("Invoice Number"),
      field: "invoiceNumber",
      render: (item) => (
        <span className={`font-medium ${TEXT_PRIMARY}`}>
          {item.invoiceNumber || "—"}
        </span>
      ),
    },
    {
      title: t("Plan Name"),
      field: "planName",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          {item.planName || "—"}
        </span>
      ),
    },
    {
      title: t("Transaction Amount"),
      field: "amount",
      render: (item) => (
        <span className={`font-medium ${TEXT_PRIMARY}`}>
          {item.currency} {formatToFixed(item.amount, 2)}
        </span>
      ),
      sortable: true,
      sortKey: "amount",
    },
    {
      title: (
        <TableHeaderWithInfo
          label={t("Payment Status")}
          options={[
            t("Initiated"),
            t("Success"),
            t("Failed"),
            t("Refunded"),
            t("Unknown"),
          ]}
        />
      ),
      field: "status",
      render: (item) => {
        const statusLabel =
          PAYMENT_STATUS_LABELS[item.status as PAYMENT_STATUS] || "Unknown";
        const badgeStyle =
          PAYMENT_STATUS_BADGE_STYLES[item.status] || DEFAULT_BADGE_STYLE;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeStyle}`}
          >
            {statusLabel}
          </span>
        );
      },
    },
    {
      title: "Payment Method",
      field: "paymentMethodType",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          {item.paymentMethodBrand}
        </span>
      ),
    },
    {
      title: (
        <TableHeaderWithInfo
          label={t("Transaction Type")}
          options={[t("Debit"), t("Credit"), t("Refund")]}
        />
      ),
      field: "isCredit",
      render: (item) => {
        const typeLabel = getTransactionTypeLabel(item);
        const isRefund = item.isRefund;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              isRefund
                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            }`}
          >
            {typeLabel}
          </span>
        );
      },
    },
  ];

  return (
    <div className="min-w-0 w-full overflow-hidden space-y-4 bg-bgwhite dark:bg-darkbgprimary dark:border-darkbordercolor1 border border-b border-bordergray200ordercolor1 rounded-[20px] p-4 lg:p-5 3xl:p-6">
      <div className="bg-bgwhite dark:bg-darkbgprimary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              <CreditCard className="inline-block w-6 h-6 mr-2 -mt-1" />
              {t("Transactions")}
            </h2>
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {t("All payment transactions")}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-bgwhite dark:bg-darkbgprimary overflow-x-auto">
        <Table<Transaction>
          data={data}
          columns={columns}
          keyExtractor={(item) => item.transactionId}
          hideSelectCol
          emptyMessage={t("No transactions found")}
          handleSort={handleSort}
          currentSortKey={sortKey}
          currentSortDirection={sortDirection}
        />
        <Pagination
          totalItems={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          title="transactions"
          className="!pb-0 border-b-0 !px-0"
        />
      </div>
    </div>
  );
};

export default UserTransactionsTable;
