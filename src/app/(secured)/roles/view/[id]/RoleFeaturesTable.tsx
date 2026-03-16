"use client";

import { useState } from "react";
import { Infinity, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import { RoleFeature } from "@/shared/types";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import RoleFeatureEditModal from "./RoleFeatureEditModal";
import RoleFeatureAddModal from "./RoleFeatureAddModal";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import { deleteRoleFeatureAction } from "@/api/roles";
import { toast } from "react-toastify";

interface RoleFeaturesTableProps {
  roleId: string;
  features: RoleFeature[];
}

const RoleFeaturesTable = ({ roleId, features }: RoleFeaturesTableProps) => {
  const t = useTranslations("roles");
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<RoleFeature | null>(
    null,
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    feature: RoleFeature | null;
  }>({ open: false, feature: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteModal.feature) return;
    setIsDeleting(true);
    try {
      const res = await deleteRoleFeatureAction(
        roleId,
        deleteModal.feature.featureId,
      );
      if (res.status) {
        toast.success(res.message || t("Delete Success"));
        setDeleteModal({ open: false, feature: null });
        router.refresh();
      } else {
        toast.error(res.message || t("Delete Error"));
      }
    } catch (error) {
      console.error("Error deleting role feature:", error);
      toast.error(t("Delete Error"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (feature: RoleFeature) => {
    setSelectedFeature(feature);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedFeature(null);
  };

  const config: DataTableConfig<RoleFeature> = {
    columns: [
      {
        field: "displayName",
        title: t("Feature Name"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.displayName || item.featureCode}
          </span>
        ),
      },
      {
        field: "value",
        title: t("Value"),
        render: (item) =>
          item.value === null ? (
            <span
              className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY} inline-flex items-center gap-1`}
              title={t("Unlimited")}
            >
              <Infinity className="w-4 h-4" />
              <span className="sr-only">{t("Unlimited")}</span>
            </span>
          ) : (
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {item.value}
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
              onClick={() => handleOpenEdit(item)}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
              title={t("Edit Feature")}
            >
              <Pencil size={18} />
              <span className="sr-only">{t("Edit Feature")}</span>
            </button>
            <button
              type="button"
              onClick={() => setDeleteModal({ open: true, feature: item })}
              className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors dark:text-sidebartext"
              title={t("Delete Feature")}
            >
              <Trash2 size={18} />
              <span className="sr-only">{t("Delete Feature")}</span>
            </button>
          </div>
        ),
      },
    ] as TableColumn<RoleFeature>[],
    keyExtractor: (item) => String(item.id),
    paginationTitle: "role-features",
    hideSelectCol: true,
    emptyMessage: t("No features found"),
    header: (
      <div className="bg-bgwhite dark:bg-darkbgprimary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              {t("Role Features")}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg bg-primarycolor text-bgwhite hover:bg-primaryhover dark:bg-secondarycolor dark:text-black dark:hover:bg-secondaryhover"
            >
              <Plus size={16} />
              <span>{t("Add Feature")}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/roles/list")}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-labelprimary bg-bgwhite hover:bg-gray-50 dark:bg-darkbgprimary dark:text-darklabelprimary dark:border-darkbordercolor1"
            >
              {t("Back to Roles")}
            </button>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <>
      <DataTable data={features} totalCount={features.length} config={config} />
      <RoleFeatureEditModal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        roleId={roleId}
        feature={selectedFeature}
        onSuccess={() => router.refresh()}
      />
      <RoleFeatureAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        roleId={roleId}
        existingFeatures={features}
        onSuccess={() => router.refresh()}
      />
      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => {
          if (isDeleting) return;
          setDeleteModal({ open: false, feature: null });
        }}
        onConfirm={handleDelete}
        title={t("Delete Feature")}
        message={t("Delete Feature confirmation")}
        isLoading={isDeleting}
      />
    </>
  );
};
export default RoleFeaturesTable;
