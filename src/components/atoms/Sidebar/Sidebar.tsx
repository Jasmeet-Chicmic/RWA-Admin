"use client";

import { ChevronDown, ChevronRight, Menu, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { RayptoLogoDark } from "@/assets";
import { cn } from "@/shared/utils";
import { NavItem, navItems, getNavItemLabelKey } from "./helpers/constants";
import { useTheme } from "next-themes";
import { THEME_TYPE } from "@/shared/constants";
import CommandPalette from "../CommandPalette";
import { ROUTES } from "@/shared/routes";

const isItemActive = (pathname: string, item: NavItem): boolean => {
  if (
    item.activePaths?.some((path) =>
      path === "/" ? pathname === "/" : pathname.startsWith(path),
    )
  ) {
    return true;
  }
  return item.children?.some((child) => isItemActive(pathname, child)) ?? false;
};

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");

  useEffect(() => {
    const autoExpanded: Record<string, boolean> = {};
    const checkAndExpand = (
      items: NavItem[],
      parentChain: string[] = [],
    ): boolean => {
      let foundActive = false;
      for (const item of items) {
        if (item.children) {
          const childActive = checkAndExpand(item.children, [
            ...parentChain,
            item.label,
          ]);
          if (childActive) {
            autoExpanded[item.label] = true;
            parentChain.forEach((label) => (autoExpanded[label] = true));
            foundActive = true;
          }
        } else if (
          item.activePaths?.some((path) => pathname.startsWith(path))
        ) {
          foundActive = true;
        }
      }
      return foundActive;
    };
    checkAndExpand(navItems);
    setExpanded(autoExpanded);
    setMounted(true);
  }, [pathname]);

  const toggleExpand = useCallback((label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const iconActiveClass = "text-primarycolor dark:text-white";
  const iconInactiveClass =
    "text-sidebarlinkcolor group-hover:text-white dark:text-white/70 dark:hover:text-white";

  const renderItemIcon = (
    item: NavItem,
    isActive: boolean,
    iconClass: string,
  ) => {
    const Icon = item.icon;
    if (Icon) return <Icon size={24} className={iconClass} />;
    return (
      <span
        className={cn(
          "list-item-icon transition-transform duration-200 w-[10px] h-[10px] rounded-full flex-shrink-0",
          isActive
            ? "bg-primarycolor dark:bg-white"
            : "border-none bg-sidebarlinkcolor dark:bg-white/70",
        )}
      />
    );
  };

  const renderNavItem = (item: NavItem, depth = 0): React.ReactNode => {
    const isActive = isItemActive(pathname, item);
    const isExpandable = Boolean(item.children?.length);
    // const paddingLeft = depth * 16 + 16;
    const paddingLeft = 16;
    const iconClass = cn(
      "transition-colors duration-200",
      isActive ? iconActiveClass : iconInactiveClass,
    );
    const isLink = item.path && !isExpandable;

    return (
      <li className="mb-3 last:!mb-0" key={item.label}>
        {isLink ? (
          <Link
            href={item.path!}
            className={cn(
              "flex items-center px-3 py-3 rounded-[5px] sub-menu-item transition-all duration-200 group",
              isActive
                ? "sub-menu-item-active"
                : "hover:bg-primaryhover dark:hover:bg-none",
            )}
            prefetch
            style={{ paddingLeft }}
            onClick={() => setIsOpen(false)}
          >
            <span className="mr-3 transition-transform duration-200 flex-shrink-0 flex items-center">
              {renderItemIcon(item, isActive, iconClass)}
            </span>
            <span
              className={cn(
                "flex-1 list-item-text text-[16px] font-medium transition-colors duration-200",
                isActive
                  ? "text-primarycolor hover:text-primarycolor dark:text-white dark:hover:text-white"
                  : "text-sidebarlinkcolor group-hover:text-white dark:text-white/70 dark:group-hover:text-white",
              )}
            >
              {t(getNavItemLabelKey(item.label))}
            </span>
            {item.badge && (
              <span className="ml-2 px-2 py-1 text-[0.875] font-bold rounded-full bg-bgblue text-white">
                {item.badge}
              </span>
            )}
          </Link>
        ) : (
          <>
            <button
              type="button"
              className={cn(
                "group flex items-center px-3 py-3 rounded-[5px] cursor-pointer sidebar-menu-item w-full text-left transition-all duration-200 hover:bg-primaryhover hover:text-white dark:hover:bg-primaryhover",
                isActive &&
                  "bg-transparent hover:bg-primaryhover dark:hover:bg-none",
              )}
              style={{ paddingLeft }}
              onClick={() => toggleExpand(item.label)}
            >
              <span className="mr-3 transition-transform duration-200 flex-shrink-0 flex items-center">
                {renderItemIcon(item, isActive, iconClass)}
              </span>
              <span
                className={cn(
                  "flex-1 text-[16px] font-medium transition-colors duration-200",
                  isActive
                    ? "text-primarycolor dark:text-white"
                    : "text-sidebarlinkcolor dark:text-white/70",
                  "group-hover:text-white",
                )}
              >
                {t(getNavItemLabelKey(item.label))}
              </span>
              {isExpandable && (
                <div className="ml-2 transition-transform duration-200">
                  {expanded[item.label] ? (
                    <ChevronDown size={16} className={iconClass} />
                  ) : (
                    <ChevronRight size={16} className={iconClass} />
                  )}
                </div>
              )}
            </button>
            {isExpandable && expanded[item.label] && (
              <ul className="mt-1">
                {item.children?.map((child) => renderNavItem(child, depth + 1))}
              </ul>
            )}
          </>
        )}
      </li>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed top-[28px] left-4 z-50 p-2 rounded-lg bg-bgwhite shadow-lg lg:hidden hover:bg-gray-50 transition-colors duration-200"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bgbgblack bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 cursor-default"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
          tabIndex={-1}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-72 transform transition-all duration-300 ease-in-out bg-bgprimary dark:bg-darkbgprimary",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="p-[30px_48px_0px_48px] lg:p-[20px_26px_18px]">
          <div
            onClick={() => router.push(ROUTES.DASHBOARD_ANALYTICS)}
            className="flex items-center justify-center"
          >
            <Image
              src={
                (mounted &&
                  resolvedTheme === THEME_TYPE.DARK &&
                  RayptoLogoDark.src) ||
                RayptoLogoDark.src
              }
              width={164}
              height={52}
              alt="logo"
              className="max-h-20 max-w-[70%] w-full"
            />
          </div>
        </div>

        <nav className="p-[7px] pt-[20px] lg:px-9 lg:py-4 h-[calc(100vh-128px)] overflow-y-auto custom-scrollbar">
          {/* Search Bar */}
          <div className="relative mt-2 mb-3 mx-[4px] block lg:hidden">
            <Search
              className="absolute left-[15px] top-1/2 transform -translate-y-1/2 text-textprimary dark:text-secondary"
              size={18}
            />
            <input
              type="text"
              placeholder="Search (Ctrl + K)"
              onClick={() => setShowCommandPalette(true)}
              className="pl-10 pr-4 py-2 w-full border border-bordergray200 rounded-[8px] bg-bgwhite dark:bg-darkbgprimary dark:border-labelprimary text-sm focus:outline-none"
            />
          </div>
          <ul>{navItems.map((item) => renderNavItem(item))}</ul>
        </nav>
      </aside>
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
    </>
  );
};

export default Sidebar;
