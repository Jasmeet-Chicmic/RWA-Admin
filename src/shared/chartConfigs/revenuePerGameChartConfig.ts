import { ApexOptions } from "apexcharts";
import { formatCurrency } from "@/shared/utils";
import { CHART_COLORS } from "@/shared/constants";
// Chart constants
const LOSS_COLOR = CHART_COLORS.SPENT;
const WHITE_COLOR = "#ffffff";
const LABEL_COLOR = "#99a1af";

const LABEL_STYLE = {
  colors: LABEL_COLOR,
  fontFamily: "inherit",
} as const;

const createGradientColorStop = (
  offset: number,
  color: string,
  opacity: number,
) => ({
  offset,
  color,
  opacity,
});

/**
 * Shared chart configuration for Revenue per Game charts
 * Used by both dashboard and user-specific revenue charts
 */
export const getRevenuePerGameChartOptions = (
  categories: string[],
  revenueColor: string,
): ApexOptions => {
  return {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: true,
        barHeight: "70%",
        distributed: false,
        dataLabels: {
          position: "center",
        },
      },
    },
    colors: [revenueColor, LOSS_COLOR],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 1,
        colorStops: [
          [
            createGradientColorStop(0, WHITE_COLOR, 0),
            createGradientColorStop(100, revenueColor, 1),
          ],
          [
            createGradientColorStop(0, LOSS_COLOR, 1),
            createGradientColorStop(100, WHITE_COLOR, 0),
          ],
        ],
      },
    },
    xaxis: {
      categories,
      labels: {
        style: LABEL_STYLE,
        formatter: (value: string) => formatCurrency(Number(value)),
      },
    },
    yaxis: {
      labels: {
        style: {
          ...LABEL_STYLE,
          fontSize: "13px",
          fontWeight: 500,
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => formatCurrency(value),
      },
    },
    grid: {
      borderColor: "transparent",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value: number) => (value ? formatCurrency(value) : ""),
      style: {
        fontSize: "12px",
        colors: [WHITE_COLOR],
        fontWeight: 600,
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: "#000",
        opacity: 0.45,
      },
    },
    legend: {
      show: false,
    },
  };
};

/**
 * Creates series data for the revenue per game chart
 */
export const getRevenuePerGameSeries = (
  positiveRevenue: number[],
  negativeRevenue: number[],
): ApexOptions["series"] => [
  {
    name: "Revenue",
    data: positiveRevenue,
  },
  {
    name: "Loss",
    data: negativeRevenue,
  },
];
