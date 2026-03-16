"use client";
import { ApexOptions } from "apexcharts";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";

import DropdownMenu from "@/components/atoms/DropdownMenu";
import ReactApexcharts from "@/components/atoms/react-apexcharts";
import { THEME_TYPE } from "@/shared/constants";

import { LISTING_OPTIONS } from "../PopularProducts/helpers/types";

type ChartSeries = {
  name: string;
  data: number[];
};

type StatRow = {
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  value: string | number;
  valueColor?: string; // tailwind class, e.g. "text-green-500"
  bgColor?: string; // tailwind class, e.g. "bg-gray-100"
};

type Props = {
  title: string;
  percentage: number;
  change: number;
  series: ChartSeries[];
  categories: string[];
  stats: StatRow[];
};

export default function TotalEarningCard({
  title,
  percentage,
  change,
  series,
  stats,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const newParams = new URLSearchParams(searchParams.toString());

  const onMenuSelect = (value: number) => {
    newParams.set("totalEarnings", value.toString());
    router.push(`?${newParams.toString()}`);
  };
  const { resolvedTheme } = useTheme();
  const options: ApexOptions = {
    chart: {
      stacked: true,
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    legend: { show: false },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    stroke: {
      width: 5,
      lineCap: "round",
      colors: [resolvedTheme === THEME_TYPE.DARK ? "#111827" : "white"],
    },
    colors: ["#808390", "#7367f0"],
    states: {
      hover: {
        filter: { type: "none" },
      },
      active: {
        filter: { type: "none" },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: "around",
        columnWidth: "40%",
      },
    },
    grid: {
      borderColor: "green",
      yaxis: {
        lines: { show: false },
      },
      padding: {
        top: -20,
        left: -5,
        right: -2,
        bottom: -12,
      },
    },
    xaxis: {
      axisTicks: { show: false },
      crosshairs: { opacity: 0 },
      axisBorder: { show: false },
    },
    yaxis: {
      labels: { show: false },
    },
    responsive: [
      {
        breakpoint: 1280,
        options: { plotOptions: { bar: { columnWidth: "50%" } } },
      },
      {
        breakpoint: 1024,
        options: { plotOptions: { bar: { columnWidth: "40%" } } },
      },
      {
        breakpoint: 768,
        options: { plotOptions: { bar: { columnWidth: "25%" } } },
      },
      {
        breakpoint: 640,
        options: { plotOptions: { bar: { columnWidth: "42%" } } },
      },
    ],
  };

  return (
    <div className="bg-bgwhite rounded-[5px] shadow-customsm w-full flex flex-col p-[25px] dark:bg-darkbgprimary">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-title text-gray-800 dark:bordercolor1">{title}</h3>
        <DropdownMenu options={LISTING_OPTIONS} onSelect={onMenuSelect} />
      </div>

      {/* Percentage */}
      <div className="flex items-center gap-2 mb-4">
        <div className="text-heading text-gray-800 dark:bordercolor1">
          {percentage}%
        </div>
        <div
          className={clsx(
            "text-content inline-flex items-center gap-1 dark:bordercolor1",
            change >= 0 ? "text-green-500" : "text-red-500",
          )}
        >
          {change >= 0 ? <ChevronUp /> : <ChevronDown />} {Math.abs(change)}%
        </div>
      </div>

      {/* Chart */}
      <div className="-ml-3">
        <ReactApexcharts
          options={options}
          series={series}
          type="bar"
          height={200}
        />
      </div>

      {/* Stats */}
      <div className="mt-4 space-y-3">
        {stats.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  "w-8 h-8 flex items-center justify-center rounded-md",
                  item.bgColor || "bg-gray-100",
                )}
              >
                {item.icon}
              </div>
              <div>
                <div className="font-medium text-labelprimary dark:bordercolor1">
                  {item.label}
                </div>
                <div className="text-[0.875] bordercolor1 dark:bordercolor1">
                  {item.subLabel}
                </div>
              </div>
            </div>
            <div
              className={clsx(
                "font-semibold dark:bordercolor1",
                item.valueColor || "text-gray-800 dark:bordercolor1",
              )}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
