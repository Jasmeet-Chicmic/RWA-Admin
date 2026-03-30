"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "react-toastify";

import {
  AdminOrganisation,
  getAdminOrganisationsAction,
} from "@/api/adminOrganisations";
import { assignPropertyToOrganisationAction } from "@/api/allPropertiesActions";
import AsyncSelect, {
  OptionType,
} from "@/components/atoms/AsyncSelect/AsyncSelect";
import Button from "@/components/atoms/Button";

interface AssignLLCModalProps {
  propertyId: string;
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignLLCModal = ({
  propertyId,
  propertyName,
  isOpen,
  onClose,
  onSuccess,
}: AssignLLCModalProps) => {
  const t = useTranslations("properties");
  const [selectedOrganisation, setSelectedOrganisation] =
    useState<OptionType | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchOrganisations = async (params: {
    searchString: string;
    page: number;
    limit: number;
  }) => {
    try {
      const res = await getAdminOrganisationsAction({
        page: params.page,
        pageSize: params.limit,
      });
      console.log("tttt", res);

      if (res.status && res.data) {
        return {
          data: res.data.items.map((org: AdminOrganisation) => ({
            label: org.name,
            value: org.id,
          })),
          count: res.data.totalCount,
        };
      }
      return { data: [], count: 0 };
    } catch (error) {
      console.error("Error fetching organisations:", error);
      return { data: [], count: 0 };
    }
  };

  const handleConfirm = () => {
    if (!selectedOrganisation) {
      toast.error(t("pleaseSelectAnOrganisation"));
      return;
    }

    startTransition(async () => {
      try {
        const res = await assignPropertyToOrganisationAction(
          propertyId,
          String(selectedOrganisation.value),
        );

        if (res.status) {
          toast.success(t("propertyAssignedSuccessfully"));
          onSuccess();
          onClose();
        } else {
          toast.error(res.message || t("errorMessage"));
        }
      } catch {
        toast.error(t("errorMessage"));
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bgwhite dark:bg-darkbgprimary w-full max-w-lg rounded-2xl shadow-2xl  border border-bordergray200 dark:border-darkbordercolor1">
        {/* Header */}
        <div className="px-6 py-4 border-b border-bordergray200 dark:border-darkbordercolor1 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <div>
            <h3 className="text-lg font-bold text-bgblack dark:text-white">
              {t("assignModalTitle")}
            </h3>
            <p className="text-sm text-textprimary dark:text-secondary truncate max-w-[300px]">
              {propertyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} className="text-textprimary dark:text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bgblack dark:text-white">
              {t("assignCompanyLabel")}
            </label>
            <AsyncSelect
              placeholder={t("assignModalDescription")}
              getData={fetchOrganisations}
              onChange={(val) => setSelectedOrganisation(val as OptionType)}
              value={selectedOrganisation}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-bordergray200 dark:border-darkbordercolor1 bg-gray-50/50 dark:bg-white/5 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl px-6 h-11"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            isLoading={isPending}
            disabled={!selectedOrganisation}
            className="rounded-xl px-8 h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
          >
            {t("assign")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignLLCModal;
