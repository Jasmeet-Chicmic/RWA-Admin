"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { isReownConfigured, queryClient, wagmiAdapter } from "@/lib/reown";
import { WalletStateProvider } from "./WalletStateProvider";

interface Web3ProviderProps {
  children: React.ReactNode;
}

const Web3Provider = ({ children }: Readonly<Web3ProviderProps>) => {
  if (!isReownConfigured || !wagmiAdapter) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletStateProvider>{children}</WalletStateProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Web3Provider;
