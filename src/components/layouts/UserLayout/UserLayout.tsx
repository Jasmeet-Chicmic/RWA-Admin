import { ReactNode } from "react";
import { Gamepad2, TrendingUp, UserPlus2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

// import PlanDetailsCard from "@/components/molecules/user/PlanDetailsCard";
import UserProfileCard from "@/components/molecules/user/UserProfileCard";
import UserTabs from "@/components/molecules/user/UserTabs/UserTabs";
import { User, UserSubscription } from "@/shared/types";
// import { formatCurrency } from "@/shared/utils";
import GGRStatCard from "@/components/molecules/GGRStatCard";
import ProfilePageLayout, {
  ProfileStat,
} from "@/components/layouts/ProfilePageLayout/ProfilePageLayout";

interface CurrencyGGR {
  currency: number;
  amount: number;
}

interface UserStats {
  totalBetCount: number;
  totalBetAmount: CurrencyGGR[];
  uniqueGamesPlayed: number;
  grossGamingRevenue: CurrencyGGR[];
  referralEarnedAmount: CurrencyGGR[];
  promotionEarnedAmount: CurrencyGGR[];
}

interface UserLayoutProps {
  children: ReactNode;
  data: User;
  currentSubscription?: UserSubscription;
  statsData?: UserStats;
}

const UserLayout = async ({
  children,
  data,
  // currentSubscription,
  statsData,
}: UserLayoutProps) => {
  const t = await getTranslations("users");

  const userStats: ProfileStat[] = [
    {
      title: t("connections"),
      value: data.connectionCount ?? 0,
      // subtitle: t("totalConnections"),
      icon: <Gamepad2 className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    {
      title: t("following"),
      value: data.followingCount ?? 0,
      // subtitle: t("totalFollowing"),
      icon: <UserPlus2 className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    // {
    //   title: "Total Bet Amount",
    //   value: formatCurrency(statsData?.totalBetAmount || 0),
    //   subtitle: "All time",
    //   icon: <DollarSign className="w-6 h-6 text-[#4318FF]" />,
    //   color: "bg-bordercolor1 dark:bg-emerald-900/30",
    // },
    {
      title: t("followers"),
      value: data.followerCount ?? 0,
      // subtitle: t("totalFollowers"),
      icon: <TrendingUp className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    // {
    //   title: "Referral Earned Amount",
    //   value: formatCurrency(statsData?.referralEarnedAmount || 0),
    //   subtitle: "All time",
    //   icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
    //   color: "bg-emerald-100 dark:bg-emerald-900/30",
    // },
    // {
    //   title: "Promotion & Reward Earned",
    //   value: formatCurrency(statsData?.promotionEarnedAmount || 0),
    //   subtitle: "All time",
    //   icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
    //   color: "bg-emerald-100 dark:bg-emerald-900/30",
    // },
  ];

  const extraStatsContent =
    statsData &&
    (statsData.grossGamingRevenue?.length ||
      statsData.totalBetAmount?.length) ? (
      <>
        {statsData.grossGamingRevenue &&
          statsData.grossGamingRevenue.length > 0 && (
            <GGRStatCard stats={statsData.grossGamingRevenue} />
          )}
        {statsData.totalBetAmount && statsData.totalBetAmount.length > 0 && (
          <GGRStatCard
            stats={statsData.totalBetAmount}
            title="Total Bet Amount"
          />
        )}
      </>
    ) : null;

  return (
    <ProfilePageLayout
      leftPanel={<UserProfileCard userData={data} />}
      stats={userStats}
      headerTabs={<UserTabs />}
      extraStatsContent={extraStatsContent}
    >
      {children}
    </ProfilePageLayout>
  );
};

export default UserLayout;
