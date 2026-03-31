"use client";

import TableActions, {
  TableActionDisplayMode,
  TableActionItem,
} from "@/components/atoms/TableActions";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { TableColumn } from "@/components/atoms/Table";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { ROUTES } from "@/shared/routes";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";

export type OrganisationEntityType = "LLC" | "SPV" | "Trust";

export type OrganisationRow = {
  id: string;
  name: string;
  entityType: OrganisationEntityType;
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
  propertyHolds: number;
};

const PropertyOrganisationsTable = ({
  data,
  totalCount,
}: {
  data: OrganisationRow[];
  totalCount: number;
}) => {
  const t = useTranslations("properties");
  const router = useRouter();
  const actionsDisplayMode: TableActionDisplayMode = "dropdown";

  const config: DataTableConfig<OrganisationRow> = useMemo(() => {
    const columns: TableColumn<OrganisationRow>[] = [
      {
        field: "name",
        title: t("organisationName"),
        render: (item) => (
          <span className={`${TEXT_PRIMARY} font-medium`}>{item.name}</span>
        ),
      },
      {
        field: "entityType",
        title: t("entityType"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.entityType}
          </span>
        ),
      },
      {
        field: "registrationNumber",
        title: t("registrationNumber"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.registrationNumber}
          </span>
        ),
      },
      {
        field: "jurisdiction",
        title: t("jurisdiction"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.jurisdiction}
          </span>
        ),
      },
      {
        field: "incorporationDate",
        title: t("incorporationDate"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.incorporationDate}
          </span>
        ),
      },
      {
        field: "propertyHolds",
        title: t("propertiesHeld"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.propertyHolds}
          </span>
        ),
      },
      {
        field: "",
        title: t("actions"),
        render: (item) => {
          const actions: TableActionItem[] = [
            {
              id: `view-all-properties-${item.id}`,
              label: t("viewAllProperties"),
              onClick: () =>
                router.push(
                  `${ROUTES.PROPERTIES_ORGANISATIONS}/${encodeURIComponent(item.id)}`,
                ),
            },
          ];

          return (
            <div className="flex items-center justify-center">
              <TableActions
                displayMode={actionsDisplayMode}
                actions={actions}
                ariaLabel={t("actions")}
              />
            </div>
          );
        },
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: "organisations",
      hideSelectCol: true,
      emptyMessage: t("noOrganisationsFound"),
      queryConfig: {
        defaultPageSize: 10,
        defaultSortKey: "",
        skipFirstRender: true,
      },
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("organisations")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("organisationsSubtitle")}
              </p>
            </div>
          </div>
        </div>
      ),
    };
  }, [actionsDisplayMode, router, t]);

  return <DataTable data={data} totalCount={totalCount} config={config} />;
};

export default PropertyOrganisationsTable;
