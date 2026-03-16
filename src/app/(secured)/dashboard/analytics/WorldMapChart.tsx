"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { THEME_TYPE, CHART_COLORS } from "@/shared/constants";

// Dynamically import WorldMap to avoid SSR issues
const WorldMap = dynamic(
  () => import("react-svg-worldmap").then((mod) => mod.WorldMap),
  { ssr: false },
);

interface DataItem {
  country: string;
  value: number | string;
}

interface StyleContext {
  countryValue: number;
  minValue: number;
  maxValue: number;
  color: string;
}

interface WorldMapChartProps {
  data: DataItem[];
}

const WorldMapChart = ({ data }: WorldMapChartProps) => {
  const t = useTranslations("dashboard");
  const { resolvedTheme } = useTheme();
  const stylingFunction = (context: StyleContext) => {
    // Calculate max value from data if available, otherwise use a default
    const maxValue =
      data.length > 0 ? Math.max(...data.map((d) => Number(d.value))) : 100;

    const opacityLevel =
      0.3 +
      (10 * (Number(context.countryValue) - context.minValue)) /
        (maxValue - context.minValue || 1);

    return {
      fill: context.color,
      fillOpacity: Number.isNaN(opacityLevel) ? 0 : opacityLevel,
      stroke: "white",
      strokeWidth: 1,
      strokeOpacity: 0.2,
      cursor: "pointer",
    };
  };

  const filteredData = data.filter(
    (item) => item.country !== "EP" && item.country !== "WO",
  );

  const chartColor = useMemo(
    () =>
      resolvedTheme === THEME_TYPE.DARK
        ? CHART_COLORS.SECONDARY
        : CHART_COLORS.PRIMARY,
    [resolvedTheme],
  );

  return (
    <div className="bg-bgwhite dark:bg-darkbgprimary rounded-lg p-0 dark:border-darkbordercolor1 w-full h-full">
      <div className="mb-4">
        <h3 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-textprimary dark:text-bgwhite">
          {t("usersByCountryTitle")}
        </h3>
        <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
          {t("usersByCountrySubtitle")}
        </p>
      </div>
      <div className="flex justify-center items-center overflow-hidden w-full h-full">
        <WorldMap
          richInteraction={true}
          backgroundColor={"transparent"}
          borderColor={"white"}
          color={chartColor} // Using the primary purple-blue color
          tooltipBgColor={"#1f2937"}
          title=""
          valueSuffix={` ${t("usersByCountryTooltip")}`}
          valuePrefix=":"
          size="responsive"
          data={filteredData}
          styleFunction={
            stylingFunction as unknown as (context: unknown) => object
          }
        />
      </div>
    </div>
  );
};

export default WorldMapChart;
