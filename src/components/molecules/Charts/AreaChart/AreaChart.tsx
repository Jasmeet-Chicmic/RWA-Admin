"use client";

import { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";

import CustomCard from "@/components/atoms/CustomCard";
import { THEME_TYPE } from "@/shared/constants";
import { ChartStatConfig } from "@/shared/types/chart-config";

const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type AreaChartProps = {
  config: ChartStatConfig;
};

const AreaChart = ({ config }: AreaChartProps) => {
  const {
    title,
    subtitle,
    value,
    change,
    changeColor = "text-green-600",
    color = "#22c55e",
    height = 96,
    series,
    totalValue,
  } = config;
  const { resolvedTheme } = useTheme();
  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    stroke: {
      width: 2,
      curve: "smooth",
    },
    grid: {
      show: false,
      padding: { top: 5, bottom: 20 },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 1,
        opacityTo: 0,
        shadeIntensity: 1,
        stops: [0, 100],
        colorStops: [
          [
            {
              offset: 0,
              opacity: 0.4,
              color: color,
            },
            {
              offset: 100,
              opacity: 0,
              color: resolvedTheme === THEME_TYPE.DARK ? "#000" : "#ffffff",
            },
          ],
        ],
      },
    },
    theme: {
      monochrome: {
        enabled: true,
        shadeTo: "light",
        shadeIntensity: 1,
        color: color,
      },
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
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
      totalValue={totalValue}
    >
      <ReactApexCharts
        type="area"
        height={height}
        series={series}
        options={options}
      />
    </CustomCard>
  );
};

export default AreaChart;
