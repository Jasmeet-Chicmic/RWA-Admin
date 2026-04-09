"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { RayptoLogo, RayptoLogoDark } from "@/assets";
import FormLayout from "@/components/layouts/FormLayout";
import { FormLayoutType } from "@/components/layouts/FormLayout/helpers/constants";
import { LOGIN_ROLE, THEME_TYPE } from "@/shared/constants";

import LoginFormStep from "./LoginFormStep";
import WalletConnectStep from "./WalletConnectStep";

const LOGIN_ROLE_OPTIONS = [
  { value: LOGIN_ROLE.ADMIN, labelKey: "login.roles.admin" },
  { value: LOGIN_ROLE.ORGANISATION, labelKey: "login.roles.organisation" },
] as const;

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
  const tCommon = useTranslations("common");
  const [nonce, setNonce] = useState<string>();
  const [tempToken, setTempToken] = useState<string>();
  const [selectedRole, setSelectedRole] = useState<LOGIN_ROLE>(
    LOGIN_ROLE.ADMIN,
  );

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    mounted && resolvedTheme === THEME_TYPE.LIGHT
      ? RayptoLogo.src
      : RayptoLogoDark.src;
  const isWalletStep = Boolean(nonce && tempToken);

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

  const handleRoleChange = (role: LOGIN_ROLE) => {
    setSelectedRole(role);
    // Reset the login flow when switching roles
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
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primarycolor mb-2">
              {isWalletStep
                ? tCommon("login.stepWalletLabel")
                : tCommon("login.stepSignInLabel")}
            </p>
            <h4 className="text-[22px] leading-tight sm:text-[28px] sm:leading-[34px] font-semibold">
              {tCommon("login.welcomeTitle")}
            </h4>
            <p className="mt-2 text-sm text-white/70">
              {tCommon("login.welcomeSubtitle")}
            </p>
          </div>

          {/* Role Toggle */}
          {(!nonce || !tempToken) && (
            <div className="flex items-center justify-center mb-6 mt-4">
              <div className="relative flex rounded-xl bg-white/5 ring-1 ring-white/10 p-1.5 w-full max-w-full">
                {LOGIN_ROLE_OPTIONS.map(({ value, labelKey }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRoleChange(value)}
                    className={`relative z-10 flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-300 ${
                      selectedRole === value
                        ? "bg-primarycolor text-black shadow-md"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {tCommon(labelKey)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!nonce || !tempToken ? (
            <LoginFormStep
              onNonceToken={handleNonceToken}
              role={selectedRole}
            />
          ) : (
            <WalletConnectStep
              nonce={nonce}
              tempToken={tempToken}
              onBackToLogin={handleBackToLogin}
              role={selectedRole}
            />
          )}
        </FormLayout>
      </div>
    </div>
  );
};

export default Login;
