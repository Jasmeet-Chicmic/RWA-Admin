"use client";

import { useId } from "react";
import { Skeleton } from "@/components/atoms/Skeleton";

const Loading = () => {
  const baseId = useId();

  // Data for filter section skeletons
  const filterSkeletons = [
    { className: "h-10 w-24" },
    { className: "h-10 w-36" },
  ];

  // Data for table header columns (excluding checkbox)
  const headerColumns = 5; // Id, Name, Role, Status, Actions

  // Data for table body columns with their specific widths
  const bodyColumns = [
    { className: "h-4 w-16" }, // Id
    { className: "h-4 w-24" }, // Name
    { className: "h-4 w-20" }, // Role
    { className: "h-6 w-16 rounded-full" }, // Status
  ];

  // Data for action buttons
  const actionButtons = 3;

  // Data for pagination buttons
  const paginationButtons = 7;

  // Data for table rows
  const tableRows = 7;

  return (
    <main className="flex-1 overflow-y-auto animate-pulse">
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        {/* Filters and Actions */}
        <div className="overflow-x-auto">
          <div className="bg-bgwhite rounded-t-lg shadow-sm border bordergray200 dark:bg-darkbgprimary dark:border-darkbordercolor1">
            <div className="p-6 border-b border-bordergray200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Skeleton className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                    <Skeleton className="pl-10 pr-4 py-2 border bordergray200 rounded-lg w-60 bg-gray-100 h-10" />
                  </div>
                  {filterSkeletons.map((skeleton, index) => (
                    <Skeleton
                      key={`${baseId}-filter-${index}`}
                      className={skeleton.className}
                    />
                  ))}
                </div>
                <div className="flex justify-end items-center gap-x-3">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="w-60 h-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-bgwhite overflow-auto shadow-sm dark:bg-darkbgprimary dark:border-darkbordercolor1">
            <table className="min-w-full divide-y">
              <thead className="bg-bgwhite dark:bg-darkbgprimary">
                <tr>
                  {/* Checkbox */}
                  <th className="px-4 py-3 w-[60px]">
                    <Skeleton className="h-4 w-4 rounded" />
                  </th>
                  {/* Id, Name, Role, Status, Actions */}
                  {Array.from(new Array(headerColumns)).map((_, id) => (
                    <th key={`${baseId}-header-${id}`} className="px-4 py-3">
                      <Skeleton className="h-3 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {Array.from(new Array(tableRows)).map((_, rowId) => (
                  <tr key={`${baseId}-row-${rowId}`}>
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-4 rounded" />
                    </td>
                    {/* Id, Name, Role, Status */}
                    {bodyColumns.map((column, colId) => (
                      <td
                        key={`${baseId}-row-${rowId}-col-${colId}`}
                        className="px-4 py-[6px] min-w-[120px]"
                      >
                        <Skeleton className={column.className} />
                      </td>
                    ))}
                    {/* Actions */}
                    <td className="px-4 py-[6px] min-w-[120px]">
                      <div className="flex items-center space-x-2">
                        {Array.from(new Array(actionButtons)).map(
                          (_, btnId) => (
                            <Skeleton
                              key={`${baseId}-row-${rowId}-action-${btnId}`}
                              className="h-6 w-6 rounded"
                            />
                          ),
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Skeleton */}
          <div className="bg-bgwhite px-6 py-4 rounded-b-xl flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 border-t dark:bg-darkbgprimary dark:border-darkbordercolor1">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="flex items-center space-x-2 lg:flex-row gap-2 flex-col">
              <div className="flex space-x-2 items-center">
                {Array.from(new Array(paginationButtons)).map((_, id) => (
                  <Skeleton
                    key={`${baseId}-page-${id}`}
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
        {/* Add User Sidebar Skeleton */}
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-bgwhite shadow-lg z-50 transform transition-transform duration-300 ease-in-out translate-x-full dark:bg-darkbgprimary dark:border-darkbordercolor1">
          <div className="flex items-center justify-between px-6 py-4 border-b border-bordergray200">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Loading;
