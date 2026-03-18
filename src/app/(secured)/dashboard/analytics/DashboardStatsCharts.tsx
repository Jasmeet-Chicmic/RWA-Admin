"use client";

import { Users, Activity, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import StatCard from "@/components/atoms/StatCard";
import { UserRetentionData } from "@/api/dashboard";
import { SubscriptionAnalytics } from "@/api/adminPlans";
import TopPropertiesTable from "./TopPropertiesTable";
import { AdminPropertiesDetails } from "@/api/adminProperties.types";

interface DashboardStatsChartsProps {
  retentionData: UserRetentionData;
  subscriptionAnalytics: SubscriptionAnalytics;
  propertiesDetails: AdminPropertiesDetails;
  initialFromDate?: string;
  initialToDate?: string;
}

const DashboardStatsCharts = ({
  retentionData: _retentionData,
  subscriptionAnalytics: _subscriptionAnalytics,
  propertiesDetails,
  initialFromDate: _initialFromDate = "",
  initialToDate: _initialToDate = "",
}: DashboardStatsChartsProps) => {
  const t = useTranslations("dashboard");

  const toFiniteNumber = (value: unknown) => {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const formatNumber = (value: unknown) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
      toFiniteNumber(value),
    );

  const formatCurrency = (value: unknown) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
    }).format(toFiniteNumber(value));

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-4">
        <StatCard
          title={t("totalAssetValue")}
          value={formatCurrency(propertiesDetails.totalAssetValue)}
          icon={<Users className="w-6 h-6 text-white dark:text-white/80" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("totalInvestors")}
          value={formatNumber(propertiesDetails.totalInvestors)}
          icon={
            <Activity className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("tokensIssued")}
          value={formatNumber(propertiesDetails.tokensIssued)}
          icon={
            <TrendingUp className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("pendingKyc")}
          value={formatNumber(propertiesDetails.pendingKyc)}
          icon={
            <Activity className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("platformRevenue")}
          value={formatCurrency(propertiesDetails.platformRevenue)}
          icon={
            <Activity className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("pendingPropertyApprovals")}
          value={formatNumber(propertiesDetails.pendingPropertyApprovals)}
          icon={
            <Activity className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
      </div>
      <TopPropertiesTable />
    </div>
  );
};

export default DashboardStatsCharts;
