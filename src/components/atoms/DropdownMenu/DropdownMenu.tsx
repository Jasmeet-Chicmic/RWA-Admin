"use client";

import { EllipsisVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ListingOptionType } from "./utils/types";

interface DropdownMenuProps {
  options: ListingOptionType[];
  onSelect?: (value: number) => void;
}

const DropdownMenu = ({ options, onSelect }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition dark:hover:bg-gray-800"
      >
        <EllipsisVertical className="w-5 h-5 text-gray-500 dark:bordercolor1" />
      </button>

      {/* Dropdown content */}
      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-bgwhite rounded shadow-lg border border-bordergray100 z-10 dark:bg-darkbgprimary dark:border-darkbordercolor1">
          <ul className="py-1 text-sm text-labelprimary dark:bordercolor1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect?.(option.value);
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-800"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
