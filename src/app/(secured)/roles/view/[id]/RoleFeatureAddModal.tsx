"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import CustomModal from "@/components/molecules/CustomModal/CustomModal";
import AsyncSelect, {
  AsyncSelectGetDataParams,
  OptionType,
} from "@/components/atoms/AsyncSelect/AsyncSelect";
import { RoleFeature } from "@/shared/types";
import { updateRoleFeaturesAction } from "@/api/roles";

interface RoleFeatureAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string;
  existingFeatures: RoleFeature[];
  onSuccess: () => void;
}

interface DefaultFeatureOption extends OptionType {
  featureCode: string;
  defaultValue: number | null;
}

const RoleFeatureAddModal = ({
  isOpen,
  onClose,
  roleId,
  existingFeatures,
  onSuccess,
}: RoleFeatureAddModalProps) => {
  const t = useTranslations("roles.AddModal");
  const tRoles = useTranslations("roles");

  const [selectedFeature, setSelectedFeature] =
    useState<DefaultFeatureOption | null>(null);
  const [value, setValue] = useState<number | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const existingFeatureIds = useMemo(
    () => new Set(existingFeatures.map((f) => f.featureId)),
    [existingFeatures],
  );

  const resetState = () => {
    setSelectedFeature(null);
    setValue(null);
    setIsUnlimited(false);
  };

  const handleClose = () => {
    if (isSaving) return;
    resetState();
    onClose();
  };

  const getData = async ({
    searchString,
    page,
    limit,
  }: AsyncSelectGetDataParams) => {
    const skip = (page - 1) * limit;

    const params = new URLSearchParams();
    params.set("skip", String(skip));
    params.set("limit", String(limit));
    if (searchString) {
      params.set("searchText", searchString);
    }

    const res = await fetch(
      `/admin-portal/api/default-features/options?${params.toString()}`,
    );

    if (!res.ok) {
      return { data: [], count: 0 };
    }

    const json = (await res.json()) as {
      data: DefaultFeatureOption[];
      count: number;
    };

    const data = json.data.filter(
      (opt) => !existingFeatureIds.has(String(opt.value)),
    );

    return {
      data,
      count: json.count,
    };
  };

  const handleFeatureChange = (option: DefaultFeatureOption | null) => {
    setSelectedFeature(option);
    if (option) {
      const currentValue = option.defaultValue;
      setValue(currentValue);
      setIsUnlimited(currentValue === null);
    } else {
      setValue(null);
      setIsUnlimited(false);
    }
  };

  const isInvalid =
    !isUnlimited &&
    selectedFeature != null &&
    (value === null || Number.isNaN(Number(value)) || (value ?? 0) < 0);

  const handleSave = async () => {
    if (!selectedFeature) return;

    setIsSaving(true);
    try {
      const payload = [
        {
          featureId: String(selectedFeature.value),
          featureCode: selectedFeature.featureCode,
          value: isUnlimited ? null : value,
        },
      ];

      const res = await updateRoleFeaturesAction(roleId, payload);

      if (res.status) {
        toast.success(res.message || t("Save Success"));
        onSuccess();
        handleClose();
      } else {
        toast.error(res.message || t("Save Error"));
      }
    } catch (error) {
      console.error("Error adding role feature:", error);
      toast.error(t("Save Error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("Title")}
      size="md"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-textprimary dark:text-sidebartext mb-1">
            {t("Select Feature")}
          </label>
          <AsyncSelect
            getData={getData}
            placeholder={t("Select Feature Placeholder")}
            value={selectedFeature}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(option) => handleFeatureChange(option as any)}
            inputId="role-feature-add"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-textprimary dark:text-sidebartext mb-3">
            {tRoles("Value")}
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
                placeholder={t("ValuePlaceholder")}
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
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 text-labelprimary bg-bgwhite hover:bg-gray-50 dark:bg-darkbgprimary dark:text-darklabelprimary dark:border-darkbordercolor1 disabled:opacity-50"
          >
            {t("Cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !selectedFeature || isInvalid}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-primarycolor text-bgwhite hover:bg-primaryhover dark:bg-secondarycolor dark:text-black dark:hover:bg-secondaryhover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? t("Saving") : t("Save Changes")}
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default RoleFeatureAddModal;
