"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTheme } from "next-themes";
import { RayptoLogo, RayptoLogoDark, logoSrt } from "@/assets";
import { loginAction } from "@/api/auth";
import FormLayout from "@/components/layouts/FormLayout";
import { FormLayoutType } from "@/components/layouts/FormLayout/helpers/constants";
import FormBuilder from "@/components/molecules/FormBuilder";
import { getRequiredFieldMessage } from "@/components/molecules/FormBuilder/helpers/utils";
import { FormConfig } from "@/components/molecules/FormBuilder/types";
import { ROUTES } from "@/shared/routes";
import { FIELD_NAMES, REGEX, STRING } from "@/shared/strings";
import { THEME_TYPE } from "@/shared/constants";
import { createSessionClient } from "@/shared/utils";

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

const blobBase: React.CSSProperties = {
  position: "fixed",
  borderRadius: "50%",
  pointerEvents: "none",
  zIndex: 0,
};

const blobTopLeft: React.CSSProperties = {
  ...blobBase,
  width: 560,
  height: 560,
  top: -160,
  left: -160,
  background:
    "radial-gradient(circle, rgba(217,112,64,0.20) 0%, rgba(181,84,28,0.08) 50%, transparent 70%)",
};

const blobBottomRight: React.CSSProperties = {
  ...blobBase,
  width: 460,
  height: 460,
  bottom: -100,
  right: -120,
  background:
    "radial-gradient(circle, rgba(181,84,28,0.15) 0%, rgba(217,112,64,0.06) 50%, transparent 70%)",
};

const blobBottomLeft: React.CSSProperties = {
  ...blobBase,
  width: 260,
  height: 260,
  bottom: "8%",
  left: "4%",
  background:
    "radial-gradient(circle, rgba(217,112,64,0.10) 0%, transparent 70%)",
};

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (searchParams.get("unauthorized") === "true") {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      toast.error("Session expired. Please login again.");
    }
  }, [searchParams]);

  const logoSrc =
    mounted && resolvedTheme === THEME_TYPE.LIGHT
      ? RayptoLogo.src
      : RayptoLogoDark.src;

  const handleSubmit = async (data: LoginFormValues) => {
    const payload = {
      email: data.email,
      password: data.password,
      redirectUrl: null,
    };

    try {
      setIsLoading(true);

      const res = await loginAction(payload);
      console.log("🔥 Login API response:", res);

      // Check for success status, status code 200, and ensure data exists
      if (res.status && res.statusCode === 200 && res.data) {
        const { token } = res.data;

        if (token) {
          const success = await createSessionClient(token);
          if (success) {
            localStorage.setItem("token", token);
            toast.success("Login successful");
            router.push(ROUTES.DASHBOARD_ANALYTICS);
          }
        } else {
          toast.error("Authentication token missing in response.");
        }
      } else {
        toast.error(
          res.message || "Login failed. Please check your credentials.",
        );
      }
    } catch (error) {
      console.error("🔥 Login API error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FAF7F4]">
      <div style={blobTopLeft} />
      <div style={blobBottomRight} />
      <div style={blobBottomLeft} />
      <div className="relative z-10 flex flex-col items-center w-full px-5 py-10">
        <div className="heading-content mb-4">
          <Image
            src={logoSrc}
            className="mx-auto w-[200px] h-auto"
            width={164}
            height={52}
            alt="logo"
          />
        </div>
        <FormLayout layout={FormLayoutType.Default}>
          <h4 className="mb-1 text-[20px] leading-tight sm:text-[24px] sm:leading-[32px]">
            Welcome back to Townly
          </h4>
          <p className="mb-6">Please sign in to your Admin account</p>
          <FormBuilder<LoginFormValues>
            formConfig={config}
            onSubmit={handleSubmit}
            submitText="Login"
            isLoading={isLoading}
            className="mb-0"
            isLoginVariant={true}
          />
        </FormLayout>
      </div>
      <div className="w-1/2 fixed right-0 top-1/2 -translate-y-1/2 opacity-[0.036] z-0">
        <Image className="ml-auto w-full" src={logoSrt} alt="logo" />
      </div>
    </div>
  );
};

export default Login;
