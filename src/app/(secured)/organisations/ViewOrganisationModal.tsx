"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Copy, Loader2 } from "lucide-react";

import CustomModal from "@/components/molecules/CustomModal/CustomModal";
import {
  getSpecificOrganisationAction,
  AdminOrganisation,
} from "@/api/adminOrganisations";
import {
  ORGANIZATION_STATUS,
  OrganizationStatusValue,
} from "@/shared/constants";
import { getOrganizationStatusColor } from "@/shared/utils";
import { TEXT_PRIMARY_DARK as TEXT_PRIMARY } from "@/shared/styles";

interface ViewOrganisationModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  organisationId: string | null;
}

const ViewOrganisationModal = ({
  open,
  setOpen,
  organisationId,
}: ViewOrganisationModalProps) => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");
  const [organisation, setOrganisation] = useState<AdminOrganisation | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open && organisationId) {
      startTransition(async () => {
        try {
          const res = await getSpecificOrganisationAction(organisationId);
          if (res.status && res.data) {
            setOrganisation(res.data);
          } else {
            toast.error(
              res.message || tCommon("Failed to fetch organisation details"),
            );
            setOpen(false);
          }
        } catch {
          toast.error(tCommon("Failed to fetch organisation details"));
          setOpen(false);
        }
      });
    } else {
      setOrganisation(null);
    }
  }, [open, organisationId, setOpen, tCommon]);

  const DetailRow = ({
    label,
    value,
    copyable = false,
  }: {
    label: string;
    value: React.ReactNode;
    copyable?: boolean;
  }) => (
    <div className="flex flex-col space-y-1 py-3 border-b border-bordercolor1 dark:border-bordercolor2 last:border-0">
      <span className="text-xs font-semibold text-textparagraph dark:text-textparagraphlight uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center justify-between">
        <div className={`${TEXT_PRIMARY} font-medium break-all`}>{value}</div>
        {copyable && value && typeof value === "string" && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(value);
              toast.success(tCommon("{entity} copied", { entity: label }));
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-labelprimary transition-colors text-gray-500"
            title={tCommon("copy")}
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <CustomModal
      isOpen={open}
      onClose={() => setOpen(false)}
      title={t("organisationDetails")}
      size="xl"
    >
      {isPending ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primarycolor" />
          <p className="text-sm text-textparagraph dark:text-textparagraphlight italic">
            {tCommon("loading")}
          </p>
        </div>
      ) : organisation ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <DetailRow label={t("organisationName")} value={organisation.name} />
          <DetailRow
            label={t("status.label")}
            value={
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getOrganizationStatusColor(
                  organisation.status as OrganizationStatusValue,
                )}`}
              >
                {(() => {
                  const status = organisation.status as number;
                  if (status === ORGANIZATION_STATUS.ACTIVE)
                    return t("organisationStatus.active");
                  if (status === ORGANIZATION_STATUS.INACTIVE)
                    return t("organisationStatus.inactive");
                  return String(organisation.status);
                })()}
              </span>
            }
          />
          <DetailRow label={t("entityType")} value={organisation.entityType} />
          <DetailRow
            label={t("registrationNumber")}
            value={organisation.registrationNumber}
          />
          <DetailRow
            label={t("jurisdiction")}
            value={organisation.jurisdiction}
          />
          <DetailRow
            label={t("incorporationDate")}
            value={organisation.incorporationDate}
          />
          <DetailRow
            label={t("walletAddress")}
            value={organisation.walletAddress}
            copyable
          />
          <DetailRow
            label={t("propertiesHeld")}
            value={organisation.propertyHolds}
          />
        </div>
      ) : (
        <div className="py-8 text-center text-textparagraph dark:text-textparagraphlight">
          {t("noOrganisationsFound")}
        </div>
      )}
    </CustomModal>
  );
};

export default ViewOrganisationModal;
