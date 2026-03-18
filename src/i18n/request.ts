import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const NAMESPACES = [
  "common",
  "properties",
  "pointRules",
  "promoCodes",
  "podcasts",
  "users",
  "videos",
  "events",
  "companies",
  "groups",
  "subscriptions",
  "transactions",
  "plans",
  "posts",
  "dashboard",
  "roles",
  "broadcastMessages",
  "kyc",
] as const;

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get("locale")?.value;

  const locale = cookieLocale || "en";
  let baseMessages: Record<string, unknown> = {};
  try {
    baseMessages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    // Base locale file (e.g. en.json) is optional now
    baseMessages = {};
  }

  const messages: Record<string, unknown> = { ...baseMessages };

  // Load optional namespaces (common, pointRules, promoCodes, ...)
  for (const ns of NAMESPACES) {
    try {
      const mod = await import(`../messages/${locale}/${ns}.json`);
      messages[ns] = mod.default as Record<string, string>;
    } catch {
      // If a namespace file doesn't exist for this locale yet, skip it
    }
  }

  return {
    locale,
    messages,
  };
});
