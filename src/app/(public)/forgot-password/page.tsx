"use client";
import { forgotPassowrdAction } from "@/api/auth";
import { chevronLogo } from "@/assets";
import FormLayout from "@/components/layouts/FormLayout";
import { FormLayoutType } from "@/components/layouts/FormLayout/helpers/constants";
import FormBuilder from "@/components/molecules/FormBuilder";
import { getRequiredFieldMessage } from "@/components/molecules/FormBuilder/helpers/utils";
import { FormConfig } from "@/components/molecules/FormBuilder/types";
import { ROUTES } from "@/shared/routes";
import { FIELD_NAMES, REGEX, STRING } from "@/shared/strings";
import { redirect } from "next/dist/client/components/navigation";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "react-toastify";

interface ForgotPasswordFormValues {
  email: string;
}
const config: FormConfig<ForgotPasswordFormValues> = [
  {
    name: FIELD_NAMES.EMAIL,
    label: STRING.EMAIL,
    type: FIELD_NAMES.EMAIL,
    placeholder: "john.doe@example.com",
    validation: {
      required: getRequiredFieldMessage(STRING.EMAIL),
      pattern: {
        value: REGEX.EMAIL,
        message: "Invalid email format",
      },
    },
  },
];
const ForgotPassword = () => {
  const [isLoading, startTransition] = useTransition();

  const handleSubmit = async (data: ForgotPasswordFormValues) => {
    startTransition(async () => {
      const res = await forgotPassowrdAction(data);
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
      <h4 className="mb-1">Forgot Password? 🔒</h4>
      <p className="mb-6">
        Enter your email and we&apos;ll send you instructions to reset your
        password
      </p>
      <FormBuilder<ForgotPasswordFormValues>
        formConfig={config}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        secondaryAction={
          <Link
            href={ROUTES.LOGIN}
            className="text-bgblack dark:text-bgwhite hover:underline flex items-center justify-center gap-[6px]"
          >
            <Image
              src={chevronLogo}
              width={20}
              height={20}
              alt="chevron-left"
              className="text-bgblack !dark:text-bgwhite"
            />
            Back to Login
          </Link>
        }
      />
    </FormLayout>
  );
};

export default ForgotPassword;
