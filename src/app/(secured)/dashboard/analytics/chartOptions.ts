import { ApexOptions } from "apexcharts";
import { THEME_TYPE } from "@/shared/constants";

export const getBaseChartOptions = (
  isFullScreen: boolean,
  resolvedTheme: string | undefined,
): ApexOptions => ({
  chart: {
    toolbar: {
      show: isFullScreen,
      tools: {
        download: false,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
    },
    zoom: {
      enabled: isFullScreen,
      type: "x",
      autoScaleYaxis: true,
    },
  },
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        colors: "#99a1af",
        fontFamily: "inherit",
        fontSize: "12px",
      },
    },
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
  grid: {
    borderColor: "transparent",
    strokeDashArray: 4,
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
    labels: {
      colors: resolvedTheme === THEME_TYPE.DARK ? "#fff" : "#000",
    },
  },
});

export const getBarChartOptions = (
  isFullScreen: boolean,
  resolvedTheme: string | undefined,
): ApexOptions => {
  const base = getBaseChartOptions(isFullScreen, resolvedTheme);
  return {
    ...base,
    chart: {
      ...base.chart,
      type: "bar",
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "40%",
        dataLabels: {
          position: "top",
        },
      },
    },
    xaxis: {
      ...base.xaxis,
      tickPlacement: "on",
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#99a1af"],
      },
    },
  };
};

export const getAreaChartOptions = (
  isFullScreen: boolean,
  resolvedTheme: string | undefined,
): ApexOptions => {
  const base = getBaseChartOptions(isFullScreen, resolvedTheme);
  return {
    ...base,
    chart: {
      ...base.chart,
      type: "area",
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
  };
};

export const getLineChartOptions = (
  isFullScreen: boolean,
  resolvedTheme: string | undefined,
): ApexOptions => {
  const base = getBaseChartOptions(isFullScreen, resolvedTheme);
  return {
    ...base,
    chart: {
      ...base.chart,
      type: "line",
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
  };
};

export const getPieChartOptions = (
  isFullScreen: boolean,
  resolvedTheme: string | undefined,
  totalLabel: string = "Total",
): ApexOptions => {
  const base = getBaseChartOptions(isFullScreen, resolvedTheme);
  return {
    ...base,
    chart: {
      ...base.chart,
      type: "donut",
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return Math.round(val) + "%";
      },
      dropShadow: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: totalLabel,
              fontSize: "14px",
              fontFamily: "inherit",
              fontWeight: 600,
              color: resolvedTheme === THEME_TYPE.DARK ? "#fff" : "#000",
              formatter: function (w) {
                return w.globals.seriesTotals
                  .reduce((a: number, b: number) => a + b, 0)
                  .toLocaleString();
              },
            },
            value: {
              show: true,
              fontSize: "16px",
              fontFamily: "inherit",
              fontWeight: 700,
              color: resolvedTheme === THEME_TYPE.DARK ? "#fff" : "#000",
              offsetY: 5,
              formatter: function (val) {
                return val.toLocaleString();
              },
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      labels: {
        colors: resolvedTheme === THEME_TYPE.DARK ? "#fff" : "#000",
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
  };
};
