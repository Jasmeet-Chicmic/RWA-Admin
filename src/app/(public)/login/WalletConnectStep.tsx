"use client";

import { useAppKit } from "@reown/appkit/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useDisconnect, useSignMessage } from "wagmi";

import Button from "@/components/atoms/Button";
import { useWalletState } from "@/components/providers/WalletStateProvider";
import { LOGIN_ROLE } from "@/shared/constants";
import { PRIVATE_ROUTES } from "@/shared/routes";
import { createSessionClient } from "@/shared/utils";
import {
  handleWeb3Error,
  isInvalidWalletSignatureError,
} from "@/shared/utils/web3Error";
import { verifyWalletThunk } from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";

function buildSiweMessage({
  domain,
  wallet,
  chainId,
  nonce,
}: {
  domain: string;
  wallet: string;
  chainId: number;
  nonce: string;
}) {
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  return `${domain} wants you to sign in with your Ethereum account:\n${wallet}\n\nURI: https://${domain}\nVersion: 1\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${issuedAt}\nExpiration Time: ${expiresAt}`;
}

const ROLE_REDIRECT_MAP = {
  [LOGIN_ROLE.ADMIN]: PRIVATE_ROUTES.DASHBOARD_ANALYTICS,
  [LOGIN_ROLE.ORGANISATION]: PRIVATE_ROUTES.ORGANISATIONS_PROPERTIES,
} as const;

type WalletConnectStepProps = {
  nonce: string;
  tempToken: string;
  onBackToLogin: () => void;
  role: LOGIN_ROLE;
};

const WalletConnectStep = ({
  nonce,
  tempToken,
  onBackToLogin,
  role,
}: WalletConnectStepProps) => {
  const tCommon = useTranslations("common");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { open } = useAppKit();
  const { isConnected, address, chainId } = useWalletState();
  const { signMessageAsync } = useSignMessage();
  const { disconnectAsync } = useDisconnect();

  const isMountedRef = useRef(true);
  const isDisconnectingWalletRef = useRef(false);

  const [isVerifyingWallet, setIsVerifyingWallet] = useState(false);
  const [walletVerifyTriggered, setWalletVerifyTriggered] = useState(false);

  const walletVerifyErrorOptions = useMemo(
    () => ({
      invalidWalletSignatureMessage: tCommon("walletVerify.wrongWallet"),
      genericFailureMessage: tCommon("walletVerify.genericFailure"),
    }),
    [tCommon],
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleWalletDisconnect = useCallback(async () => {
    isDisconnectingWalletRef.current = true;
    try {
      await disconnectAsync();
      setWalletVerifyTriggered(false);
    } catch (error) {
      const errorCode =
        error && typeof error === "object" && "code" in error
          ? (error as { code?: unknown }).code
          : undefined;
      if (errorCode === 4100 || errorCode === "4100") {
        return;
      }
      console.error("Wallet disconnect error:", error);
    } finally {
      isDisconnectingWalletRef.current = false;
    }
  }, [disconnectAsync]);

  const handleWalletVerify = useCallback(async () => {
    if (!nonce || !tempToken) return;

    try {
      setIsVerifyingWallet(true);

      if (!isConnected) {
        await open();
      }

      if (!address || !chainId) {
        throw new Error("Wallet address or chain ID is missing");
      }

      if (isDisconnectingWalletRef.current) return;

      console.log("[Auth] Nonce received:", nonce);

      const message = buildSiweMessage({
        domain: window.location.host,
        wallet: address,
        chainId,
        nonce,
      });

      console.log("[Auth] Requesting signature...");
      const signature = await signMessageAsync({
        message,
        account: address as `0x${string}`,
      });
      console.log("[Auth] Signature received:", signature);

      const res = await dispatch(
        verifyWalletThunk({
          role,
          message,
          signature,
          tempToken,
        }),
      ).unwrap();

      console.log("🔥 Wallet verify response:", res);

      if (res.status && res.statusCode === 200 && res.data?.token) {
        localStorage.setItem("token", res.data.token);
        const success = await createSessionClient(res.data.token, role);
        if (success) {
          toast.success(res.message || "Login successful");
          const redirectPath = ROLE_REDIRECT_MAP[role];
          router.push(redirectPath);
          return;
        }
        toast.error("Session creation failed.");
        return;
      }

      toast.error(handleWeb3Error(res.message ?? "", walletVerifyErrorOptions));
      if (isInvalidWalletSignatureError(res.message ?? "")) {
        await handleWalletDisconnect();
      }
    } catch (error) {
      if (isDisconnectingWalletRef.current) return;
      console.error("🔥 Wallet verify error:", error);
      toast.error(handleWeb3Error(error, walletVerifyErrorOptions));
      if (isInvalidWalletSignatureError(error)) {
        await handleWalletDisconnect();
      }
    } finally {
      if (isMountedRef.current) {
        setIsVerifyingWallet(false);
      }
    }
  }, [
    nonce,
    tempToken,
    isConnected,
    open,
    signMessageAsync,
    router,
    address,
    chainId,
    role,
    dispatch,
    walletVerifyErrorOptions,
    handleWalletDisconnect,
  ]);

  const handleBackToLogin = useCallback(async () => {
    setWalletVerifyTriggered(false);
    onBackToLogin();
    if (isConnected && !isDisconnectingWalletRef.current) {
      await handleWalletDisconnect();
    }
  }, [handleWalletDisconnect, isConnected, onBackToLogin]);

  useEffect(() => {
    if (!nonce || !tempToken) return;
    if (isDisconnectingWalletRef.current) return;
    if (!isConnected) return;
    if (walletVerifyTriggered) return;

    setWalletVerifyTriggered(true);
    void handleWalletVerify();
  }, [
    nonce,
    tempToken,
    isConnected,
    walletVerifyTriggered,
    handleWalletVerify,
  ]);

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-white/60">
        {tCommon("login.stepWalletLabel")}
      </p>
      <p className="mb-4 text-white/85">{tCommon("login.wallet.subtitle")}</p>

      <div className="mb-5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-white/70">
            {tCommon("login.wallet.connectionStatus")}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              isConnected
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-amber-500/15 text-amber-300"
            }`}
          >
            {isConnected
              ? tCommon("login.wallet.connected")
              : tCommon("login.wallet.notConnected")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void handleBackToLogin();
          }}
          disabled={isVerifyingWallet}
          className="w-full hover:opacity-[0.6] !hover:-translate-y-px !transition-all !duration-150"
        >
          {tCommon("backToLogin")}
        </Button>

        <Button
          type="button"
          onClick={() => {
            if (isConnected) {
              void handleWalletDisconnect();
              return;
            }
            void open();
          }}
          isLoading={isVerifyingWallet}
          disabled={isVerifyingWallet}
          className="w-full text-black !hover:-translate-y-px !transition-all !duration-150"
        >
          {isConnected && address
            ? tCommon("disconnectWallet")
            : tCommon("connectWallet")}
        </Button>
      </div>
    </div>
  );
};

export default WalletConnectStep;
