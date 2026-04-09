"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Button from "@/components/atoms/Button";
import CustomModal from "@/components/molecules/CustomModal/CustomModal";
import DateField from "@/components/molecules/FormBuilder/fields/DateField";
import { InputField } from "@/components/molecules/FormBuilder/fields/InputField";
import { rentalIncomeService } from "@/services/rental-income-service";
import { fromBaseUnits, toBaseUnitsBigInt } from "@/shared/utils/unitUtils";
import { RentalIncomeListItem } from "@/types/rental-income";

type RentalIncomeFormValues = {
  fromDate: string;
  toDate: string;
  amountReceived: string;
  maintenanceCharges: string;
  otherCharges: string;
};

export const RentalIncomeModal = ({
  open,
  onClose,
  onSuccess,
  property,
  mode = "create",
  rentalIncome,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  property: { id: string } | null;
  mode?: "create" | "edit";
  rentalIncome?: RentalIncomeListItem | null;
}) => {
  const t = useTranslations("properties");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<RentalIncomeFormValues>({
    defaultValues: {
      fromDate: "",
      toDate: "",
      amountReceived: "",
      maintenanceCharges: "0",
      otherCharges: "0",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!open) return;
    if (mode !== "edit" || !rentalIncome) {
      methods.reset({
        fromDate: "",
        toDate: "",
        amountReceived: "",
        maintenanceCharges: "0",
        otherCharges: "0",
      });
      return;
    }

    methods.reset({
      fromDate: rentalIncome.fromDate ? rentalIncome.fromDate.slice(0, 10) : "",
      toDate: rentalIncome.toDate ? rentalIncome.toDate.slice(0, 10) : "",
      amountReceived: String(fromBaseUnits(rentalIncome.amountReceived ?? 0)),
      maintenanceCharges: String(
        fromBaseUnits(rentalIncome.maintenanceCharges ?? 0),
      ),
      otherCharges: String(fromBaseUnits(rentalIncome.otherCharges ?? 0)),
    });
  }, [methods, mode, open, rentalIncome]);

  const onSubmit: SubmitHandler<RentalIncomeFormValues> = async (values) => {
    if (!property) return;

    setIsSubmitting(true);
    try {
      if (mode === "edit") {
        if (!rentalIncome?.id) {
          throw new Error(t("rentManagement.editMissingFields"));
        }
        await rentalIncomeService.updateRentalIncome({
          rentalIncomeId: rentalIncome.id,
          fromDate: new Date(values.fromDate).toISOString(),
          toDate: new Date(values.toDate).toISOString(),
          amountReceived: toBaseUnitsBigInt(values.amountReceived).toString(),
          maintenanceCharges: toBaseUnitsBigInt(
            values.maintenanceCharges,
          ).toString(),
          otherCharges: toBaseUnitsBigInt(values.otherCharges).toString(),
        });
      } else {
        await rentalIncomeService.submitRentalIncome({
          propertyId: property.id,
          fromDate: new Date(values.fromDate).toISOString(),
          toDate: new Date(values.toDate).toISOString(),
          amountReceived: toBaseUnitsBigInt(values.amountReceived).toString(),
          maintenanceCharges: toBaseUnitsBigInt(
            values.maintenanceCharges,
          ).toString(),
          otherCharges: toBaseUnitsBigInt(values.otherCharges).toString(),
        });
      }

      toast.success(
        mode === "edit"
          ? t("rentManagement.editSuccess")
          : t("rentalIncome.form.success"),
      );
      onSuccess?.();
      onClose();
      methods.reset();
    } catch (error) {
      console.error("[RentalIncomeModal] Submission failed", error);
      toast.error(
        mode === "edit"
          ? t("rentManagement.editError")
          : t("rentalIncome.form.error"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const preventNegativeAndExponent: React.KeyboardEventHandler<
    HTMLInputElement
  > = (e) => {
    if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
      e.preventDefault();
    }
  };

  const sanitizeNumericInput = (val: string) => {
    return val.replace(/[^-0-9.]/g, "").replace(/(\..*)\./g, "$1");
  };

  const fromDate = methods.watch("fromDate");
  const toDate = methods.watch("toDate");

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      title={
        mode === "edit"
          ? t("rentManagement.editTitle")
          : t("rentalIncome.form.title")
      }
      size="2xl"
    >
      <div className="relative">
        <p className="text-sm text-textparagraph dark:text-textparagraphlight mb-6">
          {t("rentalIncome.form.subtitle")}
        </p>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-wrap gap-x-3 justify-between">
              <DateField<RentalIncomeFormValues>
                name="fromDate"
                label={t("rentalIncome.form.fromDate")}
                width="w-full md:w-[48%]"
                validation={{
                  required: t("rentalIncome.form.validation.fromDateRequired"),
                  validate: (val) => {
                    if (toDate && new Date(val) > new Date(toDate)) {
                      return t("rentalIncome.form.validation.dateRangeInvalid");
                    }
                    return true;
                  },
                }}
              />

              <DateField<RentalIncomeFormValues>
                name="toDate"
                label={t("rentalIncome.form.toDate")}
                width="w-full md:w-[48%]"
                validation={{
                  required: t("rentalIncome.form.validation.toDateRequired"),
                  validate: (val) => {
                    if (fromDate && new Date(val) < new Date(fromDate)) {
                      return t("rentalIncome.form.validation.dateRangeInvalid");
                    }
                    return true;
                  },
                }}
              />
            </div>

            <div className="flex flex-wrap gap-x-3 justify-between mt-2">
              <InputField<RentalIncomeFormValues>
                name="amountReceived"
                type="number"
                label={t("rentalIncome.form.amountReceived")}
                width="w-full !mb-4"
                onKeyDown={preventNegativeAndExponent}
                interceptor={sanitizeNumericInput}
                validation={{
                  required: t("rentalIncome.form.validation.amountRequired"),
                  min: {
                    value: 0.000001,
                    message: t("rentalIncome.form.validation.amountMin"),
                  },
                }}
              />
            </div>

            <div className="flex flex-wrap gap-x-3 justify-between">
              <InputField<RentalIncomeFormValues>
                name="maintenanceCharges"
                type="number"
                label={t("rentalIncome.form.maintenanceCharges")}
                width="w-full md:w-[48%] !mb-4"
                onKeyDown={preventNegativeAndExponent}
                interceptor={sanitizeNumericInput}
                validation={{
                  required: t(
                    "rentalIncome.form.validation.maintenanceRequired",
                  ),
                  min: {
                    value: 0,
                    message: t("rentalIncome.form.validation.amountMin"),
                  },
                }}
              />

              <InputField<RentalIncomeFormValues>
                name="otherCharges"
                type="number"
                label={t("rentalIncome.form.otherCharges")}
                width="w-full md:w-[48%] !mb-4"
                onKeyDown={preventNegativeAndExponent}
                interceptor={sanitizeNumericInput}
                validation={{
                  required: t("rentalIncome.form.validation.otherRequired"),
                  min: {
                    value: 0,
                    message: t("rentalIncome.form.validation.amountMin"),
                  },
                }}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="min-w-[110px]"
                disabled={isSubmitting}
              >
                {t("rentalIncome.form.cancel")}
              </Button>
              <Button
                type="submit"
                className="min-w-[140px]"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {mode === "edit"
                  ? t("rentManagement.editButton")
                  : t("rentalIncome.form.submit")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </CustomModal>
  );
};
