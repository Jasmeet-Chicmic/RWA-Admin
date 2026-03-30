"use client";

import { isRouteAllowed } from "@/lib/isRouteAllowed";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

const USER_TAB_KEYS = {
  ACCOUNT: "Account",
  FEATURES: "Features Tab",
  EVENTS: "Events",
  COMPANIES: "Companies",
  GROUPS: "Groups",
  TRANSACTIONS: "Transactions",
  SUBSCRIPTIONS: "Subscriptions",
} as const;

const UserTabs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("users");

  // Extract userId from pathname: /users/view/{userId}/...
  const segments = pathname.split("/");
  const viewIndex = segments.indexOf("view");
  const userId = viewIndex !== -1 ? segments[viewIndex + 1] : "";

  const userTabs: {
    key: (typeof USER_TAB_KEYS)[keyof typeof USER_TAB_KEYS];
    path: string;
  }[] = [
    { key: USER_TAB_KEYS.ACCOUNT, path: `/users/view/${userId}/account` },
    { key: USER_TAB_KEYS.FEATURES, path: `/users/view/${userId}/features` },
    { key: USER_TAB_KEYS.EVENTS, path: `/users/view/${userId}/events` },
    { key: USER_TAB_KEYS.COMPANIES, path: `/users/view/${userId}/companies` },
    { key: USER_TAB_KEYS.GROUPS, path: `/users/view/${userId}/groups` },
    {
      key: USER_TAB_KEYS.TRANSACTIONS,
      path: `/users/view/${userId}/transactions`,
    },
    {
      key: USER_TAB_KEYS.SUBSCRIPTIONS,
      path: `/users/view/${userId}/subscriptions`,
    },
  ];

  if (userTabs.length === 0) {
    return null;
  }

  return (
    <div className="flex px-0 border-b border-bordergray200 dark:border-darkbgprimary overflow-x-auto mb-3 3xl:mb-6">
      {userTabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => router.push(tab.path, { scroll: false })}
          className={`relative px-6 py-4 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
            isRouteAllowed(pathname, [tab.path])
              ? "text-primarycolor dark:text-sidebartext"
              : "text-black/70 hover:text-gray-600 dark:text-gray-500 dark:hover:text-darklabelprimary"
          }`}
        >
          <span className="relative z-10">{t(tab.key)}</span>
          {isRouteAllowed(pathname, [tab.path]) && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primarycolor rounded-t-full shadow-[0_-1px_10px_rgba(67,24,255,0.3)]" />
          )}
        </button>
      ))}
    </div>
  );
};

export default UserTabs;
