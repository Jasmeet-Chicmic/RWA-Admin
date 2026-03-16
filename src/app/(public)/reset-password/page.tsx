"use client";
import { resetPassowordAction } from "@/api/auth";
import FormLayout from "@/components/layouts/FormLayout";
import { FormLayoutType } from "@/components/layouts/FormLayout/helpers/constants";
import FormBuilder from "@/components/molecules/FormBuilder";
import { getRequiredFieldMessage } from "@/components/molecules/FormBuilder/helpers/utils";
import { FormConfig } from "@/components/molecules/FormBuilder/types";
import { ROUTES } from "@/shared/routes";
import { FIELD_NAMES, REGEX, STRING } from "@/shared/strings";
import { redirect, useSearchParams } from "next/navigation";
import { Suspense, useTransition } from "react";
import { toast } from "react-toastify";
interface ResetPasswordFormValues {
  password: string;
}
const config: FormConfig<ResetPasswordFormValues> = [
  {
    name: FIELD_NAMES.PASSWORD,
    label: STRING.PASSWORD,
    type: FIELD_NAMES.PASSWORD,
    placeholder: "••••••••",
    validation: {
      required: getRequiredFieldMessage(STRING.PASSWORD),
      pattern: {
        value: REGEX.STRONG_PASSWORD,
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    },
  },
];
const ResetPassword = () => {
  const [isLoading, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  if (!token) {
    toast.error("Invalid or missing reset password token.");
    redirect(ROUTES.LOGIN);
  }
  const handleSubmit = async (data: ResetPasswordFormValues) => {
    startTransition(async () => {
      const res = await resetPassowordAction({
        password: data.password || "",
        resetPasswordToken: token,
      });
      if (res?.status) {
        toast.success(res.message);
        redirect(ROUTES.LOGIN);
      } else {
        toast.error(res.message);
      }
    });
  };
  return (
    <FormLayout layout={FormLayoutType.WithCover}>
      <h2 className="text-2xl font-semibold text-center mb-6 textbgblack">
        Reset Password
      </h2>
      <FormBuilder<ResetPasswordFormValues>
        formConfig={config}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </FormLayout>
  );
};
const ResetPasswordForm = () => {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
};
export default ResetPasswordForm;
