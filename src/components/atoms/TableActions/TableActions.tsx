"use client";

import { MoreVertical } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export type TableActionItem = {
  id: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

export type TableActionDisplayMode = "inline" | "dropdown";

type TableActionsProps = {
  actions: TableActionItem[];
  displayMode?: TableActionDisplayMode;
  ariaLabel?: string;
};

const TableActions = ({
  actions,
  displayMode = "inline",
  ariaLabel = "Table row actions",
}: TableActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!dropdownRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (displayMode === "inline") {
    return (
      <div
        className="flex items-center gap-2 justify-end"
        role="group"
        aria-label={ariaLabel}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={action.disabled}
            onClick={action.onClick}
            className={action.className}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center justify-center rounded-md p-2 text-textprimary hover:bg-gray-100 dark:text-sidebartext dark:hover:bg-labelprimary"
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 min-w-[180px] rounded-lg border border-bordergray200 bg-bgwhite p-1 shadow-md dark:border-darkbordercolor1 dark:bg-darkbgprimary"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              disabled={action.disabled}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-textprimary hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-sidebartext dark:hover:bg-labelprimary"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TableActions;
