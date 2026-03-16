"use client";

import dynamic from "next/dynamic";
import CustomCard from "@/components/atoms/CustomCard";
import { ApexOptions } from "apexcharts";
import { ChartStatConfig } from "@/shared/types/chart-config";
import { hexToRgb } from "@/shared/utils";

const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type BarChartProps = { config: ChartStatConfig };

const BarChart = ({ config }: BarChartProps) => {
  const {
    title,
    subtitle,
    value,
    change,
    changeColor,
    color,
    height,
    width,
    series,
    categories,
    showXLabel = true,
    columnWidth = "50%",
  } = config;
  const baseColor = color ?? "#3b82f6"; // Default to Tailwind blue-500
  const faded = "0.16";

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: false,
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        distributed: true,
        columnWidth,
      },
    },
    legend: { show: false },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    colors: new Array(7)
      .fill(`rgba(${hexToRgb(baseColor)},${faded})`)
      .map((c, i) => (i === 4 ? baseColor : c)),
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    grid: {
      show: false,
      padding: {
        top: 16,
        left: -8,
        right: 0,
        bottom: 16,
      },
    },
    xaxis: {
      categories,
      axisTicks: { show: false },
      axisBorder: { show: false },
      tickPlacement: "on",
      labels: {
        show: showXLabel,
        style: {
          colors: "#9CA3AF",
          fontFamily: "inherit",
          fontSize: "12px",
        },
      },
    },
    yaxis: { show: false },
  };

  return (
    <CustomCard
      title={title}
      subtitle={subtitle}
      value={value}
      change={change}
      changeColor={changeColor}
    >
      <div className="flex items-stretch justify-between gap-4">
        <ReactApexCharts
          type="bar"
          width={width}
          height={height}
          series={series}
          options={options}
        />
      </div>
    </CustomCard>
  );
};

export default BarChart;
