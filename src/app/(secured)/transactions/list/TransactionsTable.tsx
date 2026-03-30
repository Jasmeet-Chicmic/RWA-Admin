"use client";

import { useCallback, useMemo, useState } from "react";
import { Menu, RotateCcw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import SearchToolbar from "@/components/atoms/SearchToolbar";
import { TableColumn } from "@/components/atoms/Table";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import FilterSidebar from "@/components/molecules/FilterSidebar";
import { Transaction } from "@/shared/types";
import { PAYMENT_STATUS, SUBSCRIPTION_OWNER_TYPE } from "@/shared/constants";
import FormattedDate from "@/components/atoms/FormattedDate";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { TableHeaderWithInfo } from "@/components/atoms/TableHeaderWithInfo";
import { formatToFixed } from "@/shared/utils/unitUtils";
import TransactionFilters from "./TransactionFilters";

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

interface FlatTransaction extends Transaction {
  ownerId: string;
  ownerType: number;
}

interface TransactionsTableProps {
  data: FlatTransaction[];
  totalCount: number;
  searchText: string;
}

const TransactionsTable = ({
  data,
  totalCount,
  searchText,
}: TransactionsTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const t = useTranslations("transactions");

  const getTransactionTypeLabel = useCallback(
    (transaction: Transaction): string => {
      if (transaction.isRefund) return t("refund");
      if (transaction.isCredit) return t("credit");
      return t("debit");
    },
    [t],
  );

  const getStatusLabel = useCallback(
    (status: number) => {
      switch (status) {
        case PAYMENT_STATUS.INITIATED:
          return t("initiated");
        case PAYMENT_STATUS.SUCCESS:
          return t("success");
        case PAYMENT_STATUS.FAILED:
          return t("failed");
        case PAYMENT_STATUS.REFUNDED:
          return t("refunded");
        default:
          return t("unknown");
      }
    },
    [t],
  );

  const getOwnerTypeLabel = useCallback(
    (ownerType: number) => {
      switch (ownerType) {
        case SUBSCRIPTION_OWNER_TYPE.USER:
          return t("user");
        case SUBSCRIPTION_OWNER_TYPE.ORGANISATION:
          return t("organisation");
        default:
          return "—";
      }
    },
    [t],
  );

  const config: DataTableConfig<FlatTransaction> = useMemo(() => {
    const columns: TableColumn<FlatTransaction>[] = [
      {
        title: t("transactionDate"),
        field: "date",
        render: (item: FlatTransaction) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.date ? <FormattedDate date={item.date} /> : "—"}
          </span>
        ),
        sortable: true,
        sortKey: "date",
      },
      {
        title: t("invoiceNumber"),
        field: "invoiceNumber",
        render: (item: FlatTransaction) => (
          <span className={`font-medium ${TEXT_PRIMARY}`}>
            {item.invoiceNumber || "—"}
          </span>
        ),
      },
      {
        title: t("payerType"),
        field: "ownerType",
        render: (item: FlatTransaction) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              item.ownerType === SUBSCRIPTION_OWNER_TYPE.ORGANISATION
                ? "bg-primarycolor text-white"
                : "bg-secondarycolor text-white"
            }`}
          >
            {getOwnerTypeLabel(item.ownerType)}
          </span>
        ),
      },
      {
        title: t("planName"),
        field: "planName",
        render: (item: FlatTransaction) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.planName || "—"}
          </span>
        ),
      },
      {
        title: t("transactionAmount"),
        field: "amount",
        render: (item: FlatTransaction) => (
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
            label={t("paymentStatus")}
            options={[
              t("initiated"),
              t("success"),
              t("failed"),
              t("refunded"),
              t("unknown"),
            ]}
          />
        ),
        field: "status",
        render: (item: FlatTransaction) => {
          const statusLabel = getStatusLabel(item.status);
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
        title: t("paymentMethod"),
        field: "paymentMethodType",
        render: (item: FlatTransaction) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item?.paymentMethodBrand || "—"}
          </span>
        ),
      },
      {
        title: (
          <TableHeaderWithInfo
            label={t("transactionType")}
            options={[t("debit"), t("credit"), t("refund")]}
          />
        ),
        field: "isCredit",
        render: (item: FlatTransaction) => {
          const typeLabel = getTransactionTypeLabel(item);
          const isRefund = item.isRefund;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                isRefund
                  ? "bg-secondarycolor text-white"
                  : "text-white bg-primarycolor"
              }`}
            >
              {typeLabel}
            </span>
          );
        },
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.transactionId,
      paginationTitle: t("transactions").toLowerCase(),
      hideSelectCol: true,
      emptyMessage: t("noTransactionsFound"),
      queryConfig: {
        defaultSortKey: "date",
        defaultSortDirection: "DESC",
      },
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("transactions")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("allPaymentTransactions")}
              </p>
            </div>
            <div className="flex items-initial space-x-4">
              <SearchToolbar
                initialQuery={searchText}
                placeholder={t("searchTransactions")}
                queryParamName="searchText"
              />
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-0 font-medium bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white hover:bg-primaryhover dark:hover:bg-secondaryhover rounded-lg"
              >
                <Menu size={18} />
                <span>{t("filters")}</span>
              </button>
            </div>
          </div>
        </div>
      ),
    };
  }, [
    searchText,
    t,
    getOwnerTypeLabel,
    getStatusLabel,
    getTransactionTypeLabel,
  ]);

  return (
    <>
      <DataTable<FlatTransaction>
        data={data}
        totalCount={totalCount}
        config={config}
      />
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={t("transactionFilters")}
        footer={
          <button
            onClick={() => {
              router.push(pathname);
              setIsFilterOpen(false);
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-darkbgprimary text-labelprimary dark:text-darklabelprimary rounded-xl hover:bg-gray-200 dark:hover:bg-labelprimary transition-all border bordergray200 dark:border-labelprimary font-medium"
          >
            <RotateCcw size={18} />
            <span>{t("clearAllFilters")}</span>
          </button>
        }
      >
        <TransactionFilters />
      </FilterSidebar>
    </>
  );
};

export default TransactionsTable;
