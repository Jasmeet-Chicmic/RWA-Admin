"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface DateRangeFilterDropdownProps {
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
}

const DateRangeFilterDropdown = ({
  initialFromDate = "",
  initialToDate = "",
  onApply,
  onClear,
  useUrlParams = true,
  className = "",
}: DateRangeFilterDropdownProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split("T")[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFromDateChange = (value: string) => {
    setFromDate(value);
    if (value && toDate && new Date(toDate) < new Date(value)) {
      setToDate("");
    }
  };

  const handleApply = () => {
    if (useUrlParams) {
      const newParams = new URLSearchParams(searchParams.toString());

      // Reset pagination when filtering
      newParams.delete("skip");

      if (fromDate) {
        newParams.set("fromDate", fromDate);
      } else {
        newParams.delete("fromDate");
      }

      if (toDate) {
        newParams.set("toDate", toDate);
      } else {
        newParams.delete("toDate");
      }

      router.replace(`?${newParams.toString()}`, { scroll: false });
    }

    onApply?.(fromDate, toDate);
    setIsOpen(false);
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
    setIsOpen(false);
  };

  const hasFilters = fromDate || toDate;

  // Calculate maximum date for toDate (capped at today)
  const getMaxToDate = (): string => {
    return today;
  };

  // Format date for display
  const formatDateDisplay = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 border border-b border-bordergray200ordercolor1 dark:border-darkbordercolor1"
      >
        <svg
          className="w-5 h-5 text-darkbgprimary dark:text-bgwhite"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm whitespace-nowrap font-semibold text-darkbgprimary dark:text-bgwhite">
          {hasFilters
            ? `${formatDateDisplay(fromDate)} - ${formatDateDisplay(toDate)}`
            : "Date Range"}
        </span>
        <svg
          className={`w-4 h-4 text-darkbgprimary dark:text-bgwhite transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 p-4 bg-bgwhite dark:bg-darkbgprimary border bordergray200 dark:border-labelprimary rounded-lg shadow-lg z-50 min-w-[320px]">
          <div className="space-y-4">
            {/* From Date */}
            <div className="flex flex-col">
              <label
                htmlFor="dropdown-from-date"
                className="text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-1"
              >
                From Date
              </label>
              <input
                id="dropdown-from-date"
                type="date"
                value={fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
                max={today}
                className="px-4 py-2.5 border border-b border-bordergray200ordercolor1 rounded-lg transition-all duration-200 dark:bg-darkbgprimary dark:border-darkbordercolor1 dark:text-sidebartext font-medium cursor-pointer"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col">
              <label
                htmlFor="dropdown-to-date"
                className="text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-1"
              >
                To Date
              </label>
              <input
                id="dropdown-to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={!fromDate}
                min={fromDate}
                max={getMaxToDate()}
                className={`px-4 py-2.5 border border-b border-bordergray200ordercolor1 rounded-lg dark:bg-darkbgprimary dark:border-darkbordercolor1 dark:text-sidebartext font-medium transition-all duration-200 ${
                  !fromDate
                    ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-darkbgprimary border-b border-bordergray200ordercolor1 dark:border-darkbordercolor1"
                    : "border-b border-bordergray200ordercolor1 cursor-pointer"
                }`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleApply}
                disabled={!fromDate}
                className={`flex-1 px-6 py-2.5 bg-primarycolor text-bgwhite font-semibold rounded-lg hover:bg-primarycolor transition-all duration-200 ${
                  !fromDate
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-100"
                }`}
              >
                Apply
              </button>
              {hasFilters && (
                <button
                  onClick={handleClear}
                  className="flex-1 px-6 py-2.5 border-1 border border-primarycolor text-primarycolor font-semibold rounded-lg hover:bg-primarycolor hover:text-bgprimary transition-all duration-200 dark:border-primarycolor dark:text-primarycolor"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilterDropdown;
