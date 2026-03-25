"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useTransition } from "react";
import { Copy, Eye, Plus, Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import {
  ORGANIZATION_STATUS,
  OrganizationStatusValue,
} from "@/shared/constants";
import { getOrganizationStatusColor, walletTruncate } from "@/shared/utils";
import { deleteOrganisationAction } from "@/api/adminOrganisations";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import AddOrganisationModal from "./AddOrganisationModal";
import ViewOrganisationModal from "./ViewOrganisationModal";
import EditOrganisationModal from "./EditOrganisationModal";
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
}: {
  data: OrganisationRow[];
  totalCount: number;
}) => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrganisationId, setSelectedOrganisationId] = useState<
    string | null
  >(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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
      const res = await deleteOrganisationAction({
        organizationIds: [selectedOrganisationId],
      });

      if (res.status || res.statusCode === 200) {
        toast.success(
          tCommon("{entity} {action} successfully", {
            entity: tCommon("Organisation"),
            action: tCommon("deleted"),
          }),
        );
        setIsDeleteModalOpen(false);
        router.refresh();
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
        field: "walletAddress",
        title: t("Wallet Address"),
        render: (item) => (
          <div className="flex items-center gap-1.5">
            <span
              className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}
              title={item.walletAddress}
            >
              {walletTruncate(item.walletAddress)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(item.walletAddress);
                toast.success(t("Wallet address copied"));
              }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-labelprimary transition-colors"
              title={t("Copy wallet address")}
            >
              <Copy size={14} className="text-gray-500 dark:bordercolor1" />
            </button>
          </div>
        ),
      },
      {
        field: "status",
        title: t("Organisation Status"),
        render: (item) => {
          const status = item.status as number;
          const label = (() => {
            if (status === ORGANIZATION_STATUS.ACTIVE)
              return t("OrganisationStatus.active");
            if (status === ORGANIZATION_STATUS.INACTIVE)
              return t("OrganisationStatus.inactive");
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
        field: "propertyHolds",
        title: t("Properties Held"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.propertyHolds}
          </span>
        ),
      },
      {
        field: "",
        title: t("Actions"),
        render: (item) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleOpenViewModal(item.id)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-labelprimary transition-colors text-primarycolor"
              title={t("View")}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenEditModal(item.id)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-labelprimary transition-colors text-secondarycolor"
              title={t("Edit")}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenDeleteModal(item.id)}
              className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500"
              title={t("Delete")}
            >
              <Trash2 className="w-4 h-4" />
            </button>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-0 font-medium bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white hover:bg-primaryhover dark:hover:bg-secondaryhover rounded-lg"
              >
                <Plus size={18} />
                <span>{t("Add Organisation")}</span>
              </button>
            </div>
          </div>
        </div>
      ),
    };
  }, [t]);

  return (
    <>
      <DataTable data={data} totalCount={totalCount} config={config} />
      <AddOrganisationModal open={isAddModalOpen} setOpen={setIsAddModalOpen} />
      <EditOrganisationModal
        open={isEditModalOpen}
        setOpen={setIsEditModalOpen}
        organisationId={selectedOrganisationId}
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
        title={t("Delete Organisation")}
        message={t("Are you sure you want to delete this organisation?")}
        isLoading={isPending}
      />
    </>
  );
};

export default OrganisationsTable;
