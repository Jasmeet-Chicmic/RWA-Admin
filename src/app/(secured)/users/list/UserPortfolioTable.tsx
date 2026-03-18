"use client";

import { useMemo } from "react";
import { Ban, Eye } from "lucide-react";
import { useTranslations } from "next-intl";

import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import DropdownMenu from "@/components/atoms/DropdownMenu/DropdownMenu";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { getUsersAction } from "@/api/user";

// 0 - Not Started, 1 - Pending, 2 - Approved, 3 - Rejected
type KycStatus = 0 | 1 | 2 | 3;

interface UserPortfolioRow {
  id: string;
  name: string;
  walletAddress: string;
  properties: number;
  totalInvestment: number;
  portfolioValue: number;
  kycStatus: KycStatus;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const truncateWallet = (address: string) =>
  address.length > 13
    ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}`
    : address;

interface UserPortfolioTableProps {
  data: UserPortfolioRow[];
  totalCount: number;
}

const UserPortfolioTable = ({ data, totalCount }: UserPortfolioTableProps) => {
  const t = useTranslations("users");

  const config: DataTableConfig<UserPortfolioRow> = useMemo(() => {
    const columns: TableColumn<UserPortfolioRow>[] = [
      {
        field: "name",
        title: t("Name"),
        render: (item) => (
          <div className="flex flex-col">
            <span className={`${TEXT_PRIMARY} font-medium`}>{item.name}</span>
          </div>
        ),
      },
      {
        field: "walletAddress",
        title: t("Wallet Address"),
        render: (item) => (
          <span
            className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}
            title={item.walletAddress}
          >
            {truncateWallet(item.walletAddress)}
          </span>
        ),
      },
      {
        field: "properties",
        title: t("Properties Count"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.properties}
          </span>
        ),
      },
      {
        field: "totalInvestment",
        title: t("Total Investment"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatCurrency(item.totalInvestment)}
          </span>
        ),
      },
      {
        field: "portfolioValue",
        title: t("Portfolio Value"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatCurrency(item.portfolioValue)}
          </span>
        ),
      },
      {
        field: "kycStatus",
        title: t("KYC Status"),
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
            ? "KYC.Approved"
            : isPending
              ? "KYC.Pending"
              : isRejected
                ? "KYC.Rejected"
                : "KYC.NotStarted";

          return (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              {t(labelKey)}
            </span>
          );
        },
      },
      // {
      //   field: "",
      //   title: t("Controls"),
      //   // fixed: "right",
      //   width: "w-[72px]",
      //   render: () => (
      //     <div className="flex items-center justify-end">
      //       <DropdownMenu
      //         options={[
      //           {
      //             label: t("View User"),
      //             value: 1,
      //             icon: <Eye className="w-4 h-4" />,
      //           },
      //           {
      //             label: t("Block"),
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
      emptyMessage: t("No users found"),
      queryConfig: {
        defaultSortKey: "name",
      },
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("Users")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("User Portfolio subtitle")}
              </p>
            </div>
          </div>
        </div>
      ),
    };
  }, [t]);

  return <DataTable data={data} totalCount={totalCount} config={config} />;
};

export default UserPortfolioTable;
