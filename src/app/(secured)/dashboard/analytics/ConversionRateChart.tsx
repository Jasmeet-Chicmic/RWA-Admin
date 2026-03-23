"use client";

import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
  CHART_COLORS,
  REPORT_FILTER_TYPE,
  REPORT_GROUP_BY,
  THEME_TYPE,
} from "@/shared/constants";
import { formatToFixed } from "@/shared/utils/unitUtils";
import { fetchConversionRateAction, ConversionRateData } from "@/api/dashboard";
import AnalyticsChartCard from "./AnalyticsChartCard";
import { getAreaChartOptions } from "./chartOptions";

const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ConversionRateChartProps {
  initialFromDate?: string;
  initialToDate?: string;
}

const ConversionRateChart = ({
  initialFromDate = "",
  initialToDate = "",
}: ConversionRateChartProps) => {
  const t = useTranslations("dashboard");
  const { resolvedTheme } = useTheme();
  const [data, setData] = useState<ConversionRateData | null>(null);
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
        const response = await fetchConversionRateAction({
          filterType,
          groupBy,
          startDate: fromDate,
          endDate: toDate,
        });
        if (response.status && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching conversion rate reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate, filterType, groupBy]);

  const categories = useMemo(() => {
    if (!data?.groups?.data) return [];
    return data.groups.data.map((item) => item.period);
  }, [data]);

  const series = useMemo((): ApexOptions["series"] => {
    if (!data) return [];
    //temporarily removed groupd and events
    return [
      // {
      //   name: t("groups"),
      //   data: data.groups.data.map((item) => item.conversionRate),
      // },
      {
        name: t("companies"),
        data: data.companies.data.map((item) => item.conversionRate),
      },
      // {
      //   name: t("events"),
      //   data: data.events.data.map((item) => item.conversionRate),
      // },
    ];
  }, [data, t]);

  const chartColor = useMemo(
    () =>
      resolvedTheme === THEME_TYPE.DARK
        ? CHART_COLORS.SECONDARY
        : CHART_COLORS.PRIMARY,
    [resolvedTheme],
  );

  const chartOptions: ApexOptions = {
    ...getAreaChartOptions(isFullScreen, resolvedTheme),
    colors: [chartColor],
    xaxis: {
      categories: categories,
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `${formatToFixed(value, 1)}%`,
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${formatToFixed(value, 2)}%`,
      },
      x: {
        show: true,
      },
    },
  };

  return (
    <AnalyticsChartCard
      title={t("conversionRateTitle")}
      subtitle={t("conversionRateSubtitle")}
      loading={loading}
      hasData={!!data}
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
        type="area"
        height={isFullScreen ? "100%" : 400}
        series={series}
        options={chartOptions}
      />
    </AnalyticsChartCard>
  );
};

export default ConversionRateChart;
