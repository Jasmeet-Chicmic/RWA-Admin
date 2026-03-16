"use client";
import { ApexOptions } from "apexcharts";
import { DollarSign } from "lucide-react";
import { useTheme } from "next-themes";

import DropdownMenu from "@/components/atoms/DropdownMenu";
import ReactApexcharts from "@/components/atoms/react-apexcharts";
import { THEME_TYPE } from "@/shared/constants";

import { LISTING_OPTIONS } from "../PopularProducts/helpers/types";

const ProjectStatusCard = () => {
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
      width: 4,
      curve: "straight",
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityTo: 0,
        opacityFrom: 1,
        shadeIntensity: 1,
        stops: [0, 100],
        colorStops: [
          [
            {
              offset: 0,
              opacity: 0.4,
              color: "#FF9F43",
            },
            {
              offset: 100,
              opacity: 0.1,
              color: resolvedTheme === THEME_TYPE.DARK ? "#000" : "#fff0e1",
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
        color: "#FF9F43",
      },
    },
    grid: {
      show: false,
      padding: {
        top: 14,
        right: 5,
        bottom: 22,
      },
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: { show: false },
  };

  const series = [
    {
      name: "Earnings",
      data: [
        2000, 2000, 4000, 4000, 3050, 3050, 2050, 2050, 3050, 3050, 4700, 4700,
        2750, 2750, 5700, 5700,
      ],
    },
  ];

  return (
    <div className="bg-bgwhite rounded-[5px] shadow-customsm p-[25px] w-full h-full dark:bg-darkbgprimary">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-title font-semibold text-gray-800 dark:bordercolor1">
            {"Project Title"}
          </h2>
        </div>
        <DropdownMenu options={LISTING_OPTIONS} />
      </div>{" "}
      <div className="flex justify-between items-center mb-4">
        <div className="mt-2 flex items-center">
          <div className="bg-orange-100 p-2 rounded-full">
            <DollarSign size={16} className="text-orange-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:bordercolor1 dark:text-bgwhite">
              $4,3742
            </h3>
            <p className="text-[0.875] bordercolor1 dark:bordercolor1 dark:text-bgwhite">
              Your Earnings
            </p>
          </div>
        </div>
        <span className="text-green-500 text-sm font-semibold dark:text-bgwhite">
          +10.2%
        </span>
      </div>
      <div className="h-28">
        <ReactApexcharts
          options={options}
          series={series}
          type="area"
          height="100%"
          width="100%"
        />
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 font-medium dark:text-bgwhite">
            Donates
          </span>
          <span className="text-gray-900 dark:text-bgwhite">
            $756.26 <span className="text-red-500 ml-1">-139.34</span>
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 font-medium dark:text-bgwhite">
            Podcasts
          </span>
          <span className="text-gray-900 dark:text-bgwhite">
            $2,207.03 <span className="text-green-500 ml-1">+576.24</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusCard;
