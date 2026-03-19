"use client";

import { Languages, LogOut, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import Loader from "@/components/atoms/Loader/Loader";
import { THEME_TYPE } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";
import { deleteSessionClient, getLocale, updateLocale } from "@/shared/utils";

import CheckClickOutside from "../CheckClickOutside";
import CommandPalette from "../CommandPalette";
import { logoutAction } from "@/api/auth";

const LANGUAGE_OPTIONS: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
];

const Header = () => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  // const [mounted, setMounted] = useState(false);
  // const [notificationCount] = useState(3);
  // const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [language, setLanguage] = useState<string>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const tCommon = useTranslations("common");

  useEffect(() => {
    // setMounted(true);
    setTheme(THEME_TYPE.DARK);
    setUserEmail(localStorage.getItem("email") || "Admin01@yopmail.com");
    setUserRole(localStorage.getItem("role") || "Admin");
  }, []);

  const toggleTheme = () => {
    setTheme(
      resolvedTheme === THEME_TYPE.DARK ? THEME_TYPE.DARK : THEME_TYPE.DARK,
    );
  };
  toggleTheme;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await logoutAction();
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      if (res.status) {
        const success = await deleteSessionClient();
        if (success) {
          toast.success("Logout successful");
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
      console.log(savedLanguage, " savedLanguage");
      setLanguage(savedLanguage || "en");
    })();
  }, [setLanguage]);
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
              placeholder={tCommon("Search Placeholder")}
              onClick={() => setShowCommandPalette(true)}
              className="pl-10 border-none px-4 py-3 w-full border-[1px] placeholder:text-[#8F9BBA] bg-bgwhite dark:bg-darkbgprimary rounded-[10px] focus:outline-none transition-all duration-200 textbgblack"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 ml-[10px] ssm:ml-4">
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
          {/* <CheckClickOutside onClick={() => setShowNotifications(false)}>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 dark:bordercolor1 dark:hover:text-gray-100 dark:hover:bg-labelprimary"
              >
                <Bell size={18} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-bgblue text-bgwhite text-[0.875] font-bold flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-bgwhite rounded-lg shadow-lg border bordergray200 z-50 dark:bg-darkbgprimary dark:border-labelprimary">
                  <div className="p-4 border-b borderborder-b border-bordergray200">
                    <h3 className="font-semibold text-gray-900 dark:bordercolor1 dark:text-bgwhite">
                      Notifications ({notificationCount})
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-labelprimary cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:bordercolor1 dark:text-bgwhite">
                            New user registered
                          </p>
                          <p className="text-[0.875rem] text-sidebartext mt-1 dark:text-bgwhite">
                            2 minutes ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-labelprimary cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:bordercolor1 dark:text-bgwhite">
                            Order completed
                          </p>
                          <p className="text-[0.875rem] text-sidebartext mt-1 dark:text-bgwhite">
                            5 minutes ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-labelprimary cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:bordercolor1  dark:text-bgwhite">
                            System update available
                          </p>
                          <p className="text-[0.875rem] text-sidebartext mt-1 dark:text-bgwhite">
                            1 hour ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CheckClickOutside> */}
          {/* User Menu */}
          <CheckClickOutside onClick={() => setShowUserMenu(false)}>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg focus:ring-0 transition-colors duration-200 dark:bordercolor1 dark:hover:text-gray-100 dark:hover:bg-labelprimary focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <div className="w-8 h-8 bg-primarycolor dark:bg-secondarycolor rounded-full flex items-center justify-center">
                  <span className="text-white dark:text-black text-sm font-semibold">
                    {userRole ? userRole.substring(0, 2).toUpperCase() : "AD"}
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
                    {tCommon("Log out")}
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
      />
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bgbgwhite/50 dark:bgbgblack/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader />
            <p className="text-lg font-medium text-textprimary dark:text-sidebartext">
              {tCommon("Logging out")}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
