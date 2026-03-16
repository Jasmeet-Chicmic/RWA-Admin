"use client";

import { useId } from "react";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "shimmer" | "pulse";
  style?: React.CSSProperties;
}

/**
 * Shimmer Skeleton Component
 * A modern, eye-catching shimmer loading effect with Meta UI/UX inspired styling
 */
const Skeleton = ({
  className = "",
  variant = "shimmer",
  style,
}: SkeletonProps) => {
  if (variant === "pulse") {
    return (
      <div
        className={`animate-pulse bg-gray-200 dark:bg-labelprimary rounded ${className}`}
        style={style}
      />
    );
  }

  if (variant === "shimmer") {
    return (
      <div
        className={`relative overflow-hidden rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-labelprimary dark:to-gray-800 ${className}`}
        style={style}
      >
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent viabgwhite/40 dark:viabgwhite/10 to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-labelprimary rounded ${className}`}
      style={style}
    />
  );
};

/**
 * Stat Card Skeleton - Matches the StatCard component layout
 */
export const StatCardSkeleton = () => (
  <div className="bg-bgwhite dark:bg-darkbgprimary rounded-[20px] p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="w-14 h-14 rounded-xl" />
    </div>
  </div>
);

/**
 * Chart Card Skeleton - Matches chart components layout
 */
export const ChartCardSkeleton = ({ height = 400 }: { height?: number }) => {
  const baseId = useId();
  return (
    <div className="flex-1 bg-bgwhite rounded-[20px] p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="relative overflow-hidden rounded-lg">
        <Skeleton className="w-full" style={{ height }} />
        {/* Animated chart lines overlay */}
        <div className="absolute inset-0 flex items-end justify-around gap-2 p-6 opacity-20">
          {Array.from(new Array(8)).map((_, id) => (
            <div
              key={`${baseId}-chart-line-${id}`}
              className="bg-gradient-to-t from-chart-primary/30 to-transparent rounded-t-lg animate-pulse"
              style={{
                height: `${30 + Math.random() * 50}%`,
                width: "10%",
                animationDelay: `${id * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Area Chart Skeleton - With gradient wave effect
 */
export const AreaChartSkeleton = ({ height = 400 }: { height?: number }) => (
  <div className="flex-1 bg-bgwhite rounded-[20px] p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1">
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="relative overflow-hidden rounded-lg" style={{ height }}>
      <Skeleton className="w-full h-full" />
      {/* Animated wave overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="shimmerGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#0668E1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0668E1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 Q50,60 100,100 T200,100 T300,100 T400,100 L400,200 L0,200 Z"
          fill="url(#shimmerGradient)"
          className="animate-pulse"
        />
      </svg>
    </div>
  </div>
);

/**
 * Bar Chart Skeleton - Horizontal bars with shimmer
 */
export const HorizontalBarChartSkeleton = ({
  bars = 6,
  height = 400,
}: {
  bars?: number;
  height?: number;
}) => {
  const baseId = useId();
  return (
    <div className="flex-1 bg-bgwhite rounded-[20px] p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      <div className="space-y-4" style={{ height }}>
        {Array.from(new Array(bars)).map((_, id) => (
          <div key={`${baseId}-bar-${id}`} className="flex items-center gap-4">
            <Skeleton className="h-5 w-20 flex-shrink-0" />
            <div className="flex-1 relative h-8 overflow-hidden rounded-lg">
              <Skeleton
                className="h-full rounded-lg"
                style={{
                  width: `${40 + Math.random() * 50}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * World Map Chart Skeleton
 */
export const MapChartSkeleton = () => (
  <div className="flex-1 bg-bgwhite rounded-[20px] p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1 w-full">
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
    <div className="relative h-[350px] overflow-hidden rounded-lg">
      <Skeleton className="w-full h-full" />
      {/* Map-like overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <svg className="w-3/4 h-3/4" viewBox="0 0 200 100">
          <ellipse
            cx="100"
            cy="50"
            rx="90"
            ry="45"
            fill="none"
            stroke="#0668E1"
            strokeWidth="0.5"
            className="animate-pulse"
          />
          <ellipse
            cx="100"
            cy="50"
            rx="60"
            ry="30"
            fill="none"
            stroke="#0668E1"
            strokeWidth="0.5"
            className="animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <ellipse
            cx="100"
            cy="50"
            rx="30"
            ry="15"
            fill="none"
            stroke="#0668E1"
            strokeWidth="0.5"
            className="animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
        </svg>
      </div>
    </div>
  </div>
);

/**
 * GGR Stat Card Skeleton
 */
export const GGRStatCardSkeleton = () => (
  <div className="bg-bgwhite dark:bg-darkbgprimary rounded-[20px] p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-10 w-28 rounded-lg" />
    </div>
  </div>
);

export { Skeleton };
export default Skeleton;
