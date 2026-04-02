"use client";

import {
  ChartCardSkeleton,
  StatCardSkeleton,
} from "@/components/atoms/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { fetchAnalyticsSummary } from "@/store/analyticsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import DashboardStatsCharts from "./DashboardStatsCharts";

function getDefaultDateRange() {
  const today = new Date();
  const fromDate = new Date();
  fromDate.setDate(today.getDate() - 6);
  return {
    fromDate: fromDate.toISOString().split("T")[0],
    toDate: today.toISOString().split("T")[0],
  };
}

const AnalyticsContainer = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const lastRequestKeyRef = useRef<string | null>(null);
  const {
    retentionData,
    subscriptionAnalytics,
    propertiesDetails,
    dashboardAnalytics,
    userSignupGraph,
    isLoading,
  } = useAppSelector((state) => state.analytics);

  const defaultDates = useMemo(() => getDefaultDateRange(), []);

  const combinedDeps = useMemo(
    () =>
      JSON.stringify({
        fromDate: searchParams.get("fromDate") ?? defaultDates.fromDate,
        toDate: searchParams.get("toDate") ?? defaultDates.toDate,
      }),
    [defaultDates.fromDate, defaultDates.toDate, searchParams],
  );
  const debouncedDeps = useDebounce(combinedDeps, 300);

  const payload = useMemo(() => {
    const parsed = JSON.parse(debouncedDeps) as {
      fromDate: string;
      toDate: string;
    };
    return {
      fromDate: parsed.fromDate,
      toDate: parsed.toDate,
    };
  }, [debouncedDeps]);

  useEffect(() => {
    if (lastRequestKeyRef.current === debouncedDeps) return;
    lastRequestKeyRef.current = debouncedDeps;
    dispatch(fetchAnalyticsSummary(payload));
  }, [debouncedDeps, dispatch, payload]);

  if (isLoading) {
    return (
      <div className="p-0 mt-[20px]">
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="w-full">
            <ChartCardSkeleton height={400} />
          </div>
          <div className="w-full">
            <ChartCardSkeleton height={320} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0 mt-[20px]">
      <div className="mb-6">
        <DashboardStatsCharts
          retentionData={retentionData}
          propertiesDetails={propertiesDetails}
          subscriptionAnalytics={subscriptionAnalytics}
          dashboardAnalytics={dashboardAnalytics}
          userSignupGraph={userSignupGraph}
          initialFromDate={payload.fromDate}
          initialToDate={payload.toDate}
        />
      </div>
    </div>
  );
};

export default AnalyticsContainer;
