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
  retentionData,
  subscriptionAnalytics,
  initialFromDate = "",
  initialToDate = "",
}: DashboardStatsChartsProps) => {
  const t = useTranslations("dashboard");
  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-4">
        <StatCard
          title={t("totalUsers")}
          value={retentionData.totalUsers.toLocaleString()}
          icon={<Users className="w-6 h-6 text-white dark:text-white/80" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("activeUsers")}
          value={retentionData.activeUsers.toLocaleString()}
          icon={
            <Activity className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("powerUsers")}
          value={retentionData.usersLoggedInMoreThan3TimesThisWeek.toLocaleString()}
          subtitle={t("powerUsersSubtitle")}
          icon={
            <TrendingUp className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("avgSessions")}
          value={retentionData.avgSessionsPerUser.toFixed(2)}
          subtitle={t("avgSessionsSubtitle")}
          icon={
            <Activity className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("avgDuration")}
          value={`${retentionData.avgSessionDurationMinutes.toFixed(2)}m`}
          subtitle={t("avgDurationSubtitle")}
          icon={
            <Activity className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("avgTime")}
          value={`${retentionData.avgTimeBetweenVisitsHours.toFixed(2)}h`}
          subtitle={t("avgTimeSubtitle")}
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
