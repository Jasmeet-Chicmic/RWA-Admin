import React, { ReactNode } from "react";

export interface StatCardProps {
  title?: string;
  value?: string | number | ReactNode;
  change?: string;
  changeColor?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string; // This corresponds to iconBgColor
  index?: number;
  titleVariant?: "default" | "lg";
}

const StatCard: React.FC<
  StatCardProps & {
    stat?: Partial<StatCardProps & { bgColor?: string; iconBgColor?: string }>;
  }
> = ({
  title,
  value,
  change,
  changeColor = "text-green-500",
  subtitle,
  icon,
  color,
  index,
  titleVariant = "default",
  stat, // Handle legacy object wrapper
}) => {
  // Extract values from legacy 'stat' object if present
  const displayTitle = title ?? stat?.title;
  const displayValue = value ?? stat?.value;
  const displaySubtitle = subtitle ?? stat?.subtitle;
  const displayIcon = icon ?? stat?.icon;
  const displayColor =
    color ?? stat?.color ?? stat?.bgColor ?? stat?.iconBgColor;
  const displayChange = change ?? stat?.change;
  const displayChangeColor = changeColor ?? stat?.changeColor;
  const titleClass =
    titleVariant === "lg"
      ? "text-[18px] lg:text-[20px] font-bold text-textprimary dark:text-bgwhite leading-normal"
      : "text-[0.875rem] font-medium text-textparagraph dark:text-darktextparagraphlight";
  return (
    <div
      key={index}
      className="bg-bgwhite dark:bg-darkbgprimary dark:border-darkbordercolor1 border border-b border-bordergray200ordercolor1 rounded-[20px] p-3 lg:p-4 3xl:p-6 transition-all duration-300 shadow-sm [&_svg]:transition-colors [&_svg]:duration-300"
    >
      <div className="flex flex-col items-center gap-2 h-full">
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex">
            {displayTitle && (
              <p
                className={`${titleClass} mb-0 group-hover:!text-bgwhite transition-colors duration-300`}
              >
                {displayTitle}
              </p>
            )}
          </div>
          <div className="flex">
            {displayIcon && (
              <div
                className={`w-8 h-8 lg:w-10 lg:h-10 3xl:w-14 3xl:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                  displayColor || "bg-gray-100 dark:bg-darkbgprimary"
                } group-hover:bg-bgwhite group-hover:text-bgpurple1 [&_svg]:group-hover:!text-bgpurple1`}
              >
                {displayIcon}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col w-full mt-auto">
          {displayValue !== undefined && (
            <h3 className="text-[1.25rem] md:text-[1.5rem] lg:text-[1.75rem] leading-tight font-bold text-darkbordercolor1 dark:text-bgwhite group-hover:!text-bgwhite transition-colors duration-300">
              {displayValue}
            </h3>
          )}
          {displayChange && (
            <span
              className={`text-sm font-medium ${displayChangeColor} group-hover:!text-bgwhite transition-colors duration-300`}
            >
              {displayChange}
            </span>
          )}
          {displaySubtitle && (
            <p className="text-[0.8rem] font-medium text-textparagraphlight dark:text-textparagraphlight mb-0 group-hover:!text-bgwhite transition-colors duration-300">
              {displaySubtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
