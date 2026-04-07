"use client";

import { useAppKit } from "@reown/appkit/react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "react-toastify";
import { type Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

import {
  AssignablePropertyItem,
  getAssignablePropertiesAction,
  registerIdentityCompletionAction,
} from "@/api/user";
import AsyncSelect, {
  AsyncSelectGetDataParams,
  OptionType,
} from "@/components/atoms/AsyncSelect/AsyncSelect";
import Button from "@/components/atoms/Button";
import { useWalletState } from "@/components/providers/WalletStateProvider";
import {
  IDENTITY_REGISTRY_ABI,
  TOKEN_ABI,
} from "@/lib/contracts/tokenization/abis";
import { buildGasConfig } from "@/lib/contracts/tokenization/gasConfig";
import { handleWeb3Error } from "@/shared/utils/web3Error";

type RegisterIdentityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userWalletAddress: string;
  userIdentityContractAddress?: string | null;
};

const getTokenAddressFromOption = (option: OptionType | null) =>
  (option?.tokenAddress ||
    option?.token ||
    option?.propertyTokenAddress ||
    option?.trexTokenAddress ||
    option?.value) as string | undefined;

const getIdentityAddressFromOption = (option: OptionType | null) =>
  (option?.identityContractAddress || option?.identityAddress) as
    | string
    | undefined;

export default function RegisterIdentityModal({
  isOpen,
  onClose,
  userId,
  userWalletAddress,
  userIdentityContractAddress,
}: RegisterIdentityModalProps) {
  const t = useTranslations("users");
  const { isConnected } = useWalletState();
  const { open } = useAppKit();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [selectedProperty, setSelectedProperty] = useState<OptionType | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssignableProperties = async ({
    searchString,
    page,
    limit,
  }: AsyncSelectGetDataParams): Promise<{
    data: OptionType[];
    count: number;
  }> => {
    try {
      const res = await getAssignablePropertiesAction({
        userId,
        page,
        pageSize: limit,
      });
      console.log("res assignable properties", res);
      const items = (res?.data?.items ?? []) as AssignablePropertyItem[];
      const filtered = searchString
        ? items.filter((item) =>
            String(item.propertyName ?? item.name ?? item.title ?? "")
              .toLowerCase()
              .includes(searchString.toLowerCase()),
          )
        : items;

      return {
        data: filtered.map((item) => ({
          label:
            item.propertyName ||
            item.name ||
            item.title ||
            t("unnamedProperty"),
          value: item.id,
          tokenAddress: item.tokenAddress,
          identityContractAddress: item.identityContractAddress,
          isRegistered: item.isRegistered,
        })),
        count: res?.data?.totalCount ?? filtered.length,
      };
    } catch (error) {
      console.error("Error fetching assignable properties:", error);
      return { data: [], count: 0 };
    }
  };

  const handleRegister = async () => {
    if (!selectedProperty) {
      toast.error(t("selectAssignableProperty"));
      return;
    }
    if (!isConnected) {
      open();
      return;
    }
    if (!walletClient || !publicClient) {
      toast.error(t("walletNotReady"));
      return;
    }

    const tokenAddress = getTokenAddressFromOption(selectedProperty);
    const propertyId = String(selectedProperty.value ?? "");
    const identityAddress =
      getIdentityAddressFromOption(selectedProperty) ||
      userIdentityContractAddress;

    if (!tokenAddress || !identityAddress || !propertyId) {
      toast.error(t("missingIdentityOrTokenAddress"));
      return;
    }

    try {
      setIsSubmitting(true);

      const identityRegistryAddress = (await publicClient.readContract({
        address: tokenAddress as Address,
        abi: TOKEN_ABI,
        functionName: "identityRegistry",
      })) as Address;
      const gasConfig = buildGasConfig(walletClient.chain?.id);

      const txHash = await walletClient.writeContract({
        address: identityRegistryAddress,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: "registerIdentity",
        args: [userWalletAddress as Address, identityAddress as Address, 42],
        account: walletClient.account!,
        chain: walletClient.chain,
        gas: BigInt(800000),
        maxPriorityFeePerGas: gasConfig.maxPriorityFeePerGas,
        maxFeePerGas: gasConfig.maxFeePerGas,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      if (receipt.status !== "success") {
        throw new Error("registerIdentity transaction failed.");
      }

      const registerIdentityApiRes = await registerIdentityCompletionAction({
        propertyId,
        userId,
        transactionHash: receipt.transactionHash,
      });
      if (!registerIdentityApiRes?.status) {
        throw new Error(
          registerIdentityApiRes?.message || t("registerIdentityBackendFailed"),
        );
      }

      toast.success(
        registerIdentityApiRes?.message || t("registerIdentitySuccess"),
      );
      setSelectedProperty(null);
      onClose();
    } catch (error) {
      toast.error(handleWeb3Error(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bgwhite dark:bg-darkbgprimary w-full max-w-lg rounded-2xl shadow-2xl border border-bordergray200 dark:border-darkbordercolor1">
        <div className="px-6 py-4 border-b border-bordergray200 dark:border-darkbordercolor1 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <div>
            <h3 className="text-lg font-bold text-bgblack dark:text-white">
              {t("registerIdentityModalTitle")}
            </h3>
            <p className="text-sm text-textprimary dark:text-secondary">
              {t("registerIdentityModalDescription")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
            type="button"
          >
            <X size={20} className="text-textprimary dark:text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-bgblack dark:text-white">
              {t("assignableProperty")}
            </label>
            <AsyncSelect
              placeholder={t("selectAssignablePropertyPlaceholder")}
              getData={fetchAssignableProperties}
              onChange={(val) => setSelectedProperty(val as OptionType)}
              value={selectedProperty}
              isClearable
              variant="modalDark"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-bordergray200 dark:border-darkbordercolor1 bg-gray-50/50 dark:bg-white/5 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl px-6 h-11"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={() => void handleRegister()}
            isLoading={isSubmitting}
            disabled={!selectedProperty}
            className="rounded-xl px-8 h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
          >
            {t("registerIdentityAction")}
          </Button>
        </div>
      </div>
    </div>
  );
}
