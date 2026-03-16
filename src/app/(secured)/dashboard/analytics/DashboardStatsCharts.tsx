"use client";

import {
  Users,
  Activity,
  TrendingUp,
  CreditCard,
  XCircle,
  PauseCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import StatCard from "@/components/atoms/StatCard";
import { UserRetentionData } from "@/api/dashboard";
import { SubscriptionAnalytics } from "@/api/adminPlans";
import CompanyCreatedChart from "./CompanyCreatedChart";
import CompanyFollowerChart from "./CompanyFollowerChart";
import GroupCreatedChart from "./GroupCreatedChart";
import GroupJoinedChart from "./GroupJoinedChart";
import ConversionRateChart from "./ConversionRateChart";
import EventCreatedChart from "./EventCreatedChart";
import EventAttendeeChart from "./EventAttendeeChart";
import SubscriptionPlanPieChart from "./SubscriptionPlanPieChart";

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

      {/* Subscriptions by Plan */}
      {/* <SubscriptionPlanPieChart subscriptionAnalytics={subscriptionAnalytics} /> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex-1">
          <CompanyCreatedChart
            initialFromDate={initialFromDate}
            initialToDate={initialToDate}
          />
        </div>
        <div className="flex-1">
          <CompanyFollowerChart
            initialFromDate={initialFromDate}
            initialToDate={initialToDate}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex-1">
          <GroupCreatedChart
            initialFromDate={initialFromDate}
            initialToDate={initialToDate}
          />
        </div>
        <div className="flex-1">
          <GroupJoinedChart
            initialFromDate={initialFromDate}
            initialToDate={initialToDate}
          />
        </div>
      </div>

      <div className="w-full mb-4">
        {/* <EngagementAnalyticsChart
          initialFromDate={initialFromDate}
          initialToDate={initialToDate}
        /> */}
        <ConversionRateChart
          initialFromDate={initialFromDate}
          initialToDate={initialToDate}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex-1 bg-bgwhite rounded-[20px] border border-bordergray200 p-3 lg:p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1 h-full">
          {/* Subscription Analytics Stat Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
            <StatCard
              title={t("totalSubscriptions")}
              value={subscriptionAnalytics.totalSubscriptions.toLocaleString()}
              icon={
                <CreditCard className="w-6 h-6 text-bgwhite dark:text-white/80" />
              }
              color="bg-primarycolor dark:bg-secondarycolor"
              titleVariant="lg"
            />
            <StatCard
              title={t("activeSubscriptions")}
              value={subscriptionAnalytics.totalActiveSubscriptions.toLocaleString()}
              icon={
                <Users className="w-6 h-6 text-bgwhite dark:text-white/80" />
              }
              color="bg-primarycolor dark:bg-secondarycolor"
              titleVariant="lg"
            />
            <StatCard
              title={t("cancelledSubscriptions")}
              value={subscriptionAnalytics.totalCancelledSubscriptions.toLocaleString()}
              icon={
                <XCircle className="w-6 h-6 text-bgwhite dark:text-white/80" />
              }
              color="bg-primarycolor dark:bg-secondarycolor"
              titleVariant="lg"
            />
            <StatCard
              title={t("pausedSubscriptions")}
              value={subscriptionAnalytics.totalPausedSubscriptions.toLocaleString()}
              icon={
                <PauseCircle className="w-6 h-6 text-bgwhite dark:text-white/80" />
              }
              color="bg-primarycolor dark:bg-secondarycolor"
              titleVariant="lg"
            />
          </div>
        </div>
        <div className="flex-1">
          <SubscriptionPlanPieChart
            subscriptionAnalytics={subscriptionAnalytics}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex-1">
          <EventCreatedChart
            initialFromDate={initialFromDate}
            initialToDate={initialToDate}
          />
        </div>
        <div className="flex-1">
          <EventAttendeeChart
            initialFromDate={initialFromDate}
            initialToDate={initialToDate}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardStatsCharts;
