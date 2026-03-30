"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import CustomModal from "@/components/molecules/CustomModal/CustomModal";
import { RoleFeature } from "@/shared/types";
import { updateRoleFeaturesAction } from "@/api/roles";

interface RoleFeatureEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string;
  feature: RoleFeature | null;
  onSuccess: () => void;
}

const RoleFeatureEditModal = ({
  isOpen,
  onClose,
  roleId,
  feature,
  onSuccess,
}: RoleFeatureEditModalProps) => {
  const t = useTranslations("roles.editModal");
  const tRoles = useTranslations("roles");
  const [value, setValue] = useState<number | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (feature) {
      const currentValue = feature.value ?? null;
      setValue(currentValue);
      setIsUnlimited(currentValue === null);
    }
  }, [feature]);

  if (!feature) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = [
        {
          featureId: feature.featureId,
          featureCode: feature.featureCode,
          value: isUnlimited ? null : value,
        },
      ];

      const res = await updateRoleFeaturesAction(roleId, payload);

      if (res.status) {
        toast.success(res.message || t("saveSuccess"));
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || t("saveError"));
      }
    } catch (error) {
      console.error("Error updating role feature:", error);
      toast.error(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const isInvalid =
    !isUnlimited &&
    (value === null || Number.isNaN(Number(value)) || (value ?? 0) < 0);

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={t("title")} size="md">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-textprimary dark:text-sidebartext mb-1">
            {tRoles("Feature Name")}
          </label>
          <div className="px-4 py-2 bg-gray-50 dark:bg-darkbgsecondary rounded-lg text-sm text-gray-600 dark:text-gray-400 border border-bordercolor1 dark:border-darkbordercolor1">
            {feature.displayName || feature.featureCode}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-textprimary dark:text-sidebartext mb-3">
            {t("value")}
          </label>

          <div className="flex rounded-lg overflow-hidden border border-bordercolor1 dark:border-darkbordercolor1 mb-3">
            <button
              type="button"
              onClick={() => setIsUnlimited(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
                isUnlimited
                  ? "bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white/80"
                  : "bg-gray-50 dark:bg-darkbgsecondary text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span>∞</span>
              {tRoles("Unlimited")}
            </button>
            <button
              type="button"
              onClick={() => setIsUnlimited(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
                !isUnlimited
                  ? "bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white/80"
                  : "bg-gray-50 dark:bg-darkbgsecondary text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span>#</span>
              {tRoles("Custom")}
            </button>
          </div>

          {!isUnlimited && (
            <>
              <input
                type="number"
                min={0}
                value={value ?? ""}
                onChange={(e) =>
                  setValue(
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                placeholder={t("valuePlaceholder")}
                className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-textprimary dark:text-bgwhite focus:outline-none focus:ring-2 transition-all ${
                  isInvalid
                    ? "border-red-500 focus:ring-red-500/30"
                    : "border-bordercolor1 dark:border-darkbordercolor1 focus:ring-primarycolor/30"
                }`}
              />
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 text-labelprimary bg-bgwhite hover:bg-gray-50 dark:bg-darkbgprimary dark:text-darklabelprimary dark:border-darkbordercolor1 disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isInvalid}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-primarycolor text-bgwhite hover:bg-primaryhover dark:bg-secondarycolor dark:text-black dark:hover:bg-secondaryhover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? t("saving") : t("saveChanges")}
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default RoleFeatureEditModal;
