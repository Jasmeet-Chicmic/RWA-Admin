"use client";

import { Skeleton } from "@/components/atoms/Skeleton";

const PropertiesLoading = () => {
  return (
    <main className="flex-1 overflow-y-auto animate-pulse">
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          {/* Header skeleton (title + subtitle only) */}
          <div className="bg-bgwhite rounded-t-[20px] shadow-sm border bordergray200 dark:bg-darkbgprimary dark:border-darkbordercolor1">
            <div className="px-5 py-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>

          {/* Simple table rows skeleton */}
          <div className="bg-bgwhite shadow-sm rounded-b-[20px] border border-t-0 bordergray200 dark:bg-darkbgprimary dark:border-darkbordercolor1">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 px-5 py-3 items-center"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PropertiesLoading;
