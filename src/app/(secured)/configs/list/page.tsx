import { getConfigAction, RewardConfig } from "@/api/config";
import { CONFIG_TYPE } from "@/shared/constants";
import ConfigTabs from "./ConfigTabs";

const ConfigsPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const {
    searchText = "",
    skip = "0",
    limit = "10",
  } = (await searchParams) as Record<string, string>;

  // Fetch all configs separately - each type has its own data
  const rewardConfigData = await getConfigAction({ type: CONFIG_TYPE.REWARDS });
  const chatTranslationConfigData = await getConfigAction({
    type: CONFIG_TYPE.CHAT_TRANSLATION,
  });
  const referralConfigData = await getConfigAction({
    type: CONFIG_TYPE.REFERRAL,
  });

  const { getDefaultFeaturesAction } = await import("@/api/features");
  const defaultFeaturesData = await getDefaultFeaturesAction(
    Number(skip),
    Number(limit),
    searchText,
  );

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <ConfigTabs
        rewardConfig={rewardConfigData?.data || null}
        chatTranslationConfig={chatTranslationConfigData?.data || null}
        referralConfig={referralConfigData?.data || null}
        defaultFeatures={defaultFeaturesData?.data || null}
      />
    </div>
  );
};

export default ConfigsPage;

export type { RewardConfig };
