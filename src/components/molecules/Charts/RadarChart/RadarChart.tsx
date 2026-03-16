"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import CustomCard from "@/components/atoms/CustomCard";
import { ChartStatConfig } from "@/shared/types/chart-config";

const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type RadarChartProps = {
  config: ChartStatConfig;
};

const RadarChart = ({ config }: RadarChartProps) => {
  const {
    title,
    subtitle,
    value,
    change,
    changeColor = "text-green-600",
    color = "#3b82f6", // default blue
    secondaryColor = "#06b6d4", // default cyan
    height = 357,
    series,
    labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  } = config;

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
    },
    colors: [color, secondaryColor],
    plotOptions: {
      radar: {
        size: 110,
        polygons: {
          strokeColors: "#e5e7eb", // gray-200
          connectorColors: "#e5e7eb",
        },
      },
    },
    stroke: { width: 0 },
    fill: { opacity: [1, 0.85] },
    labels,
    markers: { size: 0 },
    legend: {
      fontSize: "13px",
      labels: { colors: ["#d1d5db"] }, // gray-500
      itemMargin: { vertical: 4, horizontal: 10 },
      markers: { offsetY: 1, offsetX: -4 },
    },
    grid: {
      show: false,
      padding: { top: 10 },
    },
    xaxis: {
      labels: {
        show: true,
        style: {
          fontSize: "14px",
          colors: new Array(labels.length).fill("#9ca3af"),
        },
      },
    },
    yaxis: { show: false },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: { height: 337 },
        },
      },
    ],
  };

  return (
    <CustomCard
      title={title}
      subtitle={subtitle}
      value={value}
      change={change}
      changeColor={changeColor}
    >
      <ReactApexCharts
        type="radar"
        height={height}
        series={series}
        options={options}
      />
    </CustomCard>
  );
};

export default RadarChart;
