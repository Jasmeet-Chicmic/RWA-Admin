"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

import DropdownMenu from "@/components/atoms/DropdownMenu";

import { LISTING_OPTIONS } from "../PopularProducts/helpers/types";

// ApexCharts needs to be dynamically imported to prevent SSR issues in Next.js
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const options: ApexOptions = {
  stroke: {
    show: false,
    width: 0,
  },
  chart: {
    type: "bar",
    height: "100%",
    width: "100%",
    toolbar: { show: false },
    sparkline: { enabled: false },
  },
  legend: { show: false },
  colors: [
    "rgba(123, 91, 231, 0.16)", // Meta UI secondary purple with low opacity
    "rgba(123, 91, 231, 0.16)",
    "rgba(123, 91, 231, 0.16)",
    "rgba(123, 91, 231, 0.16)",
    "#7B5BE7", // Full opacity for highlight
    "rgba(123, 91, 231, 0.16)",
    "rgba(123, 91, 231, 0.16)",
  ],
  plotOptions: {
    bar: {
      columnWidth: "35%",
      borderRadius: 6,
      distributed: true,
    },
  },
  xaxis: {
    categories: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    labels: {
      style: {
        colors: "#64748B", // Meta UI neutral label color
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
    show: false,
    min: 0,
    forceNiceScale: false,
    floating: true, // <- Optional, reduces padding
  },
  grid: {
    show: false,
    padding: {
      left: 0,
      right: 0,
      top: -50,
      bottom: 0,
    },
  },
  tooltip: { enabled: false },
  dataLabels: {
    enabled: false,
    offsetY: 0,
  },
  responsive: [
    {
      breakpoint: 1480,
      options: {
        chart: {
          height: "100%",
          width: "100%",
        },
        xaxis: {
          labels: {
            style: {
              fontSize: "12px",
            },
          },
        },
      },
    },
  ],
};

export default function EarningReportCard({
  title,
  subtitle,
  stats,
  series,
  type = "analytics",
}: {
  title: string;
  subtitle?: string;
  stats?: {
    label: string;
    value: string | number;
    color: string;
    barColor: string;
    icon: React.ReactNode;
  }[];
  series: ApexAxisChartSeries | ApexNonAxisChartSeries | undefined;
  type?: "crm" | "analytics";
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const newParams = new URLSearchParams(searchParams.toString());

  const onMenuSelect = (value: number) => {
    newParams.set("earningReport", value.toString());
    router.push(`?${newParams.toString()}`);
  };

  return (
    <div className="bg-bgwhite rounded-[5px] shadow-customsm p-[25px] w-full h-full dark:bg-darkbgprimary">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-title font-semibold text-gray-800 dark:bordercolor1">
            {title}
          </h2>
          <p className="text-subtitle text-gray-500 dark:bordercolor1">
            {subtitle}
          </p>
        </div>
        <DropdownMenu options={LISTING_OPTIONS} onSelect={onMenuSelect} />
      </div>

      {/* Earnings Summary */}
      <div className="flex items-center justify-between 2xl:gap-[50px] gap-[30px]">
        <div className="pr-[15px]">
          <div className="flex items-center gap-2 mb-[10px]">
            <div className="text-heading text-gray-900 dark:bordercolor1">
              $468
            </div>
            {type === "analytics" && (
              <span className="text-green-500 text-[0.875] font-medium bg-green-100 px-1.5 py-0.5 rounded">
                +4.2%
              </span>
            )}
          </div>
          {type === "crm" ? (
            <span className="text-green-500 text-[0.875] font-medium bg-green-100 px-1.5 py-0.5 rounded">
              +4.2%
            </span>
          ) : (
            <span className="text-content leading-[16px] block bordercolor1 dark:bordercolor1">
              You informed of this week compared to last week
            </span>
          )}
        </div>

        {/* Apex Bar Chart */}
        <div className="relative p-0 w-full h-full">
          <Chart
            className="no-min-height"
            type="bar"
            options={options}
            series={series}
            height="100%"
            width="100%"
          />
        </div>
      </div>
      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="mt-1 border border-b border-bordergray200ggray rounded-[5px] p-[20px] text-content flex gap-[15px]">
          {stats.map((item, i) => (
            <div className="w-[33%]" key={i}>
              <div className="flex items-center gap-[10px] text-subtitle text-menucolor font-medium mb-1">
                <span className={`${item.color} p-[5px] rounded-[5px]`}>
                  {item.icon}
                </span>
                {item.label}
              </div>
              <div className="font-semibold text-gray-800 mb-1 text-subheading dark:bordercolor1">
                {item.value}
              </div>
              <div className="w-[75%] h-1 bg-gray-200 rounded dark:bg-darkbgprimary">
                <div
                  className={`${item.barColor} h-1 rounded`}
                  style={{ width: "75%" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
