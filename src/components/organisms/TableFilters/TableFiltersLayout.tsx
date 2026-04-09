"use client";

import { ReactNode } from "react";

import { cn } from "@/shared/utils";

export const TABLE_FILTER_LABEL_CLASS =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-textparagraph dark:text-textparagraphlight";

type TableFiltersLayoutProps = {
  children: ReactNode;
  variant?: "inline" | "sidebar";
  className?: string;
};

export const TableFiltersLayout = ({
  children,
  variant = "inline",
  className,
}: TableFiltersLayoutProps) => {
  if (variant === "sidebar") {
    return <div className={cn("space-y-5", className)}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-bordergray200 bg-bgwhite p-3 dark:border-darkbordercolor1 dark:bg-darkbgprimary/70",
        className,
      )}
    >
      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 xl:grid-cols-4">
        {children}
      </div>
    </div>
  );
};

type TableFilterFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
};

export const TableFilterField = ({
  label,
  htmlFor,
  children,
  className,
}: TableFilterFieldProps) => (
  <div className={className}>
    <label htmlFor={htmlFor} className={TABLE_FILTER_LABEL_CLASS}>
      {label}
    </label>
    {children}
  </div>
);
