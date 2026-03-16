"use client";
import { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useId } from "react";

import DropdownMenu from "@/components/atoms/DropdownMenu";
import { COLORS, THEME_TYPE } from "@/shared/constants";

import { LISTING_OPTIONS } from "../PopularProducts/helpers/types";

// Dynamically import ApexChart
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type StatItem = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass?: string; // e.g., text-violet-500
};

type Props = {
  title: string;
  subtitle?: string;
  totalCount: number | string;
  stats: StatItem[];
  progressPercent: number; // 0–100
  progressLabel?: string; // Default: 'Completed Task'
};

export default function SupportTrackerCard({
  title,
  subtitle = "Last 7 Days",
  totalCount,
  stats,
  progressPercent,
  progressLabel = "Completed Task",
}: Props) {
  const { resolvedTheme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const newParams = new URLSearchParams(searchParams.toString());
  const baseId = useId();

  const onMenuSelect = (value: number) => {
    newParams.set("supportTrack", value.toString());
    router.push(`?${newParams.toString()}`);
  };

  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true },
    },
    stroke: { dashArray: 10 },
    labels: [progressLabel],
    colors: [
      resolvedTheme === THEME_TYPE.DARK
        ? COLORS.PRIMARY_DARK
        : COLORS.PRIMARY_LIGHT,
    ],
    states: {
      hover: {
        filter: { type: "none" },
      },
      active: {
        filter: { type: "none" },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        opacityTo: 0.5,
        opacityFrom: 1,
        shadeIntensity: 0.5,
        stops: [30, 70, 100],
        inverseColors: false,
        gradientToColors: [
          resolvedTheme === THEME_TYPE.DARK
            ? COLORS.PRIMARY_DARK
            : COLORS.PRIMARY_LIGHT,
        ],
      },
    },
    plotOptions: {
      radialBar: {
        endAngle: 130,
        startAngle: -140,
        hollow: { size: "60%" },
        track: { background: "transparent" },
        dataLabels: {
          name: {
            offsetY: -15,
            color: resolvedTheme === THEME_TYPE.DARK ? "#a3a3a3" : "#9ca3af",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          },
          value: {
            offsetY: 15,
            fontWeight: 500,
            formatter: (value) => `${value}%`,
            color: resolvedTheme === THEME_TYPE.DARK ? "#fff" : "#1f2937",
            fontFamily: "Inter, sans-serif",
            fontSize: "32px",
          },
        },
      },
    },
    grid: {
      padding: {
        top: -30,
        bottom: 12,
      },
    },
    responsive: [
      {
        breakpoint: 1300,
        options: {
          grid: {
            padding: {
              left: 22,
            },
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          grid: {
            padding: {
              left: 0,
            },
          },
        },
      },
    ],
  };

  return (
    <div className="bg-bgwhite rounded-[5px] shadow-customsm w-full flex flex-col p-[25px] dark:bg-darkbgprimary">
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

      <div className="flex items-center justify-between mt-[40px]">
        {/* Left */}
        <div className="p-0">
          <div className="text-heading text-gray-800 mb-1 dark:bordercolor1">
            {totalCount}
          </div>
          <p className="text-subtitle bordercolor1 mb-6 dark:bordercolor1">
            Total Tickets
          </p>

          {/* Dynamic stats */}
          <div className="space-y-4 text-sm">
            {stats.map((item, id) => (
              <div
                className="flex items-center gap-[20px] text-gray-500 dark:bordercolor1"
                key={`${baseId}-stat-${id}`}
              >
                <span
                  className={`${item.colorClass} w-[30px] h-[30px] flex rounded-[5px] justify-center items-center p-[6px]`}
                >
                  {item.icon}
                </span>
                <div className="flex flex-col gap-[0px]">
                  <span className="text-subtitle text-gray-800 dark:bordercolor1">
                    {item.label}
                  </span>
                  <span className="font-medium text-content dark:bordercolor1">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chart */}
        <Chart
          type="radialBar"
          height={325}
          options={options}
          series={[progressPercent]}
        />
      </div>
    </div>
  );
}
