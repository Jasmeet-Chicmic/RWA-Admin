import {
  StatCardSkeleton,
  ChartCardSkeleton,
} from "@/components/atoms/Skeleton";

export default function Loading() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-0 mt-[20px]">
        {/* Dashboard Stats Skeleton */}
        <div className="space-y-6">
          {/* Stat Cards Row - 6 cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* Companies Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCardSkeleton height={450} />
            <ChartCardSkeleton height={450} />
          </div>

          {/* Groups Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCardSkeleton height={450} />
            <ChartCardSkeleton height={450} />
          </div>

          {/* Engagement Analytics - Full Width */}
          <div className="w-full">
            <ChartCardSkeleton height={450} />
          </div>

          {/* Conversion Rate - Full Width */}
          <div className="w-full">
            <ChartCardSkeleton height={450} />
          </div>

          {/* Events Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCardSkeleton height={450} />
            <ChartCardSkeleton height={450} />
          </div>
        </div>
      </div>
    </main>
  );
}
