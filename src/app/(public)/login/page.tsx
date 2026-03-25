"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTheme } from "next-themes";

import { RayptoLogo, RayptoLogoDark } from "@/assets";
import FormLayout from "@/components/layouts/FormLayout";
import { FormLayoutType } from "@/components/layouts/FormLayout/helpers/constants";
import { THEME_TYPE } from "@/shared/constants";

import LoginFormStep from "./LoginFormStep";
import WalletConnectStep from "./WalletConnectStep";

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
    "radial-gradient(circle, #c7fe1e47 0%, #c7fe1e0f 50%, transparent 70%)",
};

const blobBottomRight: React.CSSProperties = {
  ...blobBase,
  width: 460,
  height: 460,
  bottom: -100,
  right: -120,
  background:
    "radial-gradient(circle, #c7fe1e47 0%, #c7fe1e0f 50%, transparent 70%)",
};

const blobBottomLeft: React.CSSProperties = {
  ...blobBase,
  width: 260,
  height: 260,
  bottom: "8%",
  left: "4%",
  background:
    "radial-gradient(circle, #c7fe1e47 0%, #c7fe1e0f 50%, transparent 70%)",
};

const Login = () => {
  const searchParams = useSearchParams();
  const [nonce, setNonce] = useState<string>();
  const [tempToken, setTempToken] = useState<string>();

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

  const handleNonceToken = ({
    nonce: nextNonce,
    tempToken: nextTempToken,
  }: {
    nonce: string;
    tempToken: string;
  }) => {
    setNonce(nextNonce);
    setTempToken(nextTempToken);
  };

  const handleBackToLogin = () => {
    setNonce(undefined);
    setTempToken(undefined);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
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
          {!nonce || !tempToken ? (
            <LoginFormStep onNonceToken={handleNonceToken} />
          ) : (
            <WalletConnectStep
              nonce={nonce}
              tempToken={tempToken}
              onBackToLogin={handleBackToLogin}
            />
          )}
        </FormLayout>
      </div>
    </div>
  );
};

export default Login;
