"use client";

import { useMemo } from "react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import SearchToolbar from "@/components/atoms/SearchToolbar";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import { Role } from "@/shared/types";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";

interface RolesTableProps {
  data: Role[];
  totalCount: number;
  searchText: string;
}

const RolesTable = ({ data, totalCount, searchText }: RolesTableProps) => {
  const router = useRouter();
  const t = useTranslations("roles");

  const config: DataTableConfig<Role> = useMemo(() => {
    const columns: TableColumn<Role>[] = [
      {
        field: "name",
        title: t("Role Name"),
        render: (item) => (
          <span className={`font-medium line-clamp-2 ${TEXT_PRIMARY}`}>
            {item.name}
          </span>
        ),
      },
      {
        field: "isActive",
        title: t("Role Status"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.isActive ? t("Active") : t("Inactive")}
          </span>
        ),
      },
      {
        field: "featureCount",
        title: t("Features Assigned"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.featureCount ?? 0}
          </span>
        ),
      },
      {
        field: "",
        title: t("Actions"),
        fixed: "right",
        render: (item) => (
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push(`/roles/view/${item.id}`)}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
              title={t("View Features")}
            >
              <Eye size={18} />
              <span className="sr-only">{t("View Features")}</span>
            </button>
          </div>
        ),
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: "roles",
      hideSelectCol: true,
      emptyMessage: t("No roles found"),
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("Roles")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("Header subtitle")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <SearchToolbar
                initialQuery={searchText}
                placeholder={t("Search Roles")}
              />
            </div>
          </div>
        </div>
      ),
    };
  }, [router, searchText, t]);

  return <DataTable data={data} totalCount={totalCount} config={config} />;
};

export default RolesTable;
