"use client";

import { Users, Activity, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import StatCard from "@/components/atoms/StatCard";
import { UserRetentionData } from "@/api/dashboard";
import { SubscriptionAnalytics } from "@/api/adminPlans";
import TopPropertiesTable from "./TopPropertiesTable";

interface DashboardStatsChartsProps {
  retentionData: UserRetentionData;
  subscriptionAnalytics: SubscriptionAnalytics;
  initialFromDate?: string;
  initialToDate?: string;
}

const DashboardStatsCharts = ({
  retentionData: _retentionData,
  subscriptionAnalytics: _subscriptionAnalytics,
  initialFromDate: _initialFromDate = "",
  initialToDate: _initialToDate = "",
}: DashboardStatsChartsProps) => {
  const t = useTranslations("dashboard");
  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-4">
        <StatCard
          title={t("totalAssetValue")}
          value={"$1,250"}
          icon={<Users className="w-6 h-6 text-white dark:text-white/80" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("totalInvestors")}
          value={"1,245"}
          icon={
            <Activity className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("tokensIssued")}
          value={"34,500"}
          icon={
            <TrendingUp className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("pendingKyc")}
          value={"32"}
          icon={
            <Activity className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("platformRevenue")}
          value={"$2,458"}
          icon={
            <Activity className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("pendingPropertyApprovals")}
          value={"14"}
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
