"use client";

import { useId } from "react";
import { Skeleton } from "@/components/atoms/Skeleton";

export default function DashboardSkeleton() {
  const baseId = useId();

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-0 mt-[20px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-h-fit">
          {/* Orders Card */}
          {Array.from(new Array(2)).map((_, id) => (
            <div
              key={`${baseId}-order-${id}`}
              className="bg-bgwhite shadow-customsm rounded-[5px] py-[25px] px-[20px] w-full dark:bg-darkbgprimary"
            >
              <div className="mb-[10px]">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div style={{ minHeight: 96 }}>
                <Skeleton className="h-24 w-full mx-auto rounded" />
              </div>
              <div className="flex items-center justify-between mt-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}

          {/* Total Profit Card */}
          {Array.from(new Array(2)).map((_, id) => (
            <div
              key={`${baseId}-profit-${id}`}
              className="bg-bgwhite rounded-xl shadow-sm p-4 flex flex-col items-start dark:bg-darkbgprimary"
            >
              <Skeleton className="rounded-lg mb-4 w-11 h-11" />
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-7 w-20 mb-4" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
          ))}

          {/* Revenue Growth */}
          <div className="col-span-full md:col-span-2 h-full">
            <div className="bg-bgwhite rounded-[5px] shadow-customsm p-[25px] w-full h-full dark:bg-darkbgprimary">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              <div className="flex items-center justify-between 2xl:gap-[50px] gap-[30px]">
                <div className="pr-[15px]">
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-[150px] w-[310px] rounded" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between text-sm">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          </div>

          {/* Project Title */}
          <div className="col-span-full md:col-span-2 h-full">
            <div className="bg-bgwhite rounded-[5px] shadow-customsm p-[25px] w-full h-full dark:bg-darkbgprimary">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="mt-2 flex items-center">
                  <Skeleton className="bg-orange-100 p-2 rounded-full w-8 h-8" />
                  <div className="ml-3">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-28 w-full mb-4" />
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between text-sm">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          </div>

          {/* Sales by Countries, Sales, Top Transactions */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-[10px]">
            {/* Sales by Countries */}
            <div className="bg-bgwhite rounded-[5px] shadow-customsm w-full flex flex-col p-[25px] dark:bg-darkbgprimary">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              <div className="space-y-4">
                {Array.from(new Array(2)).map((_, id) => (
                  <div
                    key={`${baseId}-country-${id}`}
                    className="flex items-center"
                  >
                    <Skeleton className="rounded-full w-[40px] h-[40px]" />
                    <div className="ml-4 flex justify-between items-center w-full flex-wrap gap-y-2">
                      <div className="flex flex-col">
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Sales (Radar/Chart) */}
            <div className="bg-bgwhite shadow-customsm rounded-[5px] p-[25px] w-full dark:bg-darkbgprimary">
              <div className="mb-[10px]">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-[357px] w-full mx-auto rounded" />
            </div>
            {/* Top Transactions */}
            <div className="bg-bgwhite rounded-[5px] shadow-customsm w-full flex flex-col p-[25px] dark:bg-darkbgprimary">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
              <div className="space-y-4">
                {Array.from(new Array(6)).map((_, id) => (
                  <div
                    key={`${baseId}-trans-${id}`}
                    className="flex items-center"
                  >
                    <Skeleton className="w-8 h-8 rounded-md" />
                    <div className="ml-4 flex justify-between items-center w-full flex-wrap gap-y-2">
                      <div className="flex flex-col">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
