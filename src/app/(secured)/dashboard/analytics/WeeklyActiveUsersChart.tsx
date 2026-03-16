"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import DateRangeFilterDropdown from "@/components/atoms/DateRangeFilter/DateRangeFilterDropdown";
import { THEME_TYPE, CHART_COLORS } from "@/shared/constants";
import { useTranslations } from "next-intl";

const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export interface ActivityData {
  date: string;
  activeUsers: number;
}

interface WeeklyActiveUsersChartProps {
  activityData: ActivityData[];
  initialFromDate?: string;
  initialToDate?: string;
}

const WeeklyActiveUsersChart = ({
  activityData,
  initialFromDate = "",
  initialToDate = "",
}: WeeklyActiveUsersChartProps) => {
  const t = useTranslations("dashboard");
  const { resolvedTheme } = useTheme();
  // Prepare data for Activity chart (Weekly Active Users)
  const activityCategories = activityData.map((item) => {
    const date = new Date(item.date);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  });

  const activityChartData = activityData.map((item) => item.activeUsers);

  const chartColor = useMemo(
    () =>
      resolvedTheme === THEME_TYPE.DARK
        ? CHART_COLORS.SECONDARY
        : CHART_COLORS.PRIMARY,
    [resolvedTheme],
  );

  // Activity Bar Chart options
  const activityChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "50%",
        dataLabels: {
          position: "top",
        },
      },
    },
    xaxis: {
      categories: activityCategories,
      labels: {
        style: {
          colors: "#99a1af",
          fontFamily: "inherit",
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#99a1af",
          fontFamily: "inherit",
        },
        formatter: (value: number) => Math.round(value).toString(),
      },
    },
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
    tooltip: {
      y: {
        formatter: (value: number) =>
          `${value} ${t("weeklyActiveUsersTooltip")}`,
      },
    },
    grid: {
      borderColor: "transparent",
      strokeDashArray: 4,
    },
    dataLabels: {
      enabled: true,
      formatter: (value: number) => value.toString(),
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#99a1af"],
      },
    },
  };

  const activitySeries: ApexOptions["series"] = [
    {
      name: t("weeklyActiveUsersSeries"),
      data: activityChartData,
    },
  ];

  return (
    <div className="bg-bgwhite rounded-lg p-0 dark:bg-darkbgprimary dark:border-darkbordercolor1">
      <div className="flex gap-4 mb-4 justify-between flex-col xl:flex-row">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-textprimary dark:text-bgwhite">
              {t("weeklyActiveUsersTitle")}
            </h3>
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {t("weeklyActiveUsersSubtitle")}
            </p>
          </div>
        </div>
        <DateRangeFilterDropdown
          initialFromDate={initialFromDate}
          initialToDate={initialToDate}
          useUrlParams={true}
        />
      </div>
      {activityData.length > 0 ? (
        <ReactApexCharts
          type="bar"
          height={400}
          series={activitySeries}
          options={activityChartOptions}
        />
      ) : (
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          {t("noData")}
        </div>
      )}
    </div>
  );
};

export default WeeklyActiveUsersChart;
