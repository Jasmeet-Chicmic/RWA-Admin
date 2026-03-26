"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import FormBuilder from "@/components/molecules/FormBuilder";
import { getRequiredFieldMessage } from "@/components/molecules/FormBuilder/helpers/utils";
import { FormConfig } from "@/components/molecules/FormBuilder/types";
import { postApiJson } from "@/shared/clientApi";
import { INTERNAL_API_PATHS } from "@/shared/api";
import { FIELD_NAMES, REGEX, STRING } from "@/shared/strings";
import { handleWeb3Error } from "@/shared/utils/web3Error";
import { LOGIN_ROLE } from "@/shared/constants";

export interface LoginFormValues {
  email: string;
  password: string;
}

const config: FormConfig<LoginFormValues> = [
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
  {
    name: FIELD_NAMES.PASSWORD,
    label: STRING.PASSWORD,
    type: FIELD_NAMES.PASSWORD,
    placeholder: "••••••••",
  },
];

const LOGIN_API_MAP = {
  [LOGIN_ROLE.ADMIN]: INTERNAL_API_PATHS.ADMIN_AUTH_LOGIN,
  [LOGIN_ROLE.ORGANISATION]: INTERNAL_API_PATHS.ORG_AUTH_LOGIN,
} as const;

const LOGIN_SUBTITLE_MAP = {
  [LOGIN_ROLE.ADMIN]: "Please sign in to your Admin account",
  [LOGIN_ROLE.ORGANISATION]: "Please sign in to your Organisation account",
} as const;

type LoginFormStepProps = {
  onNonceToken: (payload: {
    nonce: string;
    tempToken: string;
    message?: string;
  }) => void;
  role: LOGIN_ROLE;
};

const LoginFormStep = ({ onNonceToken, role }: LoginFormStepProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);

      const loginEndpoint = LOGIN_API_MAP[role];

      const res = await postApiJson<
        {
          statusCode?: number;
          status?: boolean;
          message?: string;
          data?: {
            nonce?: string;
            token?: string;
          };
        },
        { email: string; password: string }
      >(loginEndpoint, {
        email: data.email,
        password: data.password,
      });

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
        toast.success(res.message || "Nonce generated successfully.");
      } else {
        toast.error(
          res.message || "Login failed. Please check your credentials.",
        );
      }
    } catch (error) {
      console.error("🔥 Login API error:", error);
      toast.error(handleWeb3Error(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <p className="mb-6">{LOGIN_SUBTITLE_MAP[role]}</p>
      <FormBuilder<LoginFormValues>
        formConfig={config}
        onSubmit={handleSubmit}
        submitText="Login"
        isLoading={isLoading}
        className="mb-0"
        isLoginVariant={true}
      />
    </>
  );
};

export default LoginFormStep;
