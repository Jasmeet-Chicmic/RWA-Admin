"use client";

import React from "react";
// import { Info } from "lucide-react";
// import { useTranslations } from "next-intl";

export interface TableHeaderWithInfoProps {
  /** Column header label (e.g. "Publication State") */
  label: string;
  /** List of option labels shown on hover (e.g. ["Draft", "Published"]) */
  options: string[];
  /** Optional tooltip title when no options */
  tooltip?: string;
}

/**
 * Table column header that shows a label and an info icon.
 * Hovering the icon shows the available status/option values for that column.
 */
export function TableHeaderWithInfo({
  label,
  // options,
  // tooltip,
}: TableHeaderWithInfoProps) {
  // const [showTooltip, setShowTooltip] = useState(false);
  // const tCommon = useTranslations("common");
  // const content = options.length > 0 ? options.join(", ") : tooltip || "";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      {/* {content ? (
        <span
          className="relative inline-flex text-gray-400 dark:text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor cursor-help"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={content}
        >
          <Info size={14} strokeWidth={2.5} />
          {showTooltip && (
            <span
              className="absolute z-50 left-full ml-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-800 dark:bg-gray-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
              role="tooltip"
            >
              {options.length > 0 ? (
                <>
                  <span className="block font-semibold text-gray-200 mb-0.5">
                    {tCommon("Available options")}:
                  </span>
                  {options.join(", ")}
                </>
              ) : (
                tooltip
              )}
            </span>
          )}
        </span>
      ) : null} */}
    </span>
  );
}

export default TableHeaderWithInfo;
