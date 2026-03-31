"use client";

import React, { useEffect, useRef, useState } from "react";

export type ActionMenuItem = {
  id: string;
  label: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

type ActionMenuProps = {
  trigger: React.ReactNode;
  items: ActionMenuItem[];
  ariaLabel?: string;
};

const ActionMenu = ({
  trigger,
  items,
  ariaLabel = "Action menu",
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    const updateMenuPosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuWidth = 180;
      const viewportPadding = 8;
      const left = Math.max(viewportPadding, rect.right - menuWidth);
      const top = rect.bottom + 8;
      setMenuPosition({ top, left });
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    updateMenuPosition();

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {trigger}
      </button>
      {isOpen && (
        <ul
          style={{ top: menuPosition.top, left: menuPosition.left }}
          className="fixed z-[1000] min-w-[180px] overflow-auto rounded-lg border border-bordergray200 bg-bgwhite p-1.5 shadow-lg focus:outline-none dark:border-darkbordercolor1 dark:bg-darkbgprimary"
        >
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-all hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-100 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-labelprimary dark:focus:bg-labelprimary dark:active:bg-labelprimary ${
                  item.className || "text-textprimary dark:text-sidebartext"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActionMenu;
