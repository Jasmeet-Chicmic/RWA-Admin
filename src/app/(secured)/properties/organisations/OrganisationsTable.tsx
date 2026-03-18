"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";

import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import { TEXT_PRIMARY_DARK as TEXT_PRIMARY, TEXT_SIZE_SM } from "@/shared/styles";
import { ROUTES } from "@/shared/routes";

export type OrganisationEntityType = "LLC" | "SPV" | "Trust";

export type OrganisationRow = {
  id: string;
  name: string;
  entityType: OrganisationEntityType;
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
  propertyholds: number;
};

const OrganisationsTable = ({
  data,
  totalCount,
}: {
  data: OrganisationRow[];
  totalCount: number;
}) => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");

  const config: DataTableConfig<OrganisationRow> = useMemo(() => {
    const columns: TableColumn<OrganisationRow>[] = [
      {
        field: "name",
        title: t("Organisation Name"),
        render: (item) => (
          <span className={`${TEXT_PRIMARY} font-medium`}>{item.name}</span>
        ),
      },
      {
        field: "entityType",
        title: t("Entity Type"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.entityType}
          </span>
        ),
      },
      {
        field: "registrationNumber",
        title: t("Registration Number"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.registrationNumber}
          </span>
        ),
      },
      {
        field: "jurisdiction",
        title: t("Jurisdiction"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.jurisdiction}
          </span>
        ),
      },
      {
        field: "incorporationDate",
        title: t("Incorporation Date"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.incorporationDate}
          </span>
        ),
      },
      {
        field: "propertyholds",
        title: t("Properties Held"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.propertyholds}
          </span>
        ),
      },
      {
        field: "",
        title: tCommon("Actions"),
        render: (item) => (
          <div className="flex items-center justify-end">
            <Link
              href={`${ROUTES.PROPERTIES_ASSETS}?organisationId=${encodeURIComponent(item.id)}`}
              className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold text-primarycolor hover:underline"
            >
              <Eye className="w-4 h-4" />
              {tCommon("View")}
            </Link>
          </div>
        ),
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: "organisations",
      hideSelectCol: true,
      emptyMessage: t("No organisations found"),
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("Organisations")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("Organisations subtitle")}
              </p>
            </div>
          </div>
        </div>
      ),
    };
  }, [t, tCommon]);

  return <DataTable data={data} totalCount={totalCount} config={config} />;
};

export default OrganisationsTable;

