"use client";

import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
// import "@szhsin/react-menu/dist/index.css";
// import "@szhsin/react-menu/dist/transitions/zoom.css";

import { cn } from "@/shared/utils";
import { useTheme } from "next-themes";
import { THEME_TYPE } from "@/shared/constants";

export default function CustomMenu({
  items = [],
  menuButton = "Menu",
  itemClassName,
}: Readonly<{
  items: {
    label: React.ReactNode;
    onClick: () => void | Promise<void>;
    disabled?: boolean;
  }[];
  menuButton?: React.ReactNode;
  itemClassName?: string | ((props: { hover: boolean }) => string);
}>) {
  const { resolvedTheme } = useTheme();
  const isPrimary = resolvedTheme !== THEME_TYPE.DARK;

  return (
    <Menu
      menuButton={<MenuButton>{menuButton}</MenuButton>}
      transition
      menuClassName={`z-[100] min-w-[12rem] p-1 rounded-xl border shadow-xl transition-all duration-200 ${
        isPrimary
          ? "bg-bgwhite border-bordercolor1"
          : "bg-darkbgsecondary border-labelprimary"
      }`}
    >
      {items.map((item, index) => (
        <MenuItem
          key={index}
          onClick={item.onClick}
          disabled={item.disabled}
          className={(props) =>
            cn(
              "flex items-center px-4 py-2 text-sm rounded-lg transition-colors duration-200 cursor-pointer mb-0.5 last:mb-0",
              isPrimary
                ? "text-textprimary hover:bg-gray-100"
                : "text-bgwhite hover:bg-labelprimary",
              item.disabled && "opacity-50 cursor-not-allowed",
              typeof itemClassName === "function"
                ? itemClassName(props)
                : itemClassName,
            )
          }
        >
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
}
