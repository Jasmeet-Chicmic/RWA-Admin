"use client";

// import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useState } from "react";

import SearchInput from "@/components/atoms/SearchInput/SearchInput";
import { TableColumn } from "@/components/atoms/Table";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { useDebounce } from "@/hooks/useDebounce";
import { BasePropertyUser } from "@/types/properties";
import { TEXT_PRIMARY_DARK as TEXT_PRIMARY } from "@/shared/styles";

interface PropertyUsersTableBaseProps<T extends BasePropertyUser> {
  data: T[];
  totalCount: number;
  isLoading?: boolean;
  columns: TableColumn<T>[];
  paginationTitle: string;
  emptyMessage: string;
  title: string;
  description: string;
  actionButtons?: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const PropertyUsersTableBase = <T extends BasePropertyUser>({
  data,
  totalCount,
  isLoading = false,
  columns,
  paginationTitle,
  emptyMessage,
  title,
  description,
  actionButtons,
  searchPlaceholder,
  searchValue = "",
  onSearchChange,
}: PropertyUsersTableBaseProps<T>) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const debouncedSearchValue = useDebounce(localSearchValue, 400);

  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (!onSearchChange) return;
    if (debouncedSearchValue === searchValue) return;
    onSearchChange(debouncedSearchValue);
  }, [debouncedSearchValue, onSearchChange, searchValue]);

  const config: DataTableConfig<T> = {
    columns,
    keyExtractor: (item) => item.id,
    paginationTitle,
    hideSelectCol: true,
    emptyMessage,
    header: (
      <div className="bg-bgwhite dark:bg-darkbgprimary">
        <div className="flex items-end justify-between gap-4 overflow-x-auto">
          <div className="shrink-0">
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              {title}
            </h2>
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {description}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {onSearchChange && searchPlaceholder ? (
              <div className="w-[220px]">
                <SearchInput
                  value={localSearchValue}
                  onChange={setLocalSearchValue}
                  placeholder={searchPlaceholder}
                />
              </div>
            ) : null}
            {actionButtons}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <DataTable<T>
      data={data}
      totalCount={totalCount}
      isLoading={isLoading}
      config={config}
    />
  );
};

export default PropertyUsersTableBase;
