"use client";

import { TEXT_PRIMARY_DARK as TEXT_PRIMARY } from "@/shared/styles";

const PropertiesAssetsLoading = () => {
  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase animate-pulse">
      <div className="bg-bgwhite px-[15px] lg:px-5 3xl:px-6 pt-[15px] lg:pt-5 3xl:pt-7 pb-3 rounded-t-[20px] dark:bg-darkbgprimary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <div
              className={`h-6 w-40 rounded-md bg-slate-200 dark:bg-slate-700 ${TEXT_PRIMARY}`}
            />
            <div className="mt-2 h-4 w-64 rounded-md bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="h-10 w-64 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>

      <div className="px-[15px] lg:px-5 3xl:px-6 pb-6">
        <div className="overflow-hidden rounded-[0_0_20px_20px] border border-bordergray100 dark:border-darkbordercolor1">
          <div className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-bordergray100 dark:border-darkbordercolor1 bg-bgprimary dark:bg-darkbgbase">
            {Array.from({ length: 7 }).map((_, idx) => (
              <div
                key={idx}
                className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>

          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="grid grid-cols-7 gap-4 px-4 py-4 border-b border-bordergray50 dark:border-darkbordercolor1"
            >
              <div className="h-4 w-40 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-28 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-16 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertiesAssetsLoading;

