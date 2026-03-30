"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import {
  updateOrganisationAction,
  getSpecificOrganisationAction,
  AdminOrganisation,
  UpdateOrganisationPayload,
} from "@/api/adminOrganisations";
import CustomModal from "@/components/molecules/CustomModal";
import FormBuilder from "@/components/molecules/FormBuilder";
import { FormConfig } from "@/components/molecules/FormBuilder/types";
import { getRequiredFieldMessage } from "@/components/molecules/FormBuilder/helpers/utils";
import {
  FORM_FIELDS_TYPES,
  ORGANIZATION_ENTITY_TYPE,
  ORGANIZATION_ENTITY_TYPE_OPTIONS,
} from "@/shared/constants";

type EditOrganisationForm = {
  name: string;
  email: string;
  password?: string;
  walletAddress: string;
  entityType: number;
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
};

const EditOrganisationModal = ({
  open,
  setOpen,
  organisationId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  organisationId: string | null;
}) => {
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [organisation, setOrganisation] = useState<AdminOrganisation | null>(
    null,
  );
  const router = useRouter();
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (open && organisationId) {
      setIsFetching(true);
      const fetchOrganisation = async () => {
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
        } finally {
          setIsFetching(false);
        }
      };
      fetchOrganisation();
    } else {
      setOrganisation(null);
    }
  }, [open, organisationId, setOpen, tCommon]);

  const formConfig: FormConfig<EditOrganisationForm> = () => {
    const fields = [
      {
        name: "name" as const,
        label: t("name"),
        type: FORM_FIELDS_TYPES.TEXT,
        validation: {
          required: getRequiredFieldMessage(t("name"), tCommon),
        },
      },
      {
        name: "email" as const,
        label: t("email"),
        type: FORM_FIELDS_TYPES.EMAIL,
        validation: {
          required: getRequiredFieldMessage(t("email"), tCommon),
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: t("invalidEmailAddress"),
          },
        },
      },
      {
        name: "password" as const,
        label: t("password"),
        type: FORM_FIELDS_TYPES.PASSWORD,
        placeholder: t("leaveBlankToKeepCurrentPassword"),
        validation: {
          minLength: {
            value: 6,
            message: t("passwordMustBeAtLeast6Characters"),
          },
        },
      },
      {
        name: "walletAddress" as const,
        label: t("walletAddress"),
        type: FORM_FIELDS_TYPES.TEXT,
        validation: {
          required: getRequiredFieldMessage(t("walletAddress"), tCommon),
        },
      },
      {
        name: "entityType" as const,
        label: t("entityType"),
        type: FORM_FIELDS_TYPES.SELECT,
        options: ORGANIZATION_ENTITY_TYPE_OPTIONS,
        validation: {
          required: getRequiredFieldMessage(t("entityType"), tCommon),
        },
      },
      {
        name: "registrationNumber" as const,
        label: t("registrationNumber"),
        type: FORM_FIELDS_TYPES.TEXT,
        validation: {
          required: getRequiredFieldMessage(t("registrationNumber"), tCommon),
        },
      },
      {
        name: "jurisdiction" as const,
        label: t("jurisdiction"),
        type: FORM_FIELDS_TYPES.TEXT,
        validation: {
          required: getRequiredFieldMessage(t("jurisdiction"), tCommon),
        },
      },
      {
        name: "incorporationDate" as const,
        label: t("incorporationDate"),
        type: FORM_FIELDS_TYPES.DATE,
        returnISOFormat: true,
        validation: {
          required: getRequiredFieldMessage(t("incorporationDate"), tCommon),
        },
      },
    ];

    return fields;
  };

  const onSubmit = (data: EditOrganisationForm) => {
    if (!organisationId) return;

    startTransition(async () => {
      const payload: UpdateOrganisationPayload = {
        ...data,
        organizationId: organisationId,
        entityType: Number(data.entityType),
        password: data.password || undefined,
      };

      const res = await updateOrganisationAction(payload);

      if (res.statusCode === 200 || res.status) {
        toast.success(
          tCommon("{entity} {action} successfully", {
            entity: t("organisationName"),
            action: t("edit"),
          }),
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(
          (res as { message?: string }).message ||
            tCommon("Failed to {action} {entity}", {
              action: t("edit").toLowerCase(),
              entity: t("organisationName").toLowerCase(),
            }),
        );
      }
    });
  };

  const getDefaultValues = () => {
    if (!organisation) return undefined;

    // Map entityType string to number
    const entityTypeMap: Record<string, number> = {
      LLC: ORGANIZATION_ENTITY_TYPE.LLC,
      SPV: ORGANIZATION_ENTITY_TYPE.SPV,
      Trust: ORGANIZATION_ENTITY_TYPE.TRUST,
    };

    return {
      name: organisation.name,
      email: organisation.email || "",
      walletAddress: organisation.walletAddress,
      entityType:
        entityTypeMap[organisation.entityType] || ORGANIZATION_ENTITY_TYPE.LLC,
      registrationNumber: organisation.registrationNumber,
      jurisdiction: organisation.jurisdiction,
      incorporationDate: organisation.incorporationDate.split("T")[0],
    };
  };

  return (
    <CustomModal
      isOpen={open}
      onClose={() => setOpen(false)}
      title={t("editOrganisation")}
      size="2xl"
    >
      {isFetching ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primarycolor" />
          <p className="text-sm text-textparagraph dark:text-textparagraphlight italic">
            {tCommon("loading")}
          </p>
        </div>
      ) : organisation ? (
        <FormBuilder<EditOrganisationForm>
          formConfig={formConfig}
          onSubmit={onSubmit}
          isLoading={isPending}
          scrollable={true}
          defaultValues={getDefaultValues()}
        />
      ) : null}
    </CustomModal>
  );
};

export default EditOrganisationModal;
