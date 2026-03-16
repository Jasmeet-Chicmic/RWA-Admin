import { ReactNode } from "react";

import StatCard from "@/components/atoms/StatCard";

export interface ProfileStat {
  title: string;
  value: number | string | ReactNode;
  subtitle?: string;
  icon: ReactNode;
  color: string;
}

interface ProfilePageLayoutProps {
  leftPanel: ReactNode;
  stats?: ProfileStat[];
  headerTabs?: ReactNode;
  extraStatsContent?: ReactNode;
  children: ReactNode;
}

const ProfilePageLayout = ({
  leftPanel,
  stats,
  headerTabs,
  extraStatsContent,
  children,
}: ProfilePageLayoutProps) => {
  return (
    <div className="p-0 flex flex-col sxm:flex-row gap-3 md:gap-6 mt-[20px] items-start">
      {/* Left column: profile / summary card */}
      <div className="w-full sxm:w-[30%] 3xl:w-[400px] flex-shrink-0 sxm:sticky top-[20px]">
        {leftPanel}
      </div>

      {/* Right column: stats + content */}
      <div className="flex-1 flex flex-col gap-3 md:gap-4 min-w-0 overflow-hidden w-full">
        {(stats?.length || extraStatsContent) && (
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-0 mb-0 md:mb-2">
            {stats?.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} />
            ))}
            {extraStatsContent}
          </div>
        )}
        {headerTabs}
        {children}
      </div>
    </div>
  );
};

export default ProfilePageLayout;
