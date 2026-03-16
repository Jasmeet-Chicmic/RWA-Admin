"use client";

import { format, parseISO, isValid } from "date-fns";

interface FormattedDateProps {
  date: Date | string | null | undefined;
  showTime?: boolean;
  className?: string;
  fallback?: string;
}

/**
 * Client-side date formatter component.
 * Ensures dates are formatted in the user's browser timezone, not server timezone.
 * Use this component instead of formatDate() in Server Components to avoid timezone issues.
 *
 * @example
 * <FormattedDate date="2026-03-12T04:50:06.370533Z" />
 * <FormattedDate date={dateObj} showTime={false} />
 * <FormattedDate date={dateString} className="text-sm" fallback="N/A" />
 */
export default function FormattedDate({
  date,
  showTime = true,
  className = "",
  fallback = "—",
}: FormattedDateProps) {
  if (!date) {
    return <span className={className}>{fallback}</span>;
  }

  let dateObj: Date;

  // If it's already a Date object, use it directly
  if (date instanceof Date) {
    dateObj = date;
  } else {
    // API always returns ISO 8601 format (e.g., "2026-03-12T04:50:06.370533Z")
    // Use parseISO to ensure proper UTC parsing
    dateObj = parseISO(date);
  }

  // Validate the date
  if (!isValid(dateObj)) {
    console.warn("Invalid date provided to FormattedDate:", date);
    return <span className={className}>{fallback}</span>;
  }

  const formatPattern = showTime ? "MMM d, yyyy h:mm a" : "MMM d, yyyy";
  const formatted = format(dateObj, formatPattern);

  return <span className={className}>{formatted}</span>;
}
