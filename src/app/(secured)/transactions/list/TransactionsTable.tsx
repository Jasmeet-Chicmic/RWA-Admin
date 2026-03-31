"use client";

import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { toast } from "react-toastify";

import FormattedDate from "@/components/atoms/FormattedDate";
import StatusChip from "@/components/atoms/StatusChip";
import { TableColumn } from "@/components/atoms/Table";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TRANSACTION_STATUS } from "@/constants/trasaction";
import { AdminTransactionItem } from "@/services/transactions-service";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { formatToFixed } from "@/shared/utils/unitUtils";
import TransactionFilters from "./TransactionFilters";

const PAYMENT_STATUS_BADGE_STYLES: Record<number, string> = {
  [TRANSACTION_STATUS.PENDING]:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  [TRANSACTION_STATUS.SUCCESS]:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  [TRANSACTION_STATUS.FAILED]:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

const DEFAULT_BADGE_STYLE =
  "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";

const COPYABLE_CHIP_CLASS =
  "bg-primarycolor/10 text-primarycolor border-primarycolor/30 hover:bg-primarycolor/15 dark:bg-secondarycolor/15 dark:text-secondarycolor dark:border-secondarycolor/30 dark:hover:bg-secondarycolor/25";

interface TransactionsTableProps {
  data: AdminTransactionItem[];
  totalCount: number;
  isLoading?: boolean;
}

const TransactionsTable = ({
  data,
  totalCount,
  isLoading = false,
}: TransactionsTableProps) => {
  const t = useTranslations("transactions");
  const copyValue = useCallback(
    async (value: string) => {
      await navigator.clipboard.writeText(value);
      toast.success(t("copiedToClipboard"));
    },
    [t],
  );

  const getStatusLabel = useCallback(
    (status: number) => {
      switch (status) {
        case TRANSACTION_STATUS.PENDING:
          return t("pending");
        case TRANSACTION_STATUS.SUCCESS:
          return t("success");
        case TRANSACTION_STATUS.FAILED:
          return t("failed");
        default:
          return t("unknown");
      }
    },
    [t],
  );

  const config: DataTableConfig<AdminTransactionItem> = useMemo(() => {
    const columns: TableColumn<AdminTransactionItem>[] = [
      {
        title: t("createdAt"),
        field: "createdAt",
        render: (item: AdminTransactionItem) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.createdAt ? <FormattedDate date={item.createdAt} /> : "—"}
          </span>
        ),
      },
      {
        title: t("buyerAddress"),
        field: "buyerAddress",
        render: (item: AdminTransactionItem) => (
          <button
            onClick={() => copyValue(item.buyerAddress)}
            title={t("copy")}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${COPYABLE_CHIP_CLASS}`}
          >
            <span className="max-w-[170px] truncate">{item.buyerAddress}</span>
            <Copy size={12} />
          </button>
        ),
      },
      {
        title: t("sellerAddress"),
        field: "sellerAddress",
        render: (item: AdminTransactionItem) => (
          <button
            onClick={() => copyValue(item.sellerAddress)}
            title={t("copy")}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${COPYABLE_CHIP_CLASS}`}
          >
            <span className="max-w-[170px] truncate">{item.sellerAddress}</span>
            <Copy size={12} />
          </button>
        ),
      },
      {
        title: t("transactionHash"),
        field: "transactionHash",
        render: (item: AdminTransactionItem) => (
          <button
            onClick={() => copyValue(item.transactionHash)}
            title={t("copy")}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${COPYABLE_CHIP_CLASS}`}
          >
            <span className="max-w-[170px] truncate">
              {item.transactionHash}
            </span>
            <Copy size={12} />
          </button>
        ),
      },
      {
        title: t("shares"),
        field: "shares",
        render: (item: AdminTransactionItem) => (
          <div className="w-full flex justify-center">
            <span className={`font-medium ${TEXT_PRIMARY}`}>
              {item.shares ?? 0}
            </span>
          </div>
        ),
      },
      {
        title: t("transactionAmount"),
        field: "amount",
        render: (item: AdminTransactionItem) => (
          <div className="w-full flex justify-center">
            <span className={`font-medium ${TEXT_PRIMARY}`}>
              {formatToFixed(item.amount, 2)}
            </span>
          </div>
        ),
      },
      {
        title: t("status"),
        field: "status",
        render: (item: AdminTransactionItem) => {
          const statusLabel = getStatusLabel(item.status);
          const badgeStyle =
            PAYMENT_STATUS_BADGE_STYLES[item.status] || DEFAULT_BADGE_STYLE;
          return <StatusChip label={statusLabel} className={badgeStyle} />;
        },
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: t("transactions").toLowerCase(),
      hideSelectCol: true,
      emptyMessage: t("noTransactionsFound"),
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex items-end justify-between gap-4 overflow-x-auto">
            <div className="shrink-0">
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("transactions")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("allPaymentTransactions")}
              </p>
            </div>
            <div className="shrink-0">
              <TransactionFilters />
            </div>
          </div>
        </div>
      ),
    };
  }, [copyValue, getStatusLabel, t]);

  return (
    <DataTable<AdminTransactionItem>
      data={data}
      totalCount={totalCount}
      isLoading={isLoading}
      config={config}
    />
  );
};

export default TransactionsTable;
