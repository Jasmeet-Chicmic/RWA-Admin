"use client";

import TableActions, {
  TableActionDisplayMode,
  TableActionItem,
} from "@/components/atoms/TableActions";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { TableColumn } from "@/components/atoms/Table";
import CopyToClipboardPill from "@/components/atoms/CopyToClipboardPill/CopyToClipboardPill";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { ROUTES } from "@/shared/routes";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { truncateText } from "@/shared/utils";
import { toast } from "react-toastify";

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
  const tCommon = useTranslations("common");
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
          <div className="flex items-center gap-2">
            <MapPin size={14} className={TEXT_PRIMARY} />
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {truncateText(item.jurisdiction, 40, "—")}
            </span>
            {item.jurisdiction ? (
              <CopyToClipboardPill
                value={item.jurisdiction}
                showText={false}
                title={tCommon("copy")}
                onCopied={() => toast.success(tCommon("copiedToClipboard"))}
                className="px-2 py-1"
              />
            ) : null}
          </div>
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
  }, [actionsDisplayMode, router, t, tCommon]);

  return <DataTable data={data} totalCount={totalCount} config={config} />;
};

export default PropertyOrganisationsTable;
