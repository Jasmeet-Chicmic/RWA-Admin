"use client";

import { useState, useMemo, ReactNode } from "react";
import { useTranslations } from "next-intl";

export interface SeeMoreListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  initialCount?: number;
  className?: string;
  showMoreButtonText?: string;
  showLessButtonText?: string;
  emptyStateMessage?: string;
  isButtonBlock?: boolean;
  keyExtractor?: (item: T) => string | number;
}

export default function SeeMoreList<T>({
  data,
  renderItem,
  initialCount = 3,
  className = "space-y-4",
  showMoreButtonText,
  showLessButtonText,
  emptyStateMessage,
  isButtonBlock = true,
  keyExtractor,
}: SeeMoreListProps<T>) {
  const t = useTranslations("common");
  const [showAll, setShowAll] = useState(false);

  const resolvedShowMore = showMoreButtonText ?? t("Show more");
  const resolvedShowLess = showLessButtonText ?? t("Show less");
  const resolvedEmptyState = emptyStateMessage ?? t("No items to display");

  const displayedData = useMemo(() => {
    if (showAll || data.length <= initialCount) return data;
    return data.slice(0, initialCount);
  }, [data, showAll, initialCount]);

  const hasMoreItems = data.length > initialCount;
  const isShowingAll = showAll || data.length <= initialCount;
  const hiddenCount = data.length - initialCount;

  if (data.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {resolvedEmptyState}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {displayedData.map((item, index) => (
        <div key={keyExtractor ? String(keyExtractor(item)) : index}>
          {renderItem(item, index)}
        </div>
      ))}
      {hasMoreItems && (
        <div
          className={`${isButtonBlock ? "w-full mt-4" : "w-auto"} flex justify-center`}
        >
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-primarycolor dark:text-secondarycolor hover:underline px-2 py-1 transition-colors duration-200"
          >
            {isShowingAll
              ? `${resolvedShowLess} (${hiddenCount} ${t("hidden")})`
              : `${resolvedShowMore} (${hiddenCount} ${t("more")})`}
          </button>
        </div>
      )}
    </div>
  );
}
