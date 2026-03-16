"use client";

import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { REPORT_FILTER_TYPE, REPORT_GROUP_BY } from "@/shared/constants";
import {
  fetchEngagementAnalyticsAction,
  EngagementAnalyticsData,
} from "@/api/dashboard";
import AnalyticsChartCard from "./AnalyticsChartCard";
import Select from "@/components/atoms/Select";
import { getAreaChartOptions } from "./chartOptions";

const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const getEngagementMetricOptions = (t: (key: string) => string) => [
  { label: t("uniqueUsers"), value: "uniqueUsers" },
  { label: t("repeatUsers"), value: "repeatUsers" },
  { label: t("totalActions"), value: "totalActions" },
  { label: t("averageActionsPerUser"), value: "averageActionsPerUser" },
];

interface EngagementAnalyticsChartProps {
  initialFromDate?: string;
  initialToDate?: string;
}

const EngagementAnalyticsChart = ({
  initialFromDate = "",
  initialToDate = "",
}: EngagementAnalyticsChartProps) => {
  const t = useTranslations("dashboard");
  const { resolvedTheme } = useTheme();
  const [data, setData] = useState<EngagementAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<REPORT_FILTER_TYPE>(
    REPORT_FILTER_TYPE.MONTH,
  );
  const [groupBy, setGroupBy] = useState<REPORT_GROUP_BY>(
    REPORT_GROUP_BY.MONTH,
  );
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [metric, setMetric] = useState<string>("uniqueUsers");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const engagementMetricOptions = useMemo(
    () => getEngagementMetricOptions(t),
    [t],
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchEngagementAnalyticsAction({
          filterType,
          groupBy,
          startDate: fromDate,
          endDate: toDate,
        });
        if (response.status && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching engagement analytics reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate, filterType, groupBy]);

  const categories = useMemo(() => {
    if (!data?.companies) return [];
    return data.companies.map((item) => item.period);
  }, [data]);

  const series = useMemo((): ApexOptions["series"] => {
    if (!data) return [];
    const key = metric as keyof (typeof data.companies)[0];
    return [
      {
        name: t("companies"),
        data: data.companies.map((item) => Number(item[key]) || 0),
      },
      {
        name: t("groups"),
        data: data.groups.map((item) => Number(item[key]) || 0),
      },
      {
        name: t("events"),
        data: data.events.map((item) => Number(item[key]) || 0),
      },
    ];
  }, [data, metric, t]);

  const chartOptions: ApexOptions = {
    ...getAreaChartOptions(isFullScreen, resolvedTheme),
    colors: ["#3b82f6", "#10b981", "#f59e0b"],
    xaxis: {
      categories: categories,
    },
    tooltip: {
      y: {
        formatter: (value: number) => Math.round(value).toString(),
      },
    },
  };

  const extraHeaderControls = (
    <div className="w-56">
      <Select
        value={engagementMetricOptions.find((o) => o.value === metric)}
        onChange={(option) => option && setMetric(option.value)}
        options={engagementMetricOptions}
        isClearable={false}
        placeholder={t("metric")}
      />
    </div>
  );

  return (
    <AnalyticsChartCard
      title={t("engagementTitle")}
      subtitle={t("engagementSubtitle")}
      loading={loading}
      hasData={!!data}
      isFullScreen={isFullScreen}
      onMaximize={() => setIsFullScreen(true)}
      onCloseFullScreen={() => setIsFullScreen(false)}
      extraHeaderControls={extraHeaderControls}
      filterProps={{
        filterType,
        groupBy,
        fromDate,
        toDate,
        onFilterTypeChange: setFilterType,
        onGroupByChange: setGroupBy,
        onDateRangeApply: (start: string, end: string) => {
          setFromDate(start);
          setToDate(end);
        },
        onDateRangeClear: () => {
          setFromDate("");
          setToDate("");
        },
      }}
    >
      <ReactApexCharts
        type="area"
        height={isFullScreen ? "100%" : 400}
        series={series}
        options={chartOptions}
      />
    </AnalyticsChartCard>
  );
};

export default EngagementAnalyticsChart;
