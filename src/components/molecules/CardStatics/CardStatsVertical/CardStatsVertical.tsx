"use client";

import clsx from "clsx";
import React from "react";

type CardStatsVerticalProps = {
  stats: string | number;
  title: string;
  subtitle?: string;
  chipText?: string;
  avatarIcon?: React.ReactNode;
  avatarColor?: string; // e.g. bg-blue-100 text-blue-600
  chipColor?: string; // e.g. bg-green-100 text-green-600
  iconSize?: string; // e.g. text-xl, text-2xl
  className?: string;
};

const CardStatsVertical = ({
  stats,
  title,
  subtitle,
  chipText,
  avatarIcon,
  avatarColor = "bg-blue-100 text-blue-600",
  chipColor = "bg-green-100 text-green-600",
  iconSize = "text-xl",
  className,
}: CardStatsVerticalProps) => {
  return (
    <div
      className={clsx(
        "bg-bgwhite rounded-xl shadow-sm p-4 flex flex-col items-start dark:bg-darkbgprimary",
        className,
      )}
    >
      {avatarIcon && (
        <div
          className={clsx(
            "rounded-lg flex items-center justify-center mb-4 w-11 h-11",
            avatarColor,
          )}
        >
          <span className={iconSize}>{avatarIcon}</span>
        </div>
      )}

      <h3 className="text-title text-gray-800 dark:bordercolor1 mb-1">
        {title}
      </h3>
      {subtitle && (
        <p className="text-subtitle text-gray-500 dark:bordercolor1 mb-1">
          {subtitle}
        </p>
      )}
      <p className="text-xl font-bold text-labelprimary dark:bordercolor1 mb-4">
        {stats}
      </p>

      {chipText && (
        <span
          className={clsx(
            "text-[0.875] font-medium px-2 py-1 rounded",
            chipColor,
          )}
        >
          {chipText}
        </span>
      )}
    </div>
  );
};

export default CardStatsVertical;
