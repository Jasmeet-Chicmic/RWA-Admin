"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useAppKit } from "@reown/appkit/react";
import { useDisconnect, useSignMessage } from "wagmi";
import { toast } from "react-toastify";

import Button from "@/components/atoms/Button";
import { useWalletState } from "@/components/providers/WalletStateProvider";
import { INTERNAL_API_PATHS } from "@/shared/api";
import { postApiJson } from "@/shared/clientApi";
import { LOGIN_ROLE } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";
import { createSessionClient } from "@/shared/utils";
import { handleWeb3Error } from "@/shared/utils/web3Error";

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

const WALLET_VERIFY_API_MAP = {
  [LOGIN_ROLE.ADMIN]: INTERNAL_API_PATHS.ADMIN_WALLET_VERIFY,
  [LOGIN_ROLE.ORGANISATION]: INTERNAL_API_PATHS.ORG_WALLET_VERIFY,
} as const;

const ROLE_REDIRECT_MAP = {
  [LOGIN_ROLE.ADMIN]: ROUTES.DASHBOARD_ANALYTICS,
  [LOGIN_ROLE.ORGANISATION]: ROUTES.ORGANISATIONS,
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
  const { open } = useAppKit();
  const { isConnected, address, chainId } = useWalletState();
  const { signMessageAsync } = useSignMessage();
  const { disconnectAsync } = useDisconnect();

  const isMountedRef = useRef(true);
  const isDisconnectingWalletRef = useRef(false);

  const [isVerifyingWallet, setIsVerifyingWallet] = useState(false);
  const [walletVerifyTriggered, setWalletVerifyTriggered] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

      const verifyEndpoint = WALLET_VERIFY_API_MAP[role];

      const res = await postApiJson<
        {
          statusCode?: number;
          status?: boolean;
          message?: string;
          data?: { token?: string };
        },
        { message: string; signature: string }
      >(
        verifyEndpoint,
        {
          message,
          signature,
        },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
        },
      );

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

      toast.error(res.message || "Wallet verification failed.");
    } catch (error) {
      if (isDisconnectingWalletRef.current) return;
      console.error("🔥 Wallet verify error:", error);
      toast.error(handleWeb3Error(error));
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
  ]);

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
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void handleBackToLogin();
        }}
        disabled={isVerifyingWallet}
        className="w-full"
      >
        {tCommon("Back to Login")}
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
        className="mt-4 w-full text-black"
      >
        {isConnected && address
          ? tCommon("Disconnect Wallet")
          : tCommon("Connect Wallet")}
      </Button>
    </>
  );
};

export default WalletConnectStep;
