"use client";

import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
  REPORT_FILTER_TYPE,
  REPORT_GROUP_BY,
  THEME_TYPE,
  CHART_COLORS,
} from "@/shared/constants";
import { fetchGroupJoinedAction, GroupJoinedData } from "@/api/dashboard";
import AnalyticsChartCard from "./AnalyticsChartCard";
import { getBarChartOptions } from "./chartOptions";

const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface GroupJoinedChartProps {
  initialFromDate?: string;
  initialToDate?: string;
}

const GroupJoinedChart = ({
  initialFromDate = "",
  initialToDate = "",
}: GroupJoinedChartProps) => {
  const t = useTranslations("dashboard");
  const { resolvedTheme } = useTheme();
  const [data, setData] = useState<GroupJoinedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<REPORT_FILTER_TYPE>(
    REPORT_FILTER_TYPE.MONTH,
  );
  const [groupBy, setGroupBy] = useState<REPORT_GROUP_BY>(
    REPORT_GROUP_BY.MONTH,
  );
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchGroupJoinedAction({
          filterType,
          groupBy,
          startDate: fromDate,
          endDate: toDate,
        });
        if (response.status && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching group joined reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate, filterType, groupBy]);

  const categories = useMemo(() => data.map((item) => item.period), [data]);
  const seriesData = useMemo(() => data.map((item) => item.count), [data]);

  const chartColor = useMemo(
    () =>
      resolvedTheme === THEME_TYPE.DARK
        ? CHART_COLORS.SECONDARY
        : CHART_COLORS.PRIMARY,
    [resolvedTheme],
  );

  const chartOptions: ApexOptions = {
    ...getBarChartOptions(isFullScreen, resolvedTheme),
    colors: [chartColor],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 1,
        opacityFrom: 0.8,
        opacityTo: 0.3,
        colorStops: [
          {
            offset: 0,
            color: chartColor,
            opacity: 1,
          },
          {
            offset: 100,
            color: "#ffffff",
            opacity: 0,
          },
        ],
      },
    },
    xaxis: {
      categories: categories,
      tickPlacement: "on",
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} ${t("groupJoinedTooltip")}`,
      },
    },
  };

  const series: ApexOptions["series"] = [
    {
      name: t("groupJoinedSeries"),
      data: seriesData,
    },
  ];

  return (
    <AnalyticsChartCard
      title={t("groupJoinedTitle")}
      subtitle={t("groupJoinedSubtitle")}
      loading={loading}
      hasData={data.length > 0}
      isFullScreen={isFullScreen}
      onMaximize={() => setIsFullScreen(true)}
      onCloseFullScreen={() => setIsFullScreen(false)}
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
        type="bar"
        height={isFullScreen ? "100%" : 400}
        series={series}
        options={chartOptions}
      />
    </AnalyticsChartCard>
  );
};

export default GroupJoinedChart;
