"use client";

import StatCard from "@/components/atoms/StatCard";
import {
  AdminPropertiesDetails,
  SubscriptionAnalytics,
  UserRetentionData,
} from "@/services/analytics-service";
import { DISPLAY_CURRENCY } from "@/shared/utils/unitUtils";
import { Activity, TrendingUp, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import TopPropertiesTable from "./TopPropertiesTable";

interface DashboardStatsChartsProps {
  retentionData: UserRetentionData;
  subscriptionAnalytics: SubscriptionAnalytics;
  propertiesDetails: AdminPropertiesDetails;
  initialFromDate?: string;
  initialToDate?: string;
}

const DashboardStatsCharts = ({
  propertiesDetails,
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

  const formatCurrency = (value: unknown) => {
    const n = toFiniteNumber(value);
    const abs = Math.abs(n);
    const sign = n < 0 ? "-" : "";

    // Abbreviate large currency values: K (1e3), M (1e6), T (1e12).
    // Note: billions (1e9..1e12) will display in `M`.
    let divisor = 1;
    let suffix = "";
    if (abs >= 1e12) {
      divisor = 1e12;
      suffix = "T";
    } else if (abs >= 1e6) {
      divisor = 1e6;
      suffix = "M";
    } else if (abs >= 1e3) {
      divisor = 1e3;
      suffix = "K";
    }

    const scaled = abs / divisor;

    const numberStr = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(scaled);

    return `${sign}${numberStr}${suffix} ${DISPLAY_CURRENCY}`;
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-4">
        <StatCard
          title={t("totalAssetValue")}
          value={formatCurrency(propertiesDetails.totalAssetValue)}
          icon={<Users className="w-6 h-6 text-white dark:text-black" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("totalInvestors")}
          value={formatNumber(propertiesDetails.totalInvestors)}
          icon={<Activity className="w-6 h-6 text-bgwhite dark:text-black" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("tokensIssued")}
          value={formatNumber(propertiesDetails.tokensIssued)}
          icon={<TrendingUp className="w-6 h-6 text-bgwhite dark:text-black" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("pendingKyc")}
          value={formatNumber(propertiesDetails.pendingKyc)}
          icon={<Activity className="w-6 h-6 text-bgwhite dark:text-black" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("platformRevenue")}
          value={formatCurrency(propertiesDetails.platformRevenue)}
          icon={<Activity className="w-6 h-6 text-bgwhite dark:text-black" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("pendingPropertyApprovals")}
          value={formatNumber(propertiesDetails.pendingPropertyApprovals)}
          icon={<Activity className="w-6 h-6 text-bgwhite dark:text-black" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
      </div>
      <TopPropertiesTable />
    </div>
  );
};

export default DashboardStatsCharts;
