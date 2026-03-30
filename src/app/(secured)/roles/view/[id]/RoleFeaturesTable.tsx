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
        toast.success(res.message || t("deleteSuccess"));
        setDeleteModal({ open: false, feature: null });
        router.refresh();
      } else {
        toast.error(res.message || t("deleteError"));
      }
    } catch (error) {
      console.error("Error deleting role feature:", error);
      toast.error(t("deleteError"));
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
        title: t("featureName"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.displayName || item.featureCode}
          </span>
        ),
      },
      {
        field: "value",
        title: t("value"),
        render: (item) =>
          item.value === null ? (
            <span
              className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY} inline-flex items-center gap-1`}
              title={t("unlimited")}
            >
              <Infinity className="w-4 h-4" />
              <span className="sr-only">{t("unlimited")}</span>
            </span>
          ) : (
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {item.value}
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
              onClick={() => handleOpenEdit(item)}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
              title={t("editFeature")}
            >
              <Pencil size={18} />
              <span className="sr-only">{t("editFeature")}</span>
            </button>
            <button
              type="button"
              onClick={() => setDeleteModal({ open: true, feature: item })}
              className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors dark:text-sidebartext"
              title={t("deleteFeature")}
            >
              <Trash2 size={18} />
              <span className="sr-only">{t("deleteFeature")}</span>
            </button>
          </div>
        ),
      },
    ] as TableColumn<RoleFeature>[],
    keyExtractor: (item) => String(item.id),
    paginationTitle: "role-features",
    hideSelectCol: true,
    emptyMessage: t("noFeaturesFound"),
    header: (
      <div className="bg-bgwhite dark:bg-darkbgprimary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              {t("roleFeatures")}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg bg-primarycolor text-bgwhite hover:bg-primaryhover dark:bg-secondarycolor dark:text-black dark:hover:bg-secondaryhover"
            >
              <Plus size={16} />
              <span>{t("addFeature")}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/roles/list")}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-labelprimary bg-bgwhite hover:bg-gray-50 dark:bg-darkbgprimary dark:text-darklabelprimary dark:border-darkbordercolor1"
            >
              {t("backToRoles")}
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
        title={t("deleteFeature")}
        message={t("deleteFeatureConfirmation")}
        isLoading={isDeleting}
      />
    </>
  );
};
export default RoleFeaturesTable;
