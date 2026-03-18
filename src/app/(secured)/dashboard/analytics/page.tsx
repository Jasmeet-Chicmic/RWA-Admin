import React from "react";

import DashboardStatsCharts from "./DashboardStatsCharts";
import { fetchUserRetentionAction } from "@/api/dashboard";
import {
  fetchSubscriptionAnalyticsAction,
  SubscriptionAnalytics,
} from "@/api/adminPlans";
import { getAdminPropertiesDetailsAction } from "@/api/adminProperties";

interface AnalyticsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getFirstParam<T>(param: T | T[] | undefined, defaultValue: T): T {
  if (Array.isArray(param)) return param[0];
  if (param !== undefined) return param;
  return defaultValue;
}

// Helper to get default date range (last 7 days, max 1 month allowed)
function getDefaultDateRange() {
  const today = new Date();
  const fromDate = new Date();
  fromDate.setDate(today.getDate() - 6); // Last 7 days including today

  return {
    fromDate: fromDate.toISOString().split("T")[0],
    toDate: today.toISOString().split("T")[0],
  };
}

const Analytics = async ({ searchParams }: AnalyticsPageProps) => {
  const params = await searchParams;
  const defaultDates = getDefaultDateRange();

  // Get date range from URL params or use defaults
  const fromDate = getFirstParam(params.fromDate, defaultDates.fromDate);
  const toDate = getFirstParam(params.toDate, defaultDates.toDate);

  // Fetch dashboard data in parallel
  const [userRetention, subscriptionAnalyticsRes, propertiesDetails] =
    await Promise.all([
    fetchUserRetentionAction(),
    fetchSubscriptionAnalyticsAction({ from: fromDate, to: toDate }),
    getAdminPropertiesDetailsAction(),
  ]);

  const defaultSubscriptionAnalytics: SubscriptionAnalytics = {
    totalActiveSubscriptions: 0,
    totalCancelledSubscriptions: 0,
    totalPausedSubscriptions: 0,
    totalSubscriptions: 0,
    planCounts: [],
  };

  return (
    <div className="p-0 mt-[20px]">
      {/* Dashboard Stats Section */}
      <div className="mb-6">
        <DashboardStatsCharts
          retentionData={
            userRetention?.data || {
              totalUsers: 0,
              activeUsers: 0,
              usersLoggedInMoreThan3TimesThisWeek: 0,
              avgSessionsPerUser: 0,
              avgSessionDurationMinutes: 0,
              avgTimeBetweenVisitsHours: 0,
            }
          }
          propertiesDetails={propertiesDetails}
          subscriptionAnalytics={
            subscriptionAnalyticsRes?.data || defaultSubscriptionAnalytics
          }
          initialFromDate={fromDate}
          initialToDate={toDate}
        />
      </div>
    </div>
  );
};
export default Analytics;
