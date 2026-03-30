"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { createOrganisationAction } from "@/api/adminOrganisations";
import CustomModal from "@/components/molecules/CustomModal";
import FormBuilder from "@/components/molecules/FormBuilder";
import { FormConfig } from "@/components/molecules/FormBuilder/types";
import { getRequiredFieldMessage } from "@/components/molecules/FormBuilder/helpers/utils";
import {
  FORM_FIELDS_TYPES,
  ORGANIZATION_ENTITY_TYPE,
  ORGANIZATION_ENTITY_TYPE_OPTIONS,
} from "@/shared/constants";

type AddOrganisationForm = {
  name: string;
  email: string;
  password: string;
  walletAddress: string;
  entityType: number;
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
};

const INITIAL_ENTITY_TYPE = ORGANIZATION_ENTITY_TYPE.LLC;

const AddOrganisationModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");

  const formConfig: FormConfig<AddOrganisationForm> = () => {
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
        validation: {
          required: getRequiredFieldMessage(t("password"), tCommon),
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

  const onSubmit = (data: AddOrganisationForm) => {
    startTransition(async () => {
      const res = await createOrganisationAction({
        ...data,
        entityType: Number(data.entityType),
      });

      if (res.statusCode === 200 || res.status) {
        toast.success(
          tCommon("{entity} {action} successfully", {
            entity: tCommon("Organisation"),
            action: tCommon("created"),
          }),
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(
          (res as { message?: string }).message ||
            tCommon("Failed to {action} {entity}", {
              action: tCommon("create"),
              entity: tCommon("Organisation").toLowerCase(),
            }),
        );
      }
    });
  };

  return (
    <CustomModal
      isOpen={open}
      onClose={() => setOpen(false)}
      title={t("addOrganisation")}
      size="2xl"
    >
      <FormBuilder<AddOrganisationForm>
        formConfig={formConfig}
        onSubmit={onSubmit}
        isLoading={isLoading}
        scrollable={true}
        defaultValues={{
          name: "",
          email: "",
          password: "",
          walletAddress: "",
          entityType: INITIAL_ENTITY_TYPE,
          registrationNumber: "",
          jurisdiction: "",
          incorporationDate: "",
        }}
      />
    </CustomModal>
  );
};

export default AddOrganisationModal;
