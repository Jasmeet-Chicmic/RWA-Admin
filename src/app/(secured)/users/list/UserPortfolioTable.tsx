"use client";

import { Eye, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
// import { Ban,   Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { TableColumn } from "@/components/atoms/Table";
import CopyToClipboardPill from "@/components/atoms/CopyToClipboardPill/CopyToClipboardPill";
import TableActions, {
  TableActionDisplayMode,
} from "@/components/atoms/TableActions";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import RegisterIdentityModal from "./RegisterIdentityModal";
import { UsersListFilters } from "./UsersListFilters";
// import DropdownMenu from "@/components/atoms/DropdownMenu/DropdownMenu";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { formatDisplayCurrency, fromBaseUnits } from "@/shared/utils/unitUtils";
// import { getUsersAction } from "@/api/user";

// 0 - Not Started, 1 - Pending, 2 - Approved, 3 - Rejected
type KycStatus = 0 | 1 | 2 | 3;

interface UserPortfolioRow {
  id: string;
  name: string;
  walletAddress: string;
  identityContractAddress?: string;
  propertiesOwned: number;
  propertiesRegistered: number;
  totalInvestment: number;
  portfolioValue: number;
  kycStatus: KycStatus;
}

const formatCurrency = (value: number) =>
  formatDisplayCurrency(value, { maximumFractionDigits: 0 });

const truncateWallet = (address: string) =>
  address.length > 13
    ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}`
    : address;

interface UserPortfolioTableProps {
  data: UserPortfolioRow[];
  totalCount: number;
  isLoading?: boolean;
}

const UserPortfolioTable = ({
  data,
  totalCount,
  isLoading = false,
}: UserPortfolioTableProps) => {
  const t = useTranslations("users");
  const tTransactions = useTranslations("transactions");
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<UserPortfolioRow | null>(
    null,
  );
  const actionsDisplayMode: TableActionDisplayMode = "inline";

  const config: DataTableConfig<UserPortfolioRow> = useMemo(() => {
    const columns: TableColumn<UserPortfolioRow>[] = [
      // {
      //   field: "name",
      //   title: t("name"),
      //   render: (item) => (
      //     <CopyToClipboardPill
      //       value={item.name}
      //       displayValue={truncateWallet(item.name)}
      //       title={item.name}
      //       onCopied={() => toast.success(tTransactions("copiedToClipboard"))}
      //       // className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}
      //     />
      //   ),
      // },
      {
        field: "walletAddress",
        title: t("walletAddress"),
        render: (item) => (
          <CopyToClipboardPill
            value={item.walletAddress}
            displayValue={truncateWallet(item.walletAddress)}
            title={item.walletAddress}
            onCopied={() => toast.success(tTransactions("copiedToClipboard"))}
            // className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}
          />
        ),
      },
      {
        field: "propertiesOwned",
        title: t("propertiesOwned"),
        render: (item) => (
          <div className="flex items-center justify-center gap-2 w-full">
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {item.propertiesOwned}
            </span>
            <button
              type="button"
              disabled={item.propertiesOwned === 0}
              onClick={() =>
                router.push(`/properties?userId=${encodeURIComponent(item.id)}`)
              }
              className="inline-flex items-center justify-center text-green-600 hover:text-green-700 disabled:text-green-300 disabled:cursor-not-allowed dark:text-green-400 dark:hover:text-green-300 dark:disabled:text-green-700"
              title={t("view")}
              aria-label={t("view")}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
      {
        field: "propertiesRegistered",
        title: t("propertiesRegistered"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY} block text-center`}>
            {item.propertiesRegistered}
          </span>
        ),
      },
      {
        field: "totalInvestment",
        title: t("totalInvestment"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatCurrency(fromBaseUnits(item.totalInvestment))}
          </span>
        ),
      },
      {
        field: "portfolioValue",
        title: t("portfolioValue"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatCurrency(fromBaseUnits(item.portfolioValue))}
          </span>
        ),
      },
      {
        field: "kycStatus",
        title: t("kycStatus"),
        render: (item) => {
          const isApproved = item.kycStatus === 2;
          const isPending = item.kycStatus === 1;
          const isRejected = item.kycStatus === 3;
          const colorClasses = isApproved
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
            : isPending
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
              : isRejected
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";

          const labelKey = isApproved
            ? "kyc.approved"
            : isPending
              ? "kyc.pending"
              : isRejected
                ? "kyc.rejected"
                : "kyc.notStarted";

          return (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[14px] font-semibold border ${colorClasses}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              {t(labelKey)}
            </span>
          );
        },
      },
      {
        field: "",
        title: t("actions"),
        render: (item) => (
          <TableActions
            displayMode={actionsDisplayMode}
            actions={[
              {
                id: "register_identity",
                label: t("registerIdentityAction"),
                onClick: () => setSelectedUser(item),
                className:
                  "inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded bg-indigo-50 text-indigo-600 hover:opacity-90",
                icon: <ShieldCheck className="w-4 h-4" />,
              },
            ]}
          />
        ),
      },
      // {
      //   field: "",
      //   title: t("controls"),
      //   // fixed: "right",
      //   width: "w-[72px]",
      //   render: () => (
      //     <div className="flex items-center justify-end">
      //       <DropdownMenu
      //         options={[
      //           {
      //             label: t("viewUser"),
      //             value: 1,
      //             icon: <Eye className="w-4 h-4" />,
      //           },
      //           {
      //             label: t("block"),
      //             value: 2,
      //             icon: <Ban className="w-4 h-4" />,
      //           },
      //         ]}
      //       />
      //     </div>
      //   ),
      // },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: "users",
      hideSelectCol: true,
      emptyMessage: t("noUsersFound"),
      queryConfig: {
        defaultSortKey: "name",
      },
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="shrink-0">
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("users")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("userPortfolioSubtitle")}
              </p>
            </div>
            <div className="shrink-0 w-full lg:w-auto lg:max-w-[min(100%,520px)]">
              <UsersListFilters />
            </div>
          </div>
        </div>
      ),
    };
  }, [router, t, tTransactions]);

  return (
    <>
      <DataTable
        data={data}
        totalCount={totalCount}
        isLoading={isLoading}
        config={config}
      />
      <RegisterIdentityModal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        userId={selectedUser?.id ?? ""}
        userWalletAddress={selectedUser?.walletAddress ?? ""}
        userIdentityContractAddress={
          selectedUser?.identityContractAddress ?? null
        }
      />
    </>
  );
};

export default UserPortfolioTable;
