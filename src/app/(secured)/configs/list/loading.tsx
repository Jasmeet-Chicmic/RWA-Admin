"use client";

import { useId } from "react";

export default function ConfigsLoading() {
  const baseId = useId();

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <div className="bg-bgwhite rounded-lg shadow-sm border bordergray200 dark:bg-darkbgprimary dark:border-darkbordercolor1 animate-pulse">
        <div className="p-6 dark:border-darkbgprimary">
          <div className="h-6 bg-gray-200 dark:bg-labelprimary rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-labelprimary rounded w-48"></div>
        </div>
        <div className="p-6 space-y-4">
          {Array.from(new Array(3)).map((_, id) => (
            <div
              key={`${baseId}-item-${id}`}
              className="h-10 bg-gray-200 dark:bg-labelprimary rounded"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
