"use client";

import {
  CheckCircle2,
  Sparkles,
  Pencil,
  Save,
  X,
  HandCoins,
} from "lucide-react";
import { useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Button from "@/components/atoms/Button";
import CustomModal from "@/components/molecules/CustomModal/CustomModal";
import { InputField } from "@/components/molecules/FormBuilder/fields/InputField";
import { AdminProperty, PropertyItem } from "@/types/properties";

type RentManagementFormValues = {
  rentAmount: string;
  maintenanceCharges: string;
  otherExpenses: string;
  month: string;
  notes: string;
};

type PropertyData = PropertyItem | AdminProperty;

export const RentManagementModal = ({
  open,
  onClose,
  property,
}: {
  open: boolean;
  onClose: () => void;
  property: PropertyData | null;
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [savedData, setSavedData] = useState<RentManagementFormValues | null>(
    null,
  );

  const currencyUnit = "USDC";
  const methods = useForm<RentManagementFormValues>({
    defaultValues: {
      rentAmount: "",
      maintenanceCharges: "",
      otherExpenses: "",
      month: "April 2026",
      notes: "",
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<RentManagementFormValues> = (values) => {
    setSavedData(values);
    setIsSaved(true);
    toast.success("Rent data saved successfully.");
  };

  const handleDistribute = () => {
    setIsDistributeModalOpen(true);
  };

  const confirmDistribution = () => {
    toast.success("Rent distributed successfully to all investors.");
    setIsDistributeModalOpen(false);
    onClose();
  };

  const handleClose = () => {
    setIsSaved(false);
    setSavedData(null);
    methods.reset();
    onClose();
  };

  if (!property) return null;

  const rentAmountVal = Number(savedData?.rentAmount) || 0;
  const maintenanceVal = Number(savedData?.maintenanceCharges) || 0;
  const otherExpensesVal = Number(savedData?.otherExpenses) || 0;

  const totalExpenses = maintenanceVal + otherExpensesVal;
  const netDistributable = rentAmountVal - totalExpenses;

  return (
    <>
      <CustomModal
        isOpen={open}
        onClose={handleClose}
        title="Rent Management"
        size="2xl"
      >
        <div className="relative">
          <p className="text-sm text-textparagraph dark:text-textparagraphlight mb-6">
            Add and distribute monthly rent for {property.name}.
          </p>

          {!isSaved ? (
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-x-3 justify-between">
                    <InputField<RentManagementFormValues>
                      name="rentAmount"
                      type="number"
                      label={`Rent Amount (${currencyUnit})`}
                      placeholder="e.g. 100000"
                      width="w-full md:w-[48%] !mb-0"
                      validation={{
                        required: "Rent amount is required",
                        validate: (val) => {
                          const n = Number(val);
                          if (!Number.isFinite(n) || n <= 0)
                            return "Rent amount must be greater than 0";
                          return true;
                        },
                      }}
                    />

                    <InputField<RentManagementFormValues>
                      name="maintenanceCharges"
                      type="number"
                      label={`Maintenance Charges (${currencyUnit})`}
                      placeholder="e.g. 15000"
                      width="w-full md:w-[48%] !mb-0"
                      validation={{
                        required: "Maintenance charges are required",
                        validate: (val) => {
                          const n = Number(val);
                          const other =
                            Number(methods.getValues("otherExpenses")) || 0;
                          const rent =
                            Number(methods.getValues("rentAmount")) || 0;
                          if (!Number.isFinite(n) || n < 0)
                            return "Maintenance charges cannot be negative";
                          if (n + other > rent)
                            return "Total Expenses or (Total Expenses + Other Expenses) cannot exceed Rent Amount";
                          return true;
                        },
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-x-3 justify-between">
                    <InputField<RentManagementFormValues>
                      name="otherExpenses"
                      type="number"
                      label={`Other Expenses (${currencyUnit}), Optional`}
                      placeholder="e.g. 5000"
                      width="w-full md:w-[48%] !mb-0"
                      validation={{
                        validate: (val) => {
                          if (!val) return true;
                          const maintenance =
                            Number(methods.getValues("maintenanceCharges")) ||
                            0;
                          const rent =
                            Number(methods.getValues("rentAmount")) || 0;
                          const n = Number(val);
                          if (!Number.isFinite(n) || n < 0)
                            return "Other expenses cannot be negative";
                          if (n + maintenance > rent)
                            return "Other Expenses or (Total Expenses + Other Expenses) cannot exceed Rent Amount";
                          return true;
                        },
                      }}
                    />

                    <InputField<RentManagementFormValues>
                      name="month"
                      type="month"
                      label="Month"
                      placeholder="e.g. April 2026"
                      width="w-full md:w-[48%] !mb-0"
                      validation={{
                        required: "Month is required",
                      }}
                      onKeyDown={(e) => e.preventDefault()}
                    />
                  </div>

                  <div className="w-full relative pb-5">
                    <InputField<RentManagementFormValues>
                      name="notes"
                      type="text"
                      label="Notes (Optional)"
                      placeholder="Any additional notes"
                      width="w-full !mb-0"
                      validation={{
                        maxLength: {
                          value: 500,
                          message: "Notes cannot exceed 500 characters",
                        },
                      }}
                    />
                    <div className="absolute bottom-0 right-0 text-[10px] sm:text-xs text-textparagraph dark:text-textparagraphlight mt-1">
                      {(methods.watch("notes") || "").length}/500
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="min-w-[110px] flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="min-w-[140px] flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </div>
              </form>
            </FormProvider>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-textprimary border border-bordergray200 shadow-sm dark:from-[#151515] dark:to-[#1A1A1A] dark:text-sidebartext dark:border-darkbordercolor1">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-bordergray200 dark:bg-darkbgprimary dark:border-darkbordercolor1">
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold">
                      Auto Calculated Summary
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Rent:</span>
                        <span className="text-sm font-semibold">
                          ₹{rentAmountVal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-red-500">
                        <span className="text-sm">Expenses:</span>
                        <span className="text-sm font-semibold">
                          - ₹{totalExpenses.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-px bg-bordergray200 dark:bg-darkbordercolor1 my-1" />
                      <div className="flex justify-between mt-1 text-emerald-600 dark:text-emerald-400">
                        <span className="text-base font-bold">
                          Net Distributable:
                        </span>
                        <span className="text-xl font-bold">
                          ₹{netDistributable.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSaved(false)}
                  className="min-w-[110px] flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Data
                </Button>
                <Button
                  type="button"
                  onClick={handleDistribute}
                  className="min-w-[150px] flex items-center justify-center gap-2"
                >
                  <HandCoins className="w-4 h-4" />
                  Distribute Rent
                </Button>
              </div>
            </div>
          )}

          <CustomModal
            isOpen={isDistributeModalOpen}
            onClose={() => setIsDistributeModalOpen(false)}
            title="Confirm Distribution"
            size="md"
          >
            <div className="flex flex-col gap-4">
              <p className="text-sm text-textparagraph dark:text-textparagraphlight">
                You are about to distribute{" "}
                <span className="font-bold text-textprimary dark:text-white">
                  ₹{netDistributable.toLocaleString()}
                </span>
              </p>
              <div className="p-4 rounded-xl border border-bordergray200 bg-gray-50 dark:bg-[#1A1A1A] dark:border-darkbordercolor1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-semibold text-textprimary dark:text-white">
                    Total Investors: 124
                  </span>
                </div>
                <p className="text-xs text-red-500 font-medium">
                  This action cannot be undone.
                </p>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDistributeModalOpen(false)}
                  className="min-w-[110px] flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={confirmDistribution}
                  className="min-w-[180px] flex items-center justify-center gap-2"
                >
                  <HandCoins className="w-4 h-4" />
                  Confirm Distribution
                </Button>
              </div>
            </div>
          </CustomModal>
        </div>
      </CustomModal>
    </>
  );
};
