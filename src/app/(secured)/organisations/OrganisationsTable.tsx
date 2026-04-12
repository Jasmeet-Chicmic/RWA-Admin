"use client";

import { Building2, Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "react-toastify";

import CopyToClipboardPill from "@/components/atoms/CopyToClipboardPill/CopyToClipboardPill";
import { TableColumn } from "@/components/atoms/Table";
import TableActions, {
  TABLE_ACTION_DISPLAY_MODES,
  TableActionItem,
} from "@/components/atoms/TableActions";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { organisationsService } from "@/services/organisations-service";
import {
  ORGANIZATION_STATUS,
  OrganizationStatusValue,
} from "@/shared/constants";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { getOrganizationStatusColor, walletTruncate } from "@/shared/utils";
import AddOrganisationModal from "./AddOrganisationModal";
import EditOrganisationModal from "./EditOrganisationModal";
import ViewOrganisationModal from "./ViewOrganisationModal";
export type OrganisationEntityType = "LLC" | "SPV" | "Trust";

export type OrganisationRow = {
  id: string;
  name: string;
  walletAddress: string;
  entityType: OrganisationEntityType;
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
  status: number;
  propertyHolds: number;
};

const OrganisationsTable = ({
  data,
  totalCount,
  isLoading = false,
  onRefresh,
}: {
  data: OrganisationRow[];
  totalCount: number;
  isLoading?: boolean;
  onRefresh?: () => void;
}) => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrganisationId, setSelectedOrganisationId] = useState<
    string | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenViewModal = (id: string) => {
    setSelectedOrganisationId(id);
    setIsViewModalOpen(true);
  };

  const handleOpenEditModal = (id: string) => {
    setSelectedOrganisationId(id);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (id: string) => {
    setSelectedOrganisationId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedOrganisationId) return;

    startTransition(async () => {
      const res = await organisationsService.deleteOrganisation([
        selectedOrganisationId,
      ]);

      if (res.status || res.statusCode === 200) {
        toast.success(
          tCommon("{entity} {action} successfully", {
            entity: tCommon("Organisation"),
            action: tCommon("deleted"),
          }),
        );
        setIsDeleteModalOpen(false);
        onRefresh?.();
      } else {
        toast.error(
          (res as { message?: string }).message ||
            tCommon("Failed to {action} {entity}", {
              action: tCommon("delete"),
              entity: tCommon("organisation").toLowerCase(),
            }),
        );
      }
    });
  };

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
        field: "walletAddress",
        title: t("walletAddress"),
        render: (item) => (
          <div
            className="flex justify-start"
            onClick={(e) => e.stopPropagation()}
          >
            <CopyToClipboardPill
              value={item.walletAddress}
              displayValue={walletTruncate(item.walletAddress)}
              title={t("copyWalletAddress")}
              onCopied={() => toast.success(tCommon("copiedToClipboard"))}
              className="max-w-[min(100%,220px)]"
            />
          </div>
        ),
      },
      {
        field: "status",
        title: t("status.label"),
        render: (item) => {
          const status = item.status as number;
          const label = (() => {
            if (status === ORGANIZATION_STATUS.ACTIVE)
              return t("organisationStatus.active");
            if (status === ORGANIZATION_STATUS.INACTIVE)
              return t("organisationStatus.inactive");
            return String(item.status);
          })();

          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getOrganizationStatusColor(
                status as OrganizationStatusValue,
              )}`}
            >
              {label}
            </span>
          );
        },
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
          <div className="w-full flex justify-center">
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {item.propertyHolds}
            </span>
          </div>
        ),
      },
      {
        field: "",
        title: t("actions"),
        render: (item) => {
          const actions: TableActionItem[] = [
            {
              id: `view-details-${item.id}`,
              label: t("viewDetails"),
              icon: <Eye className="w-4 h-4" />,
              onClick: () => handleOpenViewModal(item.id),
            },
            {
              id: `view-properties-${item.id}`,
              label: `${t("view")} ${t("properties")}`,
              icon: <Building2 className="w-4 h-4" />,
              onClick: () =>
                router.push(
                  `/properties/organisations/${encodeURIComponent(item.id)}`,
                ),
            },
            {
              id: `edit-${item.id}`,
              label: t("edit"),
              icon: <Edit className="w-4 h-4" />,
              onClick: () => handleOpenEditModal(item.id),
              className: "text-secondarycolor",
            },
            {
              id: `delete-${item.id}`,
              label: t("delete"),
              icon: <Trash2 className="w-4 h-4" />,
              onClick: () => handleOpenDeleteModal(item.id),
              className: "text-red-500",
            },
          ];

          return (
            <div className="flex items-center justify-end">
              <TableActions
                displayMode={TABLE_ACTION_DISPLAY_MODES.DROPDOWN}
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-0 font-medium bg-primarycolor text-black dark:bg-secondarycolor dark:text-black hover:bg-primaryhover dark:hover:bg-secondaryhover rounded-lg"
              >
                <Plus size={18} />
                <span>{t("addOrganisation")}</span>
              </button>
            </div>
          </div>
        </div>
      ),
    };
  }, [router, t, tCommon]);

  return (
    <>
      <DataTable
        data={data}
        totalCount={totalCount}
        isLoading={isLoading}
        config={config}
      />
      <AddOrganisationModal
        open={isAddModalOpen}
        setOpen={setIsAddModalOpen}
        onSuccess={onRefresh}
      />
      <EditOrganisationModal
        open={isEditModalOpen}
        setOpen={setIsEditModalOpen}
        organisationId={selectedOrganisationId}
        onSuccess={onRefresh}
      />
      <ViewOrganisationModal
        open={isViewModalOpen}
        setOpen={setIsViewModalOpen}
        organisationId={selectedOrganisationId}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("deleteOrganisation")}
        message={t("areYouSureYouWantToDeleteThisOrganisation")}
        isLoading={isPending}
        variant="danger"
      />
    </>
  );
};

export default OrganisationsTable;
