"use client";

import { Bell, Check, Copy, Languages, LogOut, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDisconnect } from "wagmi";

import Loader from "@/components/atoms/Loader/Loader";
import { LOGIN_ROLE, THEME_TYPE } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";
import { deleteSessionClient, getLocale, updateLocale } from "@/shared/utils";

import { logoutAction } from "@/api/auth";
import { getCurrentProfileAction } from "@/api/profile";
import { useWalletState } from "@/components/providers/WalletStateProvider";
import { isReownConfigured } from "@/lib/reown";
import {
  clearAuthProfile,
  setAuthProfile,
  setAuthProfileLoading,
} from "@/store/authProfileSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useQuery } from "@tanstack/react-query";
import { getNotificationStatsAction } from "@/api/notifications";
import { getNotificationsAction } from "@/api/notifications";
import NotificationPopover from "./NotificationPopover";
import CheckClickOutside from "../CheckClickOutside";
import CommandPalette from "../CommandPalette";
import { getFilteredNavItems } from "../Sidebar/helpers/constants";

const LANGUAGE_OPTIONS: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
];

const Header = () => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [language, setLanguage] = useState<string>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isWalletCopied, setIsWalletCopied] = useState(false);
  const { isConnected, address } = useWalletState();
  const { disconnect } = useDisconnect();
  const t = useTranslations("common");

  const dispatch = useAppDispatch();
  const { role: userRole, profile: userProfile } = useAppSelector(
    (state) => state.authProfile,
  );
  const userEmail = userProfile?.email ?? "";

  useEffect(() => {
    // setMounted(true);
    setTheme(THEME_TYPE.DARK);

    // Populate profile from server on initial load/refresh.
    dispatch(setAuthProfileLoading(true));
    void (async () => {
      try {
        const res = await getCurrentProfileAction();
        dispatch(setAuthProfile(res));
      } catch (error) {
        console.error("[Header] Failed to load profile:", error);
        dispatch(clearAuthProfile());
      }
    })();
  }, [dispatch, setTheme]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(
      resolvedTheme === THEME_TYPE.DARK ? THEME_TYPE.DARK : THEME_TYPE.DARK,
    );
  };
  console.log(toggleTheme);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await logoutAction();
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      console.log(res, "res logout");
      if (res.status) {
        const success = await deleteSessionClient();
        if (success) {
          toast.success("Logout successful");
          disconnect();
          dispatch(clearAuthProfile());
          router.push(ROUTES.LOGIN);
        } else {
          toast.error("Session deletion failed.");
        }
      }
    } catch (error) {
      // if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      //   throw error;
      // }
      console.error("Logout error:", error);
      toast.error("An error occurred during logout.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLanguageChange = async (lang: string) => {
    if (lang === language) {
      setShowLanguageMenu(false);
      return;
    }
    await updateLocale(lang);
    setLanguage(lang);
    setShowLanguageMenu(false);
    router.refresh();
  };
  useEffect(() => {
    (async () => {
      const savedLanguage = await getLocale();
      setLanguage(savedLanguage || "en");
    })();
  }, [setLanguage]);

  const { data: statsData } = useQuery({
    queryKey: ["notification-stats"],
    queryFn: () => getNotificationStatsAction(),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const notificationCount = statsData?.data?.unread ?? 0;

  useEffect(() => {
    let cancelled = false;
    // Avoid replaying "new notification" toast on hard refresh.
    // On first load, notificationCount starts at 0 until statsData arrives.
    // We only want to toast on genuine increases after the first stats load.
    if (!statsData) return () => {};

    const previousUnread = (window as unknown as { __rwa_prevUnread?: number })
      .__rwa_prevUnread;
    const lastToastedId = (
      window as unknown as { __rwa_lastToastedNotifId?: string }
    ).__rwa_lastToastedNotifId;

    if (typeof previousUnread !== "number") {
      (window as unknown as { __rwa_prevUnread?: number }).__rwa_prevUnread =
        notificationCount;
      return () => {
        cancelled = true;
      };
    }

    if (notificationCount > previousUnread) {
      void (async () => {
        try {
          const res = await getNotificationsAction({ page: 1, pageSize: 1 });
          const latest = res.data?.items?.[0];
          if (cancelled || !latest) return;
          if (latest.id && latest.id === lastToastedId) return;

          const title = latest.title?.trim();
          const description = latest.description?.trim();
          const content =
            title && description
              ? `${title} — ${description}`
              : (title ?? description);
          if (!content) return;

          (
            window as unknown as { __rwa_lastToastedNotifId?: string }
          ).__rwa_lastToastedNotifId = latest.id;

          toast.info(content, {
            onClick: () => {
              if (latest.redirectUrl) router.push(latest.redirectUrl);
            },
          });
        } catch (error) {
          console.error("[Header] Failed to fetch latest notification:", error);
        }
      })();
    }

    (window as unknown as { __rwa_prevUnread?: number }).__rwa_prevUnread =
      notificationCount;

    return () => {
      cancelled = true;
    };
  }, [notificationCount, router, statsData]);

  const walletAddressLabel = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";
  const handleCopyWalletAddress = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setIsWalletCopied(true);
      window.setTimeout(() => setIsWalletCopied(false), 1200);
    } catch (error) {
      console.error("Failed to copy wallet address:", error);
      toast.error(t("copyFailed"));
    }
  }, [address, t]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
  return (
    <>
      <header className="flex items-center justify-between p-0 dark:border-labelprimary rounded-[10px] pl-[50px] lg:pl-0">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative dark:border-darkbordercolor1 border border-b border-bordergray200ordercolor1 rounded-[10px]">
            <Search
              className="absolute left-[15px] top-1/2 transform -translate-y-1/2 text-textprimary dark:text-secondary"
              size={18}
            />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              onClick={() => setShowCommandPalette(true)}
              className="pl-10 border-none px-4 py-3 w-full border-[1px] placeholder:text-[#8F9BBA] bg-bgwhite dark:bg-darkbgprimary rounded-[10px] focus:outline-none transition-all duration-200 text-bgblack"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 ml-[10px] ssm:ml-4">
          {mounted &&
            isReownConfigured &&
            isConnected &&
            walletAddressLabel && (
              <div className="pl-4 pr-2 py-2 rounded-lg border border-bordergray200 text-sm font-semibold text-textprimary dark:text-white dark:border-darkbordercolor1 inline-flex items-center gap-2">
                <span>{walletAddressLabel}</span>
                <button
                  type="button"
                  onClick={() => void handleCopyWalletAddress()}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-labelprimary transition-colors"
                  aria-label={t("copy")}
                  title={t("copy")}
                >
                  {isWalletCopied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            )}
          {/* Language Selector */}
          <CheckClickOutside onClick={() => setShowLanguageMenu(false)}>
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-2 text-gray-600 focus:ring-0 hover:text-gray-900 hover:bg-gray-100  focus:bg-gray-100/10 rounded-lg transition-colors duration-200 dark:text-white dark:bordercolor1 dark:hover:text-gray-100 dark:hover:bg-labelprimary focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Languages size={18} />
              </button>
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-bgwhite rounded-lg shadow-lg border bordergray200 py-1 z-50 dark:bg-darkbgprimary dark:border-labelprimary">
                  {LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.code}
                      className={`w-full px-4 py-2 text-left text-sm text-textprimary dark:text-bgwhite hover:bg-gray-50 dark:hover:bg-labelprimary dark:bordercolor1 ${
                        language === option.code
                          ? "font-bold bg-gray-100 dark:bg-labelprimary"
                          : ""
                      }`}
                      onClick={() => void handleLanguageChange(option.code)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CheckClickOutside>
          {/* Theme Toggle */}
          {/* <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 focus:ring-0 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 dark:text-white dark:bordercolor1 dark:hover:text-gray-100 dark:hover:bg-labelprimary"
            aria-label="Toggle theme"
            suppressHydrationWarning
          >
            {!mounted ? (
              <Moon size={18} />
            ) : resolvedTheme === THEME_TYPE.DARK ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button> */}

          {/* App Grid */}
          {/* <button className="p-2 text-gray-600 focus:ring-0 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 dark:bordercolor1 dark:hover:text-gray-100 dark:hover:bg-labelprimary">
            <Grid3X3 size={18} />
          </button> */}

          {/* Notifications */}
          <CheckClickOutside onClick={() => setShowNotifications(false)}>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 dark:bordercolor1 dark:hover:text-gray-100 dark:hover:bg-labelprimary"
              >
                <Bell size={18} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-bgblue text-bgwhite text-[10px] font-bold flex items-center justify-center">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationPopover
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>
          </CheckClickOutside>
          {/* User Menu */}
          <CheckClickOutside onClick={() => setShowUserMenu(false)}>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg focus:ring-0 transition-colors duration-200 dark:bordercolor1 dark:hover:text-gray-100 dark:hover:bg-labelprimary focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <div className="w-8 h-8 bg-primarycolor dark:bg-secondarycolor rounded-full flex items-center justify-center">
                  <span className="text-white dark:text-black text-sm font-semibold">
                    {userRole ? userRole.substring(0, 2).toUpperCase() : ""}
                  </span>
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-bgwhite rounded-lg shadow-lg border bordergray200 py-1 z-50 dark:bg-darkbgprimary dark:border-labelprimary">
                  <div className="px-4 py-3 border-b border-bordergray200">
                    <p className="text-sm font-medium text-bgblack dark:bordercolor1 dark:text-bgwhite">
                      {userRole}
                    </p>
                    <p className="text-[0.875rem] text-bgblack/50 dark:text-sidebartext">
                      {userEmail}
                    </p>
                  </div>
                  {/* <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-labelprimary flex items-center dark:bordercolor1 dark:text-bgwhite">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-labelprimary flex items-center dark:bordercolor1 dark:text-bgwhite">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </button> */}
                  {/* <hr className="my-1" /> */}
                  <button
                    onClick={() => void handleLogout()}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-labelprimary flex items-center text-red-600 dark:bordercolor1"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          </CheckClickOutside>
        </div>
      </header>
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        items={
          userRole && Object.values(LOGIN_ROLE).includes(userRole)
            ? getFilteredNavItems(userRole)
            : []
        }
      />
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bgbgwhite/50 dark:bgbgblack/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader />
            <p className="text-lg font-medium text-textprimary dark:text-sidebartext">
              {t("loggingOut")}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
