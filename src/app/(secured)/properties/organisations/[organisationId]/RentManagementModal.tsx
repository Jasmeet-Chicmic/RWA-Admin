"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
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
                      label="Rent Amount (₹)"
                      placeholder="e.g. 100000"
                      width="w-full md:w-[48%] !mb-0"
                      validation={{ required: "Rent amount is required" }}
                    />

                    <InputField<RentManagementFormValues>
                      name="maintenanceCharges"
                      type="number"
                      label="Maintenance Charges (₹)"
                      placeholder="e.g. 15000"
                      width="w-full md:w-[48%] !mb-0"
                      validation={{
                        required: "Maintenance charges are required",
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-x-3 justify-between">
                    <InputField<RentManagementFormValues>
                      name="otherExpenses"
                      type="number"
                      label="Other Expenses (Optional, ₹)"
                      placeholder="e.g. 5000"
                      width="w-full md:w-[48%] !mb-0"
                    />

                    <InputField<RentManagementFormValues>
                      name="month"
                      type="text"
                      label="Month"
                      placeholder="e.g. April 2026"
                      width="w-full md:w-[48%] !mb-0"
                      validation={{ required: "Month is required" }}
                    />
                  </div>

                  <div className="w-full">
                    <InputField<RentManagementFormValues>
                      name="notes"
                      type="text"
                      label="Notes (Optional)"
                      placeholder="Any additional notes"
                      width="w-full !mb-0"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="min-w-[110px]"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="min-w-[140px]">
                    Save
                  </Button>
                </div>
              </form>
            </FormProvider>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-gray-100 p-6 text-textprimary border border-bordergray200 dark:bg-darkbgbase dark:text-sidebartext dark:border-darkbordercolor1">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 dark:bg-darkbgprimary">
                    <Sparkles className="h-4 w-4" />
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
                  className="min-w-[110px]"
                >
                  Edit Data
                </Button>
                <Button
                  type="button"
                  onClick={handleDistribute}
                  className="min-w-[140px]"
                >
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
                  className="min-w-[110px]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={confirmDistribution}
                  className="min-w-[170px]"
                >
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
