"use client";

import { Circle, LucideProps, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { NavItem, navItems } from "../Sidebar/helpers/constants";

type CommandItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon:
    | React.ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
      >
    | undefined;
  action: () => void;
  category: string;
  keywords?: string[];
  shortcut?: string;
};

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  items?: NavItem[];
};

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);

  const generateNavCommands = (
    items: NavItem[],
    parentLabels: string[] = [],
  ): CommandItem[] => {
    const commands: CommandItem[] = [];

    items.forEach((item) => {
      const translatedLabel = t(item.label);
      const pathLabels = [...parentLabels, translatedLabel];
      const title = pathLabels.join(" ");
      const subtitle = pathLabels.join(" > ");

      // Add parent item if it has a path
      if (item.path) {
        commands.push({
          id: `nav-${item.path}`,
          title,
          subtitle,
          icon: item.icon,
          category: t("common.navigation"),
          action: () => router.push(item.path!),
          keywords: [
            translatedLabel.toLowerCase(),
            item.label.toLowerCase(),
            ...parentLabels.map((label) => label.toLowerCase()),
            t("common.navigation").toLowerCase(),
          ],
        });
      }

      // Add children recursively
      if (item.children) {
        commands.push(...generateNavCommands(item.children, pathLabels));
      }
    });

    return commands;
  };
  const commands: CommandItem[] = generateNavCommands(items ?? navItems);

  const filteredCommands = commands.filter((command) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const titleMatch = command.title.toLowerCase().includes(query);
    const subtitleMatch = command.subtitle?.toLowerCase().includes(query);
    const keywordMatch = command.keywords?.some((keyword) =>
      keyword.toLowerCase().includes(query),
    );

    return titleMatch || subtitleMatch || keywordMatch;
  });

  const groupedCommands = filteredCommands.reduce(
    (acc, command) => {
      if (!acc[command.category]) {
        acc[command.category] = [];
      }
      acc[command.category].push(command);
      return acc;
    },
    {} as Record<string, CommandItem[]>,
  );

  const allFilteredCommands = Object.values(groupedCommands).flat();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allFilteredCommands.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : allFilteredCommands.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (allFilteredCommands[selectedIndex]) {
            allFilteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, allFilteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close command palette"
      />
      <div
        className="relative bg-bgwhite dark:bg-darkbgprimary rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[70vh] overflow-hidden border border-bordercolor1 dark:border-darkbordercolor1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with search and close button */}
        <div className="flex items-center px-4 py-3 border-b border-bordergray200 dark:border-darkbordercolor1">
          <Search className="text-gray-500 dark:text-gray-400 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder={t("common.typeACommandOrSearch")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-gray-900 placeholder-gray-500 bg-transparent py-2 px-3 rounded-lg mr-2 dark:bg-darkbgprimary dark:text-sidebartext dark:placeholder-gray-400"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Commands List */}
        <div className="overflow-y-auto max-h-96">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-sidebartext">
              <Search
                className="mx-auto mb-3 text-darklabelprimary dark:text-sidebartext"
                size={48}
              />
              <p className="text-gray-500 dark:text-sidebartext">
                {t("common.noCommandsFound")}
              </p>
              <p className="text-sm text-gray-500 dark:text-sidebartext">
                {t("common.trySearchingForSomethingElse")}
              </p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(
              ([category, categoryCommands]) => (
                <div key={category}>
                  <div className="px-4 py-2 text-[0.875] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-bordergray200 bordergray100 dark:bg-labelprimary dark:text-sidebartext">
                    {category}
                  </div>
                  {categoryCommands.map((command) => {
                    const globalIndex = allFilteredCommands.indexOf(command);
                    const Icon = command.icon;
                    return (
                      <button
                        type="button"
                        key={command.id}
                        className={`flex items-center px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-labelprimary w-full text-left`}
                        onClick={() => {
                          command.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className={`mr-3  "bordercolor1"`}>
                          {Icon ? (
                            <Icon
                              size={20}
                              className="bordercolor1 dark:text-white"
                            />
                          ) : (
                            <Circle
                              size={10}
                              className="bordercolor1 mr-2 dark:text-white"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium text-gray-900 dark:text-sidebartext`}
                          >
                            {command.title}
                          </div>
                          {command.subtitle && (
                            <div className="text-sm text-gray-500 truncate dark:bordercolor1">
                              {command.subtitle}
                            </div>
                          )}
                        </div>
                        {command.shortcut && (
                          <div className="ml-3">
                            <kbd className="px-2 py-1 bg-gray-100 rounded text-[0.875] text-gray-600 dark:bg-labelprimary dark:text-sidebartext">
                              {command.shortcut}
                            </kbd>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
