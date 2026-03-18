"use client";

import { ReactNode } from "react";
import {
  DefaultValues,
  FieldValues,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";

import Button from "@/components/atoms/Button";

import RenderField from "./RenderField";
// Types
import { FormConfig } from "./types";

interface FormBuilderProps<T extends FieldValues> {
  formConfig: FormConfig<T>;
  onSubmit: SubmitHandler<T>;
  submitText?: string;
  className?: string;
  isLoading?: boolean;
  defaultValues?: DefaultValues<T>;
  scrollable?: boolean;
  secondaryAction?: ReactNode;
  onSecondaryAction?: () => void;
  additionalAction?: ReactNode;
  onAdditionalAction?: () => void;
  numberOfCols?: number;
  isLoginVariant?: boolean;
}

const loginButtonStyle: React.CSSProperties = {
  background: "#c7fe1e",
  boxShadow: "0 3px 18px rgba(199, 254, 30, .4)",
  color: "black",
};

function FormBuilder<T extends FieldValues>({
  formConfig,
  onSubmit,
  submitText = "Submit",
  className = "",
  isLoading = false,
  defaultValues,
  scrollable = false,
  secondaryAction,
  onSecondaryAction,
  additionalAction,
  onAdditionalAction,
  isLoginVariant = false,
}: Readonly<FormBuilderProps<T>>) {
  const methods = useForm<T>({ defaultValues });

  return (
    <div className={isLoginVariant ? "w-full max-w-[500px] mx-auto" : ""}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
          <div
            className={
              scrollable ? "max-h-[60vh] overflow-y-auto pr-2 pl-[3px]" : ""
            }
          >
            <div className={`flex flex-wrap gap-x-2 justify-between`}>
              {(Array.isArray(formConfig)
                ? formConfig
                : formConfig(methods)
              )?.map((field) => {
                return <RenderField field={field} key={field.name} />;
              })}
            </div>
            <div className="flex items-center justify-between mb-4">
              {secondaryAction && (
                <button
                  type="button"
                  className="inline-flex items-center justify-center font-medium rounded-md
                  text-base px-4 py-2 w-full border border-primarycolor text-primarycolor hover:opacity-50"
                  onClick={onSecondaryAction}
                >
                  {secondaryAction}
                </button>
              )}

              {additionalAction && (
                <button
                  type="button"
                  className="inline-flex items-center justify-center font-medium rounded-md
                  text-base px-4 py-2 w-full border border-primarycolor text-primarycolor"
                  onClick={onAdditionalAction}
                >
                  {additionalAction}
                </button>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isLoading}
            className={
              isLoginVariant
                ? "hover:-translate-y-px transition-all duration-150"
                : ""
            }
            style={isLoginVariant ? loginButtonStyle : undefined}
          >
            {submitText}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}

export default FormBuilder;
