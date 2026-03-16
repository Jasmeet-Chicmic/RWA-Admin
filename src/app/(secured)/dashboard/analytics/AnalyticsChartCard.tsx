"use client";

import React, { ReactNode } from "react";
import { useTranslations } from "next-intl";
import ChartFilters, { ChartFiltersProps } from "./ChartFilters";
import FullScreenChartModal from "./FullScreenChartModal";

interface AnalyticsChartCardProps {
  title: string;
  subtitle?: string;
  filterProps: Omit<ChartFiltersProps, "onMaximize">;
  isFullScreen: boolean;
  onMaximize: () => void;
  onCloseFullScreen: () => void;
  children: ReactNode;
  extraHeaderControls?: ReactNode;
  loading?: boolean;
  hasData?: boolean;
}

const AnalyticsChartCard = ({
  title,
  subtitle,
  filterProps,
  isFullScreen,
  onMaximize,
  onCloseFullScreen,
  children,
  extraHeaderControls,
  loading,
  hasData = true,
}: AnalyticsChartCardProps) => {
  const t = useTranslations("dashboard");
  return (
    <div className="bg-bgwhite rounded-[20px] border border-bordergray200 p-3 lg:p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1 h-full">
      <div className="flex gap-4 mb-4 justify-between flex-col xl:flex-row flex-wrap 3xl:flex-nowrap">
        <div>
          <h3 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-textprimary dark:text-bgwhite">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-4 items-center w-auto 3xl:w-[66%] 3xl:justify-end">
          {extraHeaderControls}
          <ChartFilters {...filterProps} onMaximize={onMaximize} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primarycolor"></div>
        </div>
      ) : hasData ? (
        children
      ) : (
        <div className="flex items-center justify-center h-[400px] text-gray-500">
          {t("noData")}
        </div>
      )}

      <FullScreenChartModal
        isOpen={isFullScreen}
        onClose={onCloseFullScreen}
        title={title}
        subtitle={subtitle}
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-end gap-4 mb-4 items-center">
            {extraHeaderControls}
            <ChartFilters {...filterProps} />
          </div>
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primarycolor"></div>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </FullScreenChartModal>
    </div>
  );
};

export default AnalyticsChartCard;
