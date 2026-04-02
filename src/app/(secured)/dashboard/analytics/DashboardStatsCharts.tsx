"use client";

import StatCard from "@/components/atoms/StatCard";
import {
  AdminPropertiesDetails,
  DashboardAnalyticsData,
  SubscriptionAnalytics,
  UserSignupGraphPoint,
  UserRetentionData,
} from "@/services/analytics-service";
// import { DISPLAY_CURRENCY } from "@/shared/utils/unitUtils";
import { ApexOptions } from "apexcharts";
import { Activity, TrendingUp, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import TopPropertiesTable from "./TopPropertiesTable";

const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

function parseYyyyMmDdToDate(value: string): Date {
  // Ensure timezone-stable parsing for YYYY-MM-DD.
  return new Date(`${value}T00:00:00Z`);
}

const UserSignupTimelineChart = ({
  data,
}: {
  data: UserSignupGraphPoint[];
}) => {
  const t = useTranslations("dashboard");
  const chartColor = "#C7FE1E";

  const categories = useMemo(
    () =>
      data.map((item) =>
        parseYyyyMmDdToDate(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      ),
    [data],
  );

  const series: ApexOptions["series"] = useMemo(
    () => [
      {
        name: t("userSignupsSeries"),
        data: data.map((item) => item.total),
      },
    ],
    [data, t],
  );

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      markers: {
        size: 4,
        strokeWidth: 2,
        strokeColors: "#0f172a",
        colors: [chartColor],
        hover: {
          size: 6,
        },
      },
      xaxis: {
        categories,
        labels: {
          style: {
            colors: "#99a1af",
            fontFamily: "inherit",
            fontSize: "12px",
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
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
          shade: "dark",
          type: "vertical",
          shadeIntensity: 0.35,
          opacityFrom: 0.9,
          opacityTo: 0.2,
          colorStops: [
            { offset: 0, color: chartColor, opacity: 1 },
            { offset: 100, color: "#4d7f00", opacity: 0.15 },
          ],
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (value: number) => `${value} ${t("userSignupsTooltip")}`,
        },
      },
      grid: {
        borderColor: "transparent",
        strokeDashArray: 4,
      },
      dataLabels: {
        enabled: false,
      },
    }),
    [categories, chartColor, t],
  );

  return (
    <div className="bg-bgwhite rounded-[20px] border border-bordergray200 p-3 lg:p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1">
      <div className="mb-4">
        <h3 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-textprimary dark:text-bgwhite">
          {t("userSignupsTitle")}
        </h3>
        <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
          {t("userSignupsSubtitle")}
        </p>
      </div>

      {data.length > 0 ? (
        <ReactApexCharts
          type="area"
          width="100%"
          height={400}
          series={series}
          options={options}
        />
      ) : (
        <div className="flex items-center justify-center h-[400px] text-gray-500">
          {t("noData")}
        </div>
      )}
    </div>
  );
};

interface DashboardStatsChartsProps {
  retentionData: UserRetentionData;
  subscriptionAnalytics: SubscriptionAnalytics;
  propertiesDetails: AdminPropertiesDetails;
  dashboardAnalytics: DashboardAnalyticsData;
  userSignupGraph: UserSignupGraphPoint[];
  initialFromDate?: string;
  initialToDate?: string;
}

const DashboardStatsCharts = ({
  // propertiesDetails,
  dashboardAnalytics,
  userSignupGraph,
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
      <div className="space-y-4">
        <div className="w-full">
          <UserSignupTimelineChart data={userSignupGraph} />
        </div>
        <div className="w-full">
          <TopPropertiesTable />
        </div>
      </div>
    </div>
  );
};

export default DashboardStatsCharts;
