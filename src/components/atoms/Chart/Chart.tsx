"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import React from "react";
import { ChartType } from "@/shared/types";

const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export type ChartProps = {
  type: ChartType;
  height?: number;
  chartColor?: string;
  chartColor2?: string;
  series: ApexOptions["series"];
  customOptions?: ApexOptions;
};

const Chart = ({
  type,
  height = 300,
  chartColor = "#3b82f6",
  chartColor2,
  series,
  customOptions = {},
}: ChartProps) => {
  const defaultOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    tooltip: { enabled: true },
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
              color: chartColor,
            },
            {
              offset: 100,
              opacity: 0,
              color: chartColor2 ?? chartColor,
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
        color: chartColor,
      },
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: { show: false },
  };

  const mergedOptions: ApexOptions = {
    ...defaultOptions,
    ...customOptions,
    chart: { ...defaultOptions.chart, ...customOptions.chart },
    fill: { ...defaultOptions.fill, ...customOptions.fill },
    stroke: { ...defaultOptions.stroke, ...customOptions.stroke },
    xaxis: { ...defaultOptions.xaxis, ...customOptions.xaxis },
    yaxis: { ...defaultOptions.yaxis, ...customOptions.yaxis },
    theme: { ...defaultOptions.theme, ...customOptions.theme },
    grid: { ...defaultOptions.grid, ...customOptions.grid },
  };

  return (
    <ReactApexCharts
      type={type}
      height={height}
      series={series}
      options={mergedOptions}
    />
  );
};

export default Chart;
