"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Menu, RotateCcw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";

import FormattedDate from "@/components/atoms/FormattedDate";
import CopyToClipboardPill from "@/components/atoms/CopyToClipboardPill/CopyToClipboardPill";
import StatusChip from "@/components/atoms/StatusChip";
import { TableColumn } from "@/components/atoms/Table";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import FilterSidebar from "@/components/molecules/FilterSidebar";
import { TRANSACTION_STATUS } from "@/constants/transaction";
import { AdminTransactionItem } from "@/services/transactions-service";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { DISPLAY_CURRENCY, fromBaseUnits } from "@/shared/utils/unitUtils";
import TransactionFilters from "./TransactionFilters";
import { TransactionSearchInput } from "./TransactionSearchInput";
import { walletTruncate } from "@/shared/utils";

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

interface TransactionsTableProps {
  data: AdminTransactionItem[];
  totalCount: number;
  isLoading?: boolean;
  hidePropertiesColumn?: boolean;
  showFilters?: boolean;
  /** When true, shows debounced search (URL `search` param). Use when `showFilters` is false. */
  showSearch?: boolean;
}

const TransactionsTable = ({
  data,
  totalCount,
  isLoading = false,
  hidePropertiesColumn = false,
  showFilters = true,
  showSearch = false,
}: TransactionsTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const t = useTranslations("transactions");
  const tCommon = useTranslations("common");

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
    const propertiesColumn: TableColumn<AdminTransactionItem> = {
      title: tCommon("Properties"),
      field: "propertyId",
      render: (item: AdminTransactionItem) => (
        <div className="w-full flex justify-center">
          {(() => {
            const propertyId = item.property?.id ?? item.propertyId;
            const propertyName = item.property?.name ?? "";
            const displayText = propertyName || propertyId || "—";

            if (!propertyId) {
              return (
                <span className={`text-sm font-medium ${TEXT_PRIMARY}`}>
                  {displayText}
                </span>
              );
            }

            const shortened =
              displayText.length > 10
                ? `${displayText.slice(0, 6)}...${displayText.slice(-4)}`
                : displayText;

            return (
              <Link
                href={`/properties/${propertyId}`}
                className={`text-sm font-medium ${TEXT_PRIMARY} underline`}
                title={propertyName || propertyId}
              >
                {shortened}
              </Link>
            );
          })()}
        </div>
      ),
    };

    const columns: TableColumn<AdminTransactionItem>[] = [
      ...(hidePropertiesColumn ? [] : [propertiesColumn]),
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
          <CopyToClipboardPill
            value={item.buyerAddress}
            displayValue={walletTruncate(item.buyerAddress)}
            title={tCommon("copy")}
            onCopied={() => toast.success(tCommon("copiedToClipboard"))}
          />
        ),
      },
      {
        title: t("sellerAddress"),
        field: "sellerAddress",
        render: (item: AdminTransactionItem) => (
          <CopyToClipboardPill
            value={item.sellerAddress}
            displayValue={walletTruncate(item.sellerAddress)}
            title={tCommon("copy")}
            onCopied={() => toast.success(tCommon("copiedToClipboard"))}
          />
        ),
      },
      {
        title: t("transactionHash"),
        field: "transactionHash",
        render: (item: AdminTransactionItem) => (
          <CopyToClipboardPill
            value={item.transactionHash}
            displayValue={item.transactionHash}
            title={tCommon("copy")}
            onCopied={() => toast.success(tCommon("copiedToClipboard"))}
          />
        ),
      },
      {
        title: t("shares"),
        field: "shares",
        render: (item: AdminTransactionItem) => (
          <div className="w-full flex justify-center">
            <span className={`font-medium ${TEXT_PRIMARY}`}>
              {fromBaseUnits(item.shares) ?? 0}
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
              {fromBaseUnits(item.amount)} {DISPLAY_CURRENCY}
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
            {showFilters ? (
              <div className="shrink-0 flex items-end gap-3">
                <TransactionSearchInput inputId="transaction-search-header" />
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-primarycolor px-4 py-2 font-semibold text-black transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-0 dark:border-secondarycolor dark:bg-secondarycolor dark:text-black dark:hover:opacity-90 bg-primarycolor"
                >
                  <Menu size={16} strokeWidth={2.25} />
                  <span>{t("filters")}</span>
                </button>
              </div>
            ) : showSearch ? (
              <div className="shrink-0">
                <TransactionSearchInput inputId="transaction-search-property" />
              </div>
            ) : null}
          </div>
        </div>
      ),
    };
  }, [
    getStatusLabel,
    hidePropertiesColumn,
    showFilters,
    showSearch,
    t,
    tCommon,
  ]);

  return (
    <>
      <DataTable<AdminTransactionItem>
        data={data}
        totalCount={totalCount}
        isLoading={isLoading}
        config={config}
      />
      {showFilters && (
        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title={t("filters")}
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
          <TransactionFilters variant="sidebar" includeSearch={false} />
        </FilterSidebar>
      )}
    </>
  );
};

export default TransactionsTable;
