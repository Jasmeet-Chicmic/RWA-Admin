"use client";

import { useMemo } from "react";
import { Eye, Slash } from "lucide-react";
import { useTranslations } from "next-intl";

import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";

type KycStatus = "verified" | "pending" | "failed";
type ApprovalStatus = "approved" | "pending" | "rejected";

interface UserPortfolioRow {
  id: string;
  name: string;
  email: string;
  country: string;
  walletAddress: string;
  properties: number;
  totalInvestment: number;
  portfolioValue: number;
  kycStatus: KycStatus;
  approvalStatus: ApprovalStatus;
}

const MOCK_USERS: UserPortfolioRow[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    country: "United States",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    properties: 3,
    totalInvestment: 125000,
    portfolioValue: 138750,
    kycStatus: "verified",
    approvalStatus: "approved",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    country: "United Kingdom",
    walletAddress: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    properties: 7,
    totalInvestment: 450000,
    portfolioValue: 495000,
    kycStatus: "verified",
    approvalStatus: "approved",
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "m.chen@example.com",
    country: "Singapore",
    walletAddress: "0x5A0b54D5dc17e0AadC383D2db43B0a0D3E029c4c",
    properties: 0,
    totalInvestment: 0,
    portfolioValue: 0,
    kycStatus: "verified",
    approvalStatus: "approved",
  },
  {
    id: "4",
    name: "Emma Williams",
    email: "emma.w@example.com",
    country: "Canada",
    walletAddress: "0x9F4c...7Ea9",
    properties: 2,
    totalInvestment: 75000,
    portfolioValue: 75000,
    kycStatus: "pending",
    approvalStatus: "pending",
  },
];

const formatCurrency = (value: number) =>
  value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const truncateWallet = (address: string) =>
  address.length > 13
    ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}`
    : address;

const UserPortfolioTable = () => {
  const t = useTranslations("users");

  const config: DataTableConfig<UserPortfolioRow> = useMemo(() => {
    const columns: TableColumn<UserPortfolioRow>[] = [
      {
        field: "name",
        title: t("Name"),
        render: (item) => (
          <div className="flex flex-col">
            <span className={`${TEXT_PRIMARY} font-medium`}>{item.name}</span>
            <span className={`${TEXT_SIZE_SM} text-textparagraph`}>
              {item.email}
            </span>
          </div>
        ),
      },
      {
        field: "country",
        title: t("Country"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.country}
          </span>
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
          const isVerified = item.kycStatus === "verified";
          const isPending = item.kycStatus === "pending";
          const colorClasses = isVerified
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
            : isPending
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";

          const labelKey = isVerified
            ? "KYC.Verified"
            : isPending
              ? "KYC.Pending"
              : "KYC.Failed";

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
      {
        field: "approvalStatus",
        title: t("Approval Status"),
        render: (item) => {
          const isApproved = item.approvalStatus === "approved";
          const isPending = item.approvalStatus === "pending";
          const colorClasses = isApproved
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
            : isPending
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";

          const labelKey = isApproved
            ? "Approval.Approved"
            : isPending
              ? "Approval.Pending"
              : "Approval.Rejected";

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
      {
        field: "",
        title: t("Controls"),
        render: () => (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Eye size={14} className="mr-1" />
              {t("View")}
            </button>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <Slash size={14} className="mr-1" />
              {t("Block")}
            </button>
          </div>
        ),
      },
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

  return (
    <DataTable data={MOCK_USERS} totalCount={MOCK_USERS.length} config={config} />
  );
};

export default UserPortfolioTable;

