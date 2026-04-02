"use client";

import { useTranslations } from "next-intl";

import Skeleton from "@/components/atoms/Skeleton";

const PropertyDetailsContentSkeleton = () => {
  const t = useTranslations("properties");

  return (
    <div className="w-full !pt-0 py-8 lg:py-12">
      <div className="w-full max-w-[1260px] min-[1680px]:max-w-[1480px] px-[20px] mx-auto">
        <div className="flex flex-col gap-6 md:gap-[37px] w-full text-white">
          {/* Breadcrumbs (placeholder) */}
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-10 opacity-60" />
            <Skeleton className="h-4 w-36 opacity-60" />
            <Skeleton className="h-4 w-20 opacity-60" />
          </div>

          {/* Cover image */}
          <div className="w-full h-[250px] sm:h-[350px] md:h-[444px] rounded-[11.57px] overflow-hidden border border-[#292929] bg-[#141414] relative">
            <Skeleton className="h-full w-full rounded-[11.57px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="sr-only">{t("loadingPropertyDetails")}</span>
            </div>
            {/* If multiple images, there are prev/next buttons + dots */}
            <Skeleton className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full" />
            <Skeleton className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <Skeleton className="h-2.5 w-6 rounded-full" />
              <Skeleton className="h-2.5 w-2.5 rounded-full opacity-70" />
              <Skeleton className="h-2.5 w-2.5 rounded-full opacity-70" />
            </div>
          </div>

          {/* Title + location + status badge */}
          <div className="flex flex-col gap-4 md:gap-[18.5px]">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-56 rounded" />
                <div className="flex items-center gap-[9px]">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-64 rounded" />
                </div>
              </div>
              <Skeleton className="h-7 w-48 rounded-[33px]" />
            </div>
            {/* Optional rejection/approval callouts */}
            <Skeleton className="h-16 w-full rounded-[11.57px] opacity-60" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-[22px] p-6 md:p-[27.77px] bg-[#141414] border border-[#292929] rounded-[11.57px]">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex flex-col gap-2 md:gap-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-8 w-32" />
                {idx % 3 === 2 && <Skeleton className="h-4 w-20 opacity-70" />}
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className="flex flex-col gap-4 md:gap-[18.5px]">
            <Skeleton className="h-8 w-56" />
            <div className="flex flex-col gap-1 md:gap-[12px]">
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[70%]" />
            </div>
          </div>

          {/* Documents - collapsed button */}
          <div className="flex flex-col gap-4 md:gap-[18.5px]">
            <div className="w-full flex items-center justify-between p-4 bg-[#141414] border border-[#292929] rounded-[11.57px]">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-60">
              <Skeleton className="h-24 w-full rounded-lg border border-[#292929] bg-[#141414]" />
              <Skeleton className="h-24 w-full rounded-lg border border-[#292929] bg-[#141414]" />
            </div>
          </div>

          {/* Admin Documents placeholder */}
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-56" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full rounded-lg border border-[#292929] bg-[#141414]" />
              <Skeleton className="h-24 w-full rounded-lg border border-[#292929] bg-[#141414]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsContentSkeleton;
