"use client";

import { useEffect, useMemo } from "react";
import {
  REPORT_FILTER_TYPE,
  REPORT_GROUP_BY,
  REPORT_FILTER_TYPE_OPTIONS,
  REPORT_GROUP_BY_OPTIONS,
} from "@/shared/constants";
import DateRangeFilterDropdown from "@/components/atoms/DateRangeFilter/DateRangeFilterDropdown";
import Select from "@/components/atoms/Select";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface OptionType {
  label: string;
  value: number;
}

export interface ChartFiltersProps {
  filterType: REPORT_FILTER_TYPE;
  groupBy: REPORT_GROUP_BY;
  fromDate: string;
  toDate: string;
  onFilterTypeChange: (type: REPORT_FILTER_TYPE) => void;
  onGroupByChange: (groupBy: REPORT_GROUP_BY) => void;
  onDateRangeApply: (start: string, end: string) => void;
  onDateRangeClear: () => void;
  onMaximize?: () => void;
}

const ChartFilters = ({
  filterType,
  groupBy,
  fromDate,
  toDate,
  onFilterTypeChange,
  onGroupByChange,
  onDateRangeApply,
  onDateRangeClear,
  onMaximize,
}: ChartFiltersProps) => {
  const t = useTranslations("dashboard");

  const filterTypeOptions: OptionType[] = useMemo(
    () =>
      REPORT_FILTER_TYPE_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
    [t],
  );

  const groupByOptions: OptionType[] = useMemo(
    () =>
      REPORT_GROUP_BY_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      })),
    [t],
  );

  const filteredGroupByOptions = useMemo(() => {
    switch (filterType) {
      case REPORT_FILTER_TYPE.DAY:
        return groupByOptions;
      case REPORT_FILTER_TYPE.MONTH:
        return groupByOptions.filter(
          (option) => option.value !== REPORT_GROUP_BY.DAY,
        );
      case REPORT_FILTER_TYPE.YEAR:
        return groupByOptions.filter(
          (option) => option.value === REPORT_GROUP_BY.YEAR,
        );
      case REPORT_FILTER_TYPE.DATE_RANGE:
      default:
        return groupByOptions;
    }
  }, [filterType, groupByOptions]);

  useEffect(() => {
    const isValid = filteredGroupByOptions.some(
      (option) => option.value === groupBy,
    );
    if (!isValid && filteredGroupByOptions.length > 0) {
      onGroupByChange(filteredGroupByOptions[0].value as REPORT_GROUP_BY);
    }
  }, [filterType, groupBy, filteredGroupByOptions, onGroupByChange]);

  return (
    <div className="flex gap-3 items-center flex-wrap 3xl:justify-end">
      <div className="2xl:w-56">
        <Select<OptionType>
          value={filterTypeOptions.find((o) => o.value === filterType)}
          onChange={(option) =>
            option && onFilterTypeChange(option.value as REPORT_FILTER_TYPE)
          }
          options={filterTypeOptions}
          isClearable={false}
          placeholder={t("filterType")}
        />
      </div>
      <div className="2xl:w-30">
        <Select<OptionType>
          value={groupByOptions.find((o) => o.value === groupBy)}
          onChange={(option) =>
            option && onGroupByChange(option.value as REPORT_GROUP_BY)
          }
          options={filteredGroupByOptions}
          isClearable={false}
          placeholder={t("groupBy")}
        />
      </div>
      {filterType === REPORT_FILTER_TYPE.DATE_RANGE && (
        <DateRangeFilterDropdown
          initialFromDate={fromDate}
          initialToDate={toDate}
          useUrlParams={false}
          onApply={onDateRangeApply}
          onClear={onDateRangeClear}
        />
      )}
      {onMaximize && (
        <button
          onClick={onMaximize}
          className="p-2 rounded-lg bg-bgwhite dark:bg-darkbgsecondary border border-bordergray200 dark:border-darkbordercolor1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          title={t("maximize")}
        >
          <Maximize2 className="w-5 h-5 text-textprimary dark:text-bgwhite" />
        </button>
      )}
    </div>
  );
};

export default ChartFilters;
