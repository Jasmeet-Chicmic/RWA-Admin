"use client";
import React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { SORT_DIRECTION, SORT_DIRECTIONS } from "@/shared/types";

export interface TableColumn<T> {
  title: string | React.ReactNode;
  field: keyof T | ((data: T) => React.ReactNode) | "";
  render?: (data: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
  sortKey?: string;
  fixed?: boolean | "left" | "right";
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  handleSort?: (sortKey: string, sortDirection: SORT_DIRECTION) => void;
  selectedRows?: string[];
  setSelectedRows?: React.Dispatch<React.SetStateAction<string[]>>;
  hideSelectCol?: boolean;
  rowClassName?: (item: T) => string;
  currentSortKey?: string;
  currentSortDirection?: SORT_DIRECTION;
}

function SortIcon({
  sortKey,
  currentSortKey,
  direction,
}: {
  sortKey: string;
  currentSortKey: string;
  direction: SORT_DIRECTION;
}) {
  if (sortKey !== currentSortKey) {
    return (
      <ChevronsUpDown
        size={14}
        className="text-darklabelprimary dark:text-white/60"
      />
    );
  }
  return direction === SORT_DIRECTIONS.ASC ? (
    <ChevronUp size={14} className="text-darklabelprimary dark:text-white/60" />
  ) : (
    <ChevronDown
      size={14}
      className="text-darklabelprimary dark:text-white/60"
    />
  );
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  keyExtractor,
  onRowClick,
  emptyMessage = "No data available",
  className,
  handleSort = () => {},
  selectedRows = [],
  setSelectedRows = () => {},
  hideSelectCol = true,
  rowClassName,
  currentSortKey = "",
  currentSortDirection = SORT_DIRECTIONS.ASC,
}: Readonly<TableProps<T>>) {
  const onSortClick = (
    key = "",
    direction: SORT_DIRECTION = SORT_DIRECTIONS.ASC,
  ) => {
    handleSort(key, direction);
  };

  const hasFixedLeft = columns.some(
    (col) => col.fixed === true || col.fixed === "left",
  );

  return (
    <div
      className={
        "bg-bgwhite dark:bg-darkbgprimary overflow-auto custom-scrollbar relative " +
        (className || "")
      }
    >
      <table className="w-full divide-y divide-bordercolor1 dark:divide-bordercolor2 dark:bg-darkbgprimary">
        <thead className="bg-transparent">
          <tr>
            {!hideSelectCol && (
              <th
                className={`px-6 py-4 text-left w-[60px] ${
                  hasFixedLeft
                    ? "sticky left-0 z-20 bg-bgwhite dark:bg-darkbgprimary border-r border-b border-bordercolor1 dark:border-bordercolor2"
                    : ""
                }`}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded-md border accent-secondarycolor dark:border-bordercolor2 cursor-pointer transition-all"
                    checked={
                      !!selectedRows.length &&
                      !!data.length &&
                      selectedRows.length === data.length
                    }
                    onChange={() => {
                      if (selectedRows.length === data.length) {
                        setSelectedRows([]);
                      } else {
                        setSelectedRows(data.map((item) => keyExtractor(item)));
                      }
                    }}
                  />
                </div>
              </th>
            )}
            {columns?.map((column, index) => {
              const isFixedLeft =
                column.fixed === true || column.fixed === "left";
              const isFixedRight = column.fixed === "right";

              const stickyClass = isFixedLeft
                ? "sticky z-10 bg-bgwhite dark:bg-darkbgprimary shadow-[4px_0_8px_-3px_rgba(0,0,0,0.1)] border-r border-b border-bordercolor1 dark:border-bordercolor2"
                : isFixedRight
                  ? "sticky z-10 bg-bgwhite dark:bg-darkbgprimary shadow-[-4px_0_8px_-3px_rgba(0,0,0,0.1)] border-l border-b border-bordercolor1 dark:border-bordercolor2"
                  : "";

              return (
                <th
                  key={`col-${index}-${String(column.field)}`}
                  scope="col"
                  onClick={() =>
                    column.sortable &&
                    onSortClick(
                      column.sortKey || "",
                      currentSortKey === column.sortKey
                        ? currentSortDirection === SORT_DIRECTIONS.ASC
                          ? SORT_DIRECTIONS.DESC
                          : SORT_DIRECTIONS.ASC
                        : SORT_DIRECTIONS.ASC,
                    )
                  }
                  style={
                    isFixedLeft
                      ? { left: hideSelectCol ? 0 : 60 }
                      : isFixedRight
                        ? { right: 0 }
                        : {}
                  }
                  className={`py-[10px] px-[15px] lg:px-6 lg:py-4 whitespace-nowrap ${
                    index === columns.length - 1 ? "text-right" : "text-left"
                  } text-[0.875rem] sm:text-[0.875rem] font-bold text-[#3d3d3d] dark:text-bgwhite dark:hover:text-white tracking-widest ${
                    column.width ? column.width : ""
                  } ${column.sortable ? "cursor-pointer select-none hover:text-darkbgprimary transition-colors" : ""} ${stickyClass}`}
                >
                  <div
                    className={`flex ${index === columns.length - 1 ? "justify-end" : "justify-start"} items-center gap-2`}
                  >
                    {typeof column.title === "string"
                      ? column.title
                      : column.title}
                    {column.sortable && (
                      <SortIcon
                        sortKey={column.sortKey || ""}
                        currentSortKey={currentSortKey}
                        direction={currentSortDirection}
                      />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-bordercolor1 dark:divide-bordercolor2">
          {(!data || data.length === 0) && !isLoading ? (
            <tr className="empty-row">
              <td
                colSpan={columns.length + (hideSelectCol ? 0 : 1)}
                className="px-4 py-16 text-sm text-bordercolor1 text-center dark:text-bgwhite font-medium"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl opacity-50">📭</span>
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            data?.map?.((item) => (
              <tr
                key={keyExtractor(item)}
                className={
                  "group transition-all duration-200 " +
                  (onRowClick
                    ? "cursor-pointer hover:bg-gray-50/5 dark:hover:bg-bordercolor1/5"
                    : "hover:bg-darkbgprimary/5 dark:hover:bg-bordercolor1/5") +
                  (selectedRows?.includes(keyExtractor(item))
                    ? " bg-primarycolor/5 dark:bg-primarycolor/10 "
                    : "") +
                  (rowClassName ? ` ${rowClassName(item)}` : "")
                }
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {!hideSelectCol && (
                  <td
                    className={`px-6 py-4 text-center w-[60px] ${
                      hasFixedLeft
                        ? "sticky left-0 z-20 bg-bgwhite dark:bg-darkbgprimary border-r border-b border-bordercolor1 dark:border-bordercolor2 group-hover:bg-gray-50 dark:group-hover:bg-darkbgprimary transition-colors"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded-md accent-secondarycolor dark:accent-primarycolor dark:text-white cursor-pointer"
                        checked={!!selectedRows?.includes(keyExtractor(item))}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (selectedRows?.includes(keyExtractor(item))) {
                            setSelectedRows(
                              selectedRows.filter(
                                (id) => id !== keyExtractor(item),
                              ),
                            );
                          } else {
                            setSelectedRows([
                              ...selectedRows,
                              keyExtractor(item),
                            ]);
                          }
                        }}
                      />
                    </div>
                  </td>
                )}
                {columns.map((column, index) => {
                  let value: unknown = "";
                  if (column.field) {
                    if (typeof column.field === "function") {
                      value = column.field(item);
                    } else if (column.field !== "") {
                      value = item[column.field as keyof T];
                    }
                  }

                  const isFixedLeft =
                    column.fixed === true || column.fixed === "left";
                  const isFixedRight = column.fixed === "right";

                  const stickyClass = isFixedLeft
                    ? "sticky z-10 bg-bgwhite dark:bg-darkbgprimary shadow-[4px_0_8px_-3px_rgba(0,0,0,0.1)] border-r border-bordercolor1 dark:border-bordercolor2 group-hover:bg-gray-50 dark:group-hover:bg-darkbgprimary transition-colors"
                    : isFixedRight
                      ? "sticky z-10 bg-bgwhite dark:bg-darkbgprimary shadow-[-4px_0_8px_-3px_rgba(0,0,0,0.1)] border-l border-bordercolor1 dark:border-bordercolor2 group-hover:bg-gray-50 dark:group-hover:bg-darkbgprimary transition-colors"
                      : "";

                  return (
                    <td
                      key={`cell-${index}-${String(column.field)}`}
                      style={
                        isFixedLeft
                          ? { left: hideSelectCol ? 0 : 60 }
                          : isFixedRight
                            ? { right: 0 }
                            : {}
                      }
                      className={`py-[10px] px-[15px] lg:px-6 lg:py-4 whitespace-nowrap text-[14px] text-textprimary dark:text-sidebartext ${
                        index === columns.length - 1
                          ? "text-right"
                          : "text-left"
                      } ${stickyClass}`}
                    >
                      {column.render
                        ? column.render(item)
                        : (value as React.ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bgbgwhite/60 dark:bg-darkbgprimary/60 backdrop-blur-sm transition-all">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-bordercolor1 dark:border-bordercolor2 border-t-transparent rounded-full animate-spin shadow-lg shadow-indigo-500/20" />
            <span className="text-[12px] font-bold text-darklabelprimary dark:text-white/60 dark:text-sidebartext tracking-wider uppercase">
              Loading...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
