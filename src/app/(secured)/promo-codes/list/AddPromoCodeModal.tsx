"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "react-toastify";
import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import {
  createAdminPromoCodeAction,
  updateAdminPromoCodeAction,
} from "@/api/promoCodes";
import CustomModal from "@/components/molecules/CustomModal";
import FormBuilder from "@/components/molecules/FormBuilder";
import { FormConfig } from "@/components/molecules/FormBuilder/types";
import { getRequiredFieldMessage } from "@/components/molecules/FormBuilder/helpers/utils";
import { PromoCode } from "@/shared/types";
import {
  FORM_FIELDS_TYPES,
  PROMO_DISCOUNT_TYPE,
  PROMO_DURATION,
} from "@/shared/constants";
import { getNextDayDateString } from "@/shared/utils";

type PromoCodeForm = {
  code: string;
  description: string;
  discountType: PROMO_DISCOUNT_TYPE;
  discountValue: number;
  duration: PROMO_DURATION;
  durationInMonths?: number | null;
  validFrom: string;
  validUntil?: string | null;
  maxRedemptions: number;
  isActive: boolean;
};

const AddPromoCodeModal = ({
  open,
  setOpen,
  promoCode,
  setSelectedPromoCode,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  promoCode?: PromoCode;
  setSelectedPromoCode: (promoCode?: PromoCode) => void;
}) => {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("promoCodes");
  const tCommon = useTranslations("common");

  const formConfig: FormConfig<PromoCodeForm> = (
    methods: UseFormReturn<PromoCodeForm>,
  ) => {
    const duration = methods.watch("duration");
    const validFrom = methods.watch("validFrom");

    // Disable code field in edit mode
    const isEditMode = !!promoCode?.id;

    const fields = [
      {
        name: "code" as const,
        label: t("code"),
        type: FORM_FIELDS_TYPES.TEXT,
        disabled: isEditMode, // Disable code field in edit mode
        validation: {
          required: getRequiredFieldMessage(t("code"), tCommon),
        },
      },
      {
        name: "description" as const,
        label: t("description"),
        type: FORM_FIELDS_TYPES.TEXTAREA,
      },
      {
        name: "discountType" as const,
        label: t("discountType"),
        type: FORM_FIELDS_TYPES.SELECT,
        disabled: isEditMode, // Disable in edit mode
        options: [
          { label: t("percentage"), value: PROMO_DISCOUNT_TYPE.PERCENTAGE },
          { label: t("fixedAmount"), value: PROMO_DISCOUNT_TYPE.FIXED_AMOUNT },
        ],
        validation: {
          required: getRequiredFieldMessage(t("discountType"), tCommon),
        },
      },
      {
        name: "discountValue" as const,
        label: t("discountValue"),
        type: FORM_FIELDS_TYPES.NUMBER,
        min: 0,
        disabled: isEditMode, // Disable in edit mode
        validation: {
          required: getRequiredFieldMessage(t("discountValue"), tCommon),
          min: {
            value: 1,
            message: t("discountValueMustBeGreaterThan0"),
          },
        },
      },
      {
        name: "duration" as const,
        label: t("duration"),
        type: FORM_FIELDS_TYPES.SELECT,
        disabled: isEditMode, // Disable in edit mode
        options: [
          { label: t("once"), value: PROMO_DURATION.ONCE },
          { label: t("repeating"), value: PROMO_DURATION.REPEATING },
          { label: t("forever"), value: PROMO_DURATION.FOREVER },
        ],
        validation: {
          required: getRequiredFieldMessage(t("duration"), tCommon),
        },
      },
      // Show durationInMonths for REPEATING and FOREVER, but not for ONCE
      ...(duration === PROMO_DURATION.REPEATING ||
      duration === PROMO_DURATION.FOREVER
        ? [
            {
              name: "durationInMonths" as const,
              label: t("durationInMonths"),
              type: FORM_FIELDS_TYPES.NUMBER,
              placeholder: t("onlyRequiredForRepeatingDuration"),
              min: 0,
              disabled: isEditMode, // Disable in edit mode
              validation: {
                min: {
                  value: 1,
                  message: t("durationInMonthsMustBeGreaterThan0"),
                },
              },
            },
          ]
        : []),
      {
        name: "validFrom" as const,
        label: t("validFrom"),
        type: FORM_FIELDS_TYPES.DATE,
        returnISOFormat: true,
        validation: {
          required: getRequiredFieldMessage(t("validFrom"), tCommon),
        },
      },
      {
        name: "validUntil" as const,
        label: t("validUntil"),
        type: FORM_FIELDS_TYPES.DATE,
        returnISOFormat: true,
        disabled: !validFrom,
        min: getNextDayDateString(validFrom),
      },
      {
        name: "maxRedemptions" as const,
        label: t("maxRedemptions"),
        type: FORM_FIELDS_TYPES.NUMBER,
        min: 0,
        disabled: isEditMode, // Disable in edit mode
        validation: {
          required: getRequiredFieldMessage(t("maxRedemptions"), tCommon),
          min: {
            value: 1,
            message: t("maxRedemptionsMustBeGreaterThan0"),
          },
        },
      },
      {
        name: "isActive" as const,
        label: t("isActive"),
        type: FORM_FIELDS_TYPES.SWITCH,
      },
    ];

    return fields;
  };

  const onSubmit = (data: PromoCodeForm) => {
    startTransition(async () => {
      if (promoCode?.id) {
        // In edit mode, only send editable fields
        const res = await updateAdminPromoCodeAction({
          id: promoCode.id || (promoCode._id as string),
          description: data.description,
          validFrom: data.validFrom,
          validUntil: data.validUntil ?? null,
          isActive: data.isActive,
        });
        if (res.success && res.statusCode === 200) {
          toast.success(
            res.message ||
              tCommon("{entity} {action} successfully", {
                entity: t("promoCode"),
                action: tCommon("updated"),
              }),
          );
          console.log("response of update promo code", res);
          setOpen(false);
          setSelectedPromoCode(res.data as PromoCode);
          router.refresh();
        } else {
          console.log("error of update promo code", res);
          toast.error(
            res.message ||
              tCommon("Failed to {action} {entity}", {
                action: tCommon("update"),
                entity: t("promoCode").toLowerCase(),
              }),
          );
        }
      } else {
        const durationInMonths =
          data.duration === PROMO_DURATION.ONCE
            ? 0
            : Number(data.durationInMonths || 0);

        const res = await createAdminPromoCodeAction({
          code: data.code,
          description: data.description,
          discountType: data.discountType,
          discountValue: Number(data.discountValue),
          currency: "GBP",
          duration: data.duration,
          durationInMonths,
          validFrom: data.validFrom,
          validUntil: data.validUntil ?? null,
          maxRedemptions: Number(data.maxRedemptions),
        });
        if (res.statusCode === 200) {
          toast.success(
            res.message ||
              tCommon("{entity} {action} successfully", {
                entity: t("promoCode"),
                action: tCommon("created"),
              }),
          );
          console.log("response of create promo code", res);
          setOpen(false);
          setSelectedPromoCode(res.data as unknown as PromoCode);
          router.refresh();
        } else {
          console.log("error of create promo code", res);
          toast.error(
            res.message ||
              tCommon("Failed to {action} {entity}", {
                action: tCommon("create"),
                entity: t("promoCode").toLowerCase(),
              }),
          );
        }
      }
    });
  };
  return (
    <CustomModal
      isOpen={open}
      onClose={() => {
        setOpen(false);
        setSelectedPromoCode(undefined);
      }}
      title={promoCode?.id ? t("editPromoCode") : t("addPromoCode")}
      size="2xl"
    >
      <FormBuilder<PromoCodeForm>
        formConfig={formConfig}
        onSubmit={onSubmit}
        isLoading={isLoading}
        scrollable={true}
        defaultValues={{
          code: promoCode?.code || "",
          description: promoCode?.description || "",
          discountType:
            (promoCode?.discountType as PROMO_DISCOUNT_TYPE) ??
            PROMO_DISCOUNT_TYPE.PERCENTAGE,
          discountValue: promoCode?.discountValue ?? 0,
          duration:
            (promoCode?.duration as PROMO_DURATION) ?? PROMO_DURATION.ONCE,
          durationInMonths: promoCode?.durationInMonths ?? 0,
          validFrom: promoCode?.validFrom || "",
          validUntil: promoCode?.validUntil || null,
          maxRedemptions: promoCode?.maxRedemptions ?? 0,
          isActive: promoCode?.isActive ?? true,
        }}
      />
    </CustomModal>
  );
};

export default AddPromoCodeModal;
