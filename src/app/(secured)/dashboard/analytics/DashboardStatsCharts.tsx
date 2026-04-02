"use client";

import StatCard from "@/components/atoms/StatCard";
import {
  AdminPropertiesDetails,
  DashboardAnalyticsData,
  SubscriptionAnalytics,
  UserRetentionData,
} from "@/services/analytics-service";
// import { DISPLAY_CURRENCY } from "@/shared/utils/unitUtils";
import { Activity, TrendingUp, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import TopPropertiesTable from "./TopPropertiesTable";

interface DashboardStatsChartsProps {
  retentionData: UserRetentionData;
  subscriptionAnalytics: SubscriptionAnalytics;
  propertiesDetails: AdminPropertiesDetails;
  dashboardAnalytics: DashboardAnalyticsData;
  initialFromDate?: string;
  initialToDate?: string;
}

const DashboardStatsCharts = ({
  // propertiesDetails,
  dashboardAnalytics,
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

  // const formatCurrency = (value: unknown) => {
  //   const n = toFiniteNumber(value);
  //   const abs = Math.abs(n);
  //   const sign = n < 0 ? "-" : "";

  //   // Abbreviate large currency values: K (1e3), M (1e6), T (1e12).
  //   // Note: billions (1e9..1e12) will display in `M`.
  //   let divisor = 1;
  //   let suffix = "";
  //   if (abs >= 1e12) {
  //     divisor = 1e12;
  //     suffix = "T";
  //   } else if (abs >= 1e6) {
  //     divisor = 1e6;
  //     suffix = "M";
  //   } else if (abs >= 1e3) {
  //     divisor = 1e3;
  //     suffix = "K";
  //   }

  //   const scaled = abs / divisor;

  //   const numberStr = new Intl.NumberFormat(undefined, {
  //     maximumFractionDigits: 2,
  //   }).format(scaled);

  //   return `${sign}${numberStr}${suffix} ${DISPLAY_CURRENCY}`;
  // };

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("totalUsers") || "Total Users"}
          value={formatNumber(dashboardAnalytics?.totalUsers)}
          icon={<Users className="w-6 h-6 text-white dark:text-black" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("totalOrganizations") || "Total Organizations"}
          value={formatNumber(dashboardAnalytics?.totalOrganizations)}
          icon={<Activity className="w-6 h-6 text-bgwhite dark:text-black" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("totalProperties") || "Total Properties"}
          value={formatNumber(dashboardAnalytics?.totalProperties)}
          icon={<TrendingUp className="w-6 h-6 text-bgwhite dark:text-black" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("totalInvestments") || "Total Investments"}
          value={formatNumber(dashboardAnalytics?.totalInvestments)}
          icon={<Activity className="w-6 h-6 text-bgwhite dark:text-black" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
      </div>
      <TopPropertiesTable />
    </div>
  );
};

export default DashboardStatsCharts;
