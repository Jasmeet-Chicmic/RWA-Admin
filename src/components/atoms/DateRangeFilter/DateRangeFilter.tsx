"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface DateRangeFilterProps {
  /** Initial from date value */
  initialFromDate?: string;
  /** Initial to date value */
  initialToDate?: string;
  /** Callback when filter is applied */
  onApply?: (fromDate: string, toDate: string) => void;
  /** Callback when filter is cleared */
  onClear?: () => void;
  /** Whether to automatically update URL params (default: true) */
  useUrlParams?: boolean;
  /** Custom class name for the container */
  className?: string;
  /** ID for the date range filter (used as prefix for input IDs) */
  id?: string;
}

const DateRangeFilter = ({
  initialFromDate = "",
  initialToDate = "",
  onApply,
  onClear,
  useUrlParams = true,
  className = "",
  id,
}: DateRangeFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("common");

  // Convert UTC ISO timestamps to date strings for display
  const parseDateFromUTC = (utcString: string): string => {
    if (!utcString) return "";
    try {
      const date = new Date(utcString);
      return date.toISOString().split("T")[0];
    } catch {
      return utcString.split("T")[0] || "";
    }
  };

  const [fromDate, setFromDate] = useState(() =>
    parseDateFromUTC(initialFromDate),
  );
  const [toDate, setToDate] = useState(() => parseDateFromUTC(initialToDate));

  // Sync state with props when they change (e.g. on tab switch)
  useEffect(() => {
    setFromDate(parseDateFromUTC(initialFromDate));
    setToDate(parseDateFromUTC(initialToDate));
  }, [initialFromDate, initialToDate]);

  const today = new Date().toISOString().split("T")[0];

  const handleFromDateChange = (value: string) => {
    setFromDate(value);
    if (value) {
      const from = new Date(value);
      const to = new Date(from);
      to.setDate(from.getDate() + 30);

      const now = new Date();
      const finalTo = to > now ? now : to;

      setToDate(finalTo.toISOString().split("T")[0]);
    } else {
      setToDate("");
    }
  };

  const handleApply = () => {
    // Convert date strings to UTC ISO timestamps
    let fromDateUTC = "";
    let toDateUTC = "";

    if (fromDate) {
      // Create UTC date for start of day (00:00:00.000Z)
      // Using Date.UTC to ensure we get UTC time, not local time
      const [year, month, day] = fromDate.split("-").map(Number);
      const fromDateObj = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      fromDateUTC = fromDateObj.toISOString();
    }

    if (toDate) {
      // Create UTC date for end of day (23:59:59.999Z)
      const [year, month, day] = toDate.split("-").map(Number);
      const toDateObj = new Date(
        Date.UTC(year, month - 1, day, 23, 59, 59, 999),
      );
      toDateUTC = toDateObj.toISOString();
    }

    if (useUrlParams) {
      const newParams = new URLSearchParams(searchParams.toString());

      // Reset pagination when filtering
      newParams.delete("skip");

      if (fromDateUTC) {
        newParams.set("fromDate", fromDateUTC);
      } else {
        newParams.delete("fromDate");
      }

      if (toDateUTC) {
        newParams.set("toDate", toDateUTC);
      } else {
        newParams.delete("toDate");
      }

      router.replace(`?${newParams.toString()}`, { scroll: false });
    }

    // Pass UTC timestamps to onApply callback
    onApply?.(fromDateUTC, toDateUTC);
  };

  const handleClear = () => {
    setFromDate("");
    setToDate("");

    if (useUrlParams) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("fromDate");
      newParams.delete("toDate");
      newParams.delete("skip");
      router.replace(`?${newParams.toString()}`, { scroll: false });
    }

    onClear?.();
  };

  const hasFilters = fromDate || toDate;

  // Calculate maximum date for toDate (30 days after fromDate, capped at today)
  const getMaxToDate = (): string => {
    if (!fromDate) return today;
    const date = new Date(fromDate);
    date.setDate(date.getDate() + 30);
    const maxRange = date.toISOString().split("T")[0];
    return maxRange < today ? maxRange : today;
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-row items-end gap-3">
        <div className="flex flex-col flex-1">
          <label
            htmlFor={id ? `${id}-from` : undefined}
            className="text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-1"
          >
            {t("fromDate")}
          </label>
          <input
            type="date"
            id={id ? `${id}-from` : undefined}
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
            max={today}
            className="w-full px-3 py-2.5 border-2 border-primarycolor rounded-lg focus:ring-0 transition-all duration-200 dark:bg-darkbgprimary dark:border-secondarycolor dark:text-sidebartext font-medium cursor-pointer"
          />
        </div>
        <div className="flex flex-col flex-1">
          <label
            htmlFor={id ? `${id}-to` : undefined}
            className="text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-1"
          >
            {t("toDate")}
          </label>
          <input
            type="date"
            id={id ? `${id}-to` : undefined}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            disabled={!fromDate}
            min={fromDate}
            max={getMaxToDate()}
            className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-0 transition-all duration-200 ${
              !fromDate
                ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-darkbgprimary dark:text-white border-primarycolor dark:border-secondarycolor"
                : "border-primarycolor dark:border-secondarycolor dark:text-white dark:bg-darkbgprimary cursor-pointer"
            }`}
          />
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <button
          onClick={handleApply}
          disabled={!fromDate}
          className={`flex-1 px-4 py-2 bg-primarycolor dark:bg-secondarycolor text-bgwhite dark:text-bgblack dark:text-white font-semibold rounded-lg hover:bg-primaryhover dark:hover:bg-secondaryhover transition-all duration-200 ${
            !fromDate ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {t("apply")}
        </button>
        {hasFilters && (
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2 border-2 border-bordercolor1 dark:border-secondarycolor text-primarycolor dark:text-white font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-white dark:hover:text-secondarycolor transition-all duration-200"
          >
            {t("clear")}
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;
