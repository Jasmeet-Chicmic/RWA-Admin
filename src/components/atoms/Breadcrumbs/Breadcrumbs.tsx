"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  isClickableLastLink?: boolean;
};

type BreadcrumbsProps = {
  id: string;
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  ariaLabel: string;
  className?: string;
};

const Breadcrumbs = ({
  id,
  items,
  separator,
  ariaLabel,
  className = "",
}: BreadcrumbsProps) => {
  const router = useRouter();

  return (
    <nav
      id={id}
      aria-label={ariaLabel}
      className={`flex flex-wrap items-center gap-1 text-xs ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isClickable =
          Boolean(item.href) && (item.isClickableLastLink || !isLast);

        return (
          <span
            key={`${item.label}-${item.href ?? index}`}
            className="inline-flex items-center gap-1"
          >
            {isClickable ? (
              <button
                type="button"
                onClick={() => {
                  if (item.href) router.push(item.href);
                }}
                className="text-textparagraph hover:text-textprimary dark:text-textparagraphlight dark:hover:text-white transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-textprimary dark:text-white">
                {item.label}
              </span>
            )}
            {!isLast &&
              (separator ?? (
                <ChevronRight
                  size={13}
                  className="text-textparagraph dark:text-textparagraphlight"
                />
              ))}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
