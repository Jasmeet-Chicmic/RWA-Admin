"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useAccount } from "wagmi";

type WalletState = {
  isConnected: boolean;
  address?: string;
  chainId?: number;
};

const WalletStateContext = createContext<WalletState>({
  isConnected: false,
});

interface WalletStateProviderProps {
  children: React.ReactNode;
}

export const WalletStateProvider = ({
  children,
}: Readonly<WalletStateProviderProps>) => {
  const { isConnected, address, chainId } = useAccount();

  const value = useMemo(
    () => ({
      isConnected,
      address,
      chainId,
    }),
    [isConnected, address, chainId],
  );

  return (
    <WalletStateContext.Provider value={value}>
      {children}
    </WalletStateContext.Provider>
  );
};

export const useWalletState = () => useContext(WalletStateContext);
