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
        title: t("roleName"),
        render: (item) => (
          <span className={`font-medium line-clamp-2 ${TEXT_PRIMARY}`}>
            {item.name}
          </span>
        ),
      },
      {
        field: "isActive",
        title: t("roleStatus"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.isActive ? t("active") : t("inactive")}
          </span>
        ),
      },
      {
        field: "featureCount",
        title: t("featuresAssigned"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.featureCount ?? 0}
          </span>
        ),
      },
      {
        field: "",
        title: t("actions"),
        fixed: "right",
        render: (item) => (
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push(`/roles/view/${item.id}`)}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
              title={t("viewFeatures")}
            >
              <Eye size={18} />
              <span className="sr-only">{t("viewFeatures")}</span>
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
      emptyMessage: t("noRolesFound"),
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("roles")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("headerSubtitle")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <SearchToolbar
                initialQuery={searchText}
                placeholder={t("searchRoles")}
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
