"use client";

import Pagination from "@/components/atoms/Pagination";
import SearchInput from "@/components/atoms/SearchInput/SearchInput";
import Table, { TableColumn } from "@/components/atoms/Table";
import {
  useTableQuerySync,
  UseTableQuerySyncOptions,
} from "@/hooks/useTableQuerySync";
import { ReactNode, useEffect } from "react";

/**
 * Configuration for the DataTable component
 */
export interface DataTableConfig<T> {
  /**
   * Table columns configuration
   */
  columns: TableColumn<T>[];

  /**
   * Function to extract unique key from each row item
   */
  keyExtractor: (item: T) => string;

  /**
   * Title for pagination (e.g., "users", "transactions")
   */
  paginationTitle: string;

  /**
   * Optional: Custom class name for the table row
   */
  rowClassName?: (item: T) => string;

  /**
   * Optional: Hide the select column
   */
  hideSelectCol?: boolean;

  /**
   * Optional: Empty state message
   */
  emptyMessage?: string;

  /**
   * Optional: Search placeholder. If provided, a search input will be shown.
   */
  searchPlaceholder?: string;

  /**
   * Optional: Header content to display above the table
   */
  header?: ReactNode;

  /**
   * Optional: Footer content to display below the pagination
   */
  footer?: ReactNode;

  /**
   * Optional: Configuration for the table query sync hook
   */
  queryConfig?: UseTableQuerySyncOptions;

  /**
   * Optional: Callback when row selection changes
   */
  onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * Props for the DataTable component
 */
export interface DataTableProps<T> {
  /**
   * Array of data items to display
   */
  data: T[];

  /**
   * Total count of items (for pagination)
   */
  totalCount: number;

  /**
   * Optional: Loading state for skeleton rows
   */
  isLoading?: boolean;

  /**
   * Table configuration
   */
  config: DataTableConfig<T>;
}

/**
 * Generic DataTable component that handles common table structure with pagination and sorting.
 *
 * This component eliminates code duplication by providing a reusable table structure
 * that only requires column configuration and data.
 *
 * @example
 * ```tsx
 * const config: DataTableConfig<User> = {
 *   columns: [
 *     { field: "name", title: "Name", sortable: true, sortKey: "name" },
 *     { field: "email", title: "Email" },
 *   ],
 *   keyExtractor: (item) => item._id,
 *   paginationTitle: "users",
 * };
 *
 * <DataTable
 *   data={response?.data?.data || []}
 *   totalCount={response?.data?.count ?? 0}
 *   config={config}
 * />
 * ```
 */
export function DataTable<T>({
  data,
  totalCount,
  isLoading = false,
  config,
}: Readonly<DataTableProps<T>>) {
  const {
    currentPage,
    pageSize,
    selectedRows,
    setSelectedRows,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    sortKey,
    sortDirection,
    searchText,
    handleSearch,
  } = useTableQuerySync(config.queryConfig);

  useEffect(() => {
    config.onSelectionChange?.(selectedRows);
  }, [selectedRows, config]);

  return (
    <>
      <div className="bg-bgwhite px-[15px] lg:px-5 3xl:px-6 pt-[15px] lg:pt-5 3xl:pt-7 pb-3 rounded-[20px_20px_0_0] dark:bg-darkbgprimary dark:border-darkbordercolor1">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">{config.header}</div>
          {config.searchPlaceholder && (
            <div className="w-full md:w-64 md:text-right">
              <SearchInput
                value={searchText}
                onChange={handleSearch}
                placeholder={config.searchPlaceholder}
              />
            </div>
          )}
        </div>
      </div>

      <Table<T>
        data={data}
        isLoading={isLoading}
        columns={config.columns}
        keyExtractor={config.keyExtractor}
        handleSort={handleSort}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        rowClassName={config.rowClassName}
        emptyMessage={config.emptyMessage}
        currentSortKey={sortKey}
        currentSortDirection={sortDirection}
      />

      <Pagination
        totalItems={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        title={config.paginationTitle}
      />

      {config.footer}
    </>
  );
}
