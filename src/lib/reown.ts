"use client";

import { createAppKit } from "@reown/appkit/react";
import { polygonAmoy } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { QueryClient } from "@tanstack/react-query";
import type { AppKitNetwork } from "@reown/appkit/networks";

export const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

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
  });
}
