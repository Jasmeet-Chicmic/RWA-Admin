"use client";

import { Skeleton } from "@/components/atoms/Skeleton";

export const TokenizationModalSkeleton = () => (
  <div className="space-y-4" aria-busy="true" aria-live="polite">
    <div className="flex flex-wrap gap-x-3 gap-y-4 justify-between">
      <div className="w-full md:w-[48%] space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <div className="w-full md:w-[48%] space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-4 justify-between">
      <div className="w-full md:w-[48%] space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
    <div className="my-4 rounded-2xl border border-bordergray200 bg-gray-100 p-6 dark:border-darkbordercolor1 dark:bg-darkbgbase">
      <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-48 max-w-full" />
          <Skeleton className="h-3 w-full max-w-md" />
        </div>
      </div>
    </div>
  </div>
);
