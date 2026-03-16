import { ReactNode } from "react";

export interface ProfileCardRow {
  icon: ReactNode;
  label: string;
  value: ReactNode | string;
}

interface ProfileCardShellProps {
  avatar: ReactNode;
  title: string;
  subtitle?: string;
  statusSection?: ReactNode;
  rows: ProfileCardRow[];
}

const ProfileCardShell = ({
  avatar,
  title,
  subtitle,
  statusSection,
  rows,
}: ProfileCardShellProps) => {
  return (
    <div className="bg-bgwhite dark:bg-darkbgprimary rounded-[20px] w-full 3xl:w-[400px] shadow-[0_0_10px_0_rgba(0,0,0,0.025)] border border-bordercolor1 dark:border-darkbordercolor1 transition-all duration-300 p-0 w-full overflow-hidden">
      {/* Top section */}
      <div className="flex flex-col items-center text-center mb-0 p-5 md:p-8 md:pb-6">
        {/* Avatar */}
        <div className="relative mb-2 md:mb-4 3xl:mb-6">{avatar}</div>

        {/* Title */}
        <h3 className="text-[1.25rem] 3xl:text-[2rem] leading-tight font-bold text-textprimary dark:text-sidebartext mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-[14px] md:text-[0.95rem] font-medium text-bgblack dark:text-sidebartext/80 mb-1 line-clamp-2 w-full trancate">
            {subtitle}
          </p>
        )}

        {/* Status / extra meta */}
        {statusSection}
      </div>

      {/* Bottom rows */}
      <div className="space-y-3 bg-sidebarlinkcolor50 dark:bg-darkbgsecondary p-5 md:px-5 md:py-6">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex flex-row sxm:flex-col llg:flex-row items-center sxm:items-start llg:items-center gap-2 llg:gap-3 p-0 md:p-3 bg-transparent"
          >
            <div className="p-0">{row.icon}</div>
            <div className="flex-1 min-w-0 w-full">
              <p className="text-[14px] md:text-[16px] font-medium text-bgblack dark:text-sidebartext/60 capitalize tracking-wide">
                {row.label}
              </p>
              <p className="text-[12px] md:text-[14px] font-semibold text-textprimary dark:text-sidebartext truncate">
                {row.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileCardShell;
