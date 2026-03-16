import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ChartContentRendererProps {
  loading: boolean;
  hasData: boolean;
  series: ApexOptions["series"];
  options: ApexOptions;
  height?: number;
  emptyMessage?: string;
}

/**
 * Shared component for rendering chart content with loading and empty states
 */
export const ChartContentRenderer: React.FC<ChartContentRendererProps> = ({
  loading,
  hasData,
  series,
  options,
  height = 400,
  emptyMessage = "No data available",
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b border-bordergray200-2 border-darkbordercolor1"></div>
      </div>
    );
  }

  if (hasData) {
    return (
      <ReactApexCharts
        type="bar"
        height={height}
        series={series}
        options={options}
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-[350px] text-gray-500">
      {emptyMessage}
    </div>
  );
};
