"use client";

import { createAppKit } from "@reown/appkit/react";
import { polygonAmoy } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { QueryClient } from "@tanstack/react-query";
import type { AppKitNetwork } from "@reown/appkit/networks";

export const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const PHANTOM_WALLET_ID =
  "a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393";

const metadata = {
  name: "Townly Admin Panel",
  description: "Townly RWA Website Admin Panel",
  url: appUrl ?? "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [polygonAmoy];
export const isReownConfigured = Boolean(projectId);

export const wagmiAdapter = isReownConfigured
  ? new WagmiAdapter({
      networks,
      projectId: projectId as string,
      ssr: false,
    })
  : null;

if (isReownConfigured && wagmiAdapter) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId: projectId as string,
    metadata,
    networks,
    features: {
      socials: false,
      email: false,
    },
    excludeWalletIds: [PHANTOM_WALLET_ID],
  });
}
