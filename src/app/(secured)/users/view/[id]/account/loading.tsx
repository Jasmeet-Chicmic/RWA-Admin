"use client";

import { useId } from "react";
import { Skeleton } from "@/components/atoms/Skeleton";

const Loading = () => {
  const baseId = useId();

  return (
    <div className="space-y-6 animate-pulse">
      {/* Search Bar */}
      <div className="bg-bgwhite rounded-lg shadow p-4 dark:bg-darkbgprimary dark:border-darkbordercolor1">
        <div className="relative">
          <Skeleton className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
          <Skeleton className="pl-10 pr-4 py-2 border bordergray200 rounded-lg w-full bg-gray-100 h-10" />
        </div>
        {/* Projects Table */}
        <div className="space-y-6 mt-6">
          <div className="bg-bgwhite overflow-auto shadow-sm dark:bg-darkbgprimary dark:border-darkbordercolor1">
            <table className="min-w-full divide-y">
              <thead className="bgbgwhite">
                <tr>
                  <th className="px-4 py-3 w-[60px]">
                    <Skeleton className="h-4 w-4 rounded" />
                  </th>
                  {Array.from(new Array(4)).map((_, id) => (
                    <th
                      key={`${baseId}-projHeader-${id}`}
                      className="px-4 py-3"
                    >
                      <Skeleton className="h-3 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.from(new Array(3)).map((_, rowId) => (
                  <tr key={`${baseId}-projRow-${rowId}`}>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-4 rounded" />
                    </td>
                    <td className="px-4 py-[6px] min-w-[120px]">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-[6px] min-w-[120px]">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-[6px] min-w-[120px]">
                      <div className="flex -space-x-2">
                        {Array.from(new Array(3)).map((_, id) => (
                          <Skeleton
                            key={`${baseId}-projAvatar-${rowId}-${id}`}
                            className="h-8 w-8 rounded-full"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-[6px] min-w-[120px]">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-6 w-6 rounded" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Projects Pagination */}
          <div className="bg-bgwhite px-6 py-4 rounded-b-xl flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 border-t dark:bg-darkbgprimary dark:border-darkbordercolor1">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="flex items-center space-x-2 lg:flex-row gap-2 flex-col">
              <div className="flex space-x-2 items-center">
                {Array.from(new Array(3)).map((_, id) => (
                  <Skeleton
                    key={`${baseId}-projPage-${id}`}
                    className="h-8 w-8 rounded"
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2 w-full">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Invoices Table */}
      <div className="bg-bgwhite rounded-xl shadow-sm p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1">
        <div className="space-y-6">
          <div className="bg-bgwhite overflow-auto shadow-sm dark:bg-darkbgprimary dark:border-darkbordercolor1">
            <table className="min-w-full divide-y">
              <thead className="bgbgwhite">
                <tr>
                  {Array.from(new Array(5)).map((_, id) => (
                    <th key={`${baseId}-invHeader-${id}`} className="px-4 py-3">
                      <Skeleton className="h-3 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.from(new Array(3)).map((_, rowId) => (
                  <tr key={`${baseId}-invRow-${rowId}`}>
                    {Array.from(new Array(5)).map((_, colId) => (
                      <td
                        key={`${baseId}-invCol-${rowId}-${colId}`}
                        className="px-4 py-[6px] min-w-[120px]"
                      >
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Invoices Pagination */}
          <div className="bg-bgwhite px-6 py-4 rounded-b-xl flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 border-t dark:bg-darkbgprimary dark:border-darkbordercolor1">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="flex items-center space-x-2 lg:flex-row gap-2 flex-col">
              <div className="flex space-x-2 items-center">
                {Array.from(new Array(3)).map((_, id) => (
                  <Skeleton
                    key={`${baseId}-invPage-${id}`}
                    className="h-8 w-8 rounded"
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2 w-full">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
