"use client";

import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import FormBuilder from "@/components/molecules/FormBuilder";
import { getRequiredFieldMessage } from "@/components/molecules/FormBuilder/helpers/utils";
import { FormConfig } from "@/components/molecules/FormBuilder/types";
import { LOGIN_ROLE } from "@/shared/constants";
import { FIELD_NAMES, REGEX } from "@/shared/strings";
import { handleWeb3Error } from "@/shared/utils/web3Error";
import { requestLoginNonceThunk } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export interface LoginFormValues {
  email: string;
  password: string;
}

type LoginFormStepProps = {
  onNonceToken: (payload: {
    nonce: string;
    tempToken: string;
    message?: string;
  }) => void;
  role: LOGIN_ROLE;
};

const LoginFormStep = ({ onNonceToken, role }: LoginFormStepProps) => {
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.authFlow.loginNonceLoading);
  const formConfig: FormConfig<LoginFormValues> = [
    {
      name: FIELD_NAMES.EMAIL,
      label: tCommon("login.form.emailLabel"),
      type: FIELD_NAMES.EMAIL,
      placeholder: tCommon("login.form.emailPlaceholder"),
      validation: {
        required: getRequiredFieldMessage(tCommon("login.form.emailLabel")),
        pattern: {
          value: REGEX.EMAIL,
          message: tCommon("login.form.invalidEmail"),
        },
      },
    },
    {
      name: FIELD_NAMES.PASSWORD,
      label: tCommon("login.form.passwordLabel"),
      type: FIELD_NAMES.PASSWORD,
      placeholder: tCommon("login.form.passwordPlaceholder"),
    },
  ];

  const handleSubmit = async (data: LoginFormValues) => {
    try {
      const res = await dispatch(
        requestLoginNonceThunk({
          role,
          email: data.email,
          password: data.password,
        }),
      ).unwrap();

      console.log("🔥 Login nonce response:", res);

      if (
        res.status &&
        res.statusCode === 200 &&
        res.data?.nonce &&
        res.data?.token
      ) {
        onNonceToken({
          nonce: res.data.nonce,
          tempToken: res.data.token,
          message: res.message,
        });
        // toast.success(res.message || "Nonce generated successfully.");
      } else {
        toast.error(res.message || tCommon("login.form.loginFailed"));
      }
    } catch (error) {
      console.error("🔥 Login API error:", error);
      if (typeof error === "string" && error.trim()) {
        toast.error(error);
        return;
      }
      toast.error(handleWeb3Error(error));
    }
  };

  return (
    <>
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-white/60">
        {tCommon("login.stepCredentialsLabel")}
      </p>
      <p className="mb-6 text-white/85">
        {role === LOGIN_ROLE.ADMIN
          ? tCommon("login.form.adminSubtitle")
          : tCommon("login.form.organisationSubtitle")}
      </p>
      <FormBuilder<LoginFormValues>
        formConfig={formConfig}
        onSubmit={handleSubmit}
        submitText={tCommon("login.form.submit")}
        isLoading={isLoading}
        className="mb-0"
        isLoginVariant={true}
      />
    </>
  );
};

export default LoginFormStep;
