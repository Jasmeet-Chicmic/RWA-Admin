"use client";

import { useState, useCallback } from "react";
import RewardConfigForm from "./RewardConfigForm";
import ChatTranslationConfigForm from "./ChatTranslationConfigForm";
import ReferralConfigForm from "./ReferralConfigForm";
import type { RewardConfig } from "./page";
import DefaultFeaturesTable from "./DefaultFeaturesTable";
import { PaginatedDataType, SystemFeature } from "@/shared/types";

interface ConfigTabsProps {
  rewardConfig: RewardConfig | null;
  chatTranslationConfig: RewardConfig | null;
  referralConfig: RewardConfig | null;
  defaultFeatures: PaginatedDataType<SystemFeature> | null;
}

const CONFIG_TABS = {
  REWARDS: "rewards",
  REFERRAL: "referral",
  CHAT_TRANSLATION: "chat-translation",
  DEFAULT_FEATURES: "default-features",
} as const;

const ConfigTabs = ({
  rewardConfig,
  chatTranslationConfig,
  referralConfig,
  defaultFeatures,
}: ConfigTabsProps) => {
  const [currentTab, setCurrentTab] = useState<string>(CONFIG_TABS.REWARDS);

  const tabs = [
    { id: CONFIG_TABS.REWARDS, label: "Rewards" },
    { id: CONFIG_TABS.REFERRAL, label: "Referral" },
    // { id: CONFIG_TABS.CHAT_TRANSLATION, label: "Chat Translation" },
    { id: CONFIG_TABS.DEFAULT_FEATURES, label: "Default Features" },
  ];

  const renderTabContent = useCallback(() => {
    switch (currentTab) {
      case CONFIG_TABS.REWARDS:
        return <RewardConfigForm initialConfig={rewardConfig} />;
      case CONFIG_TABS.REFERRAL:
        return <ReferralConfigForm initialConfig={referralConfig} />;
      case CONFIG_TABS.CHAT_TRANSLATION:
        return (
          <ChatTranslationConfigForm initialConfig={chatTranslationConfig} />
        );
      case CONFIG_TABS.DEFAULT_FEATURES:
        return (
          <DefaultFeaturesTable
            data={defaultFeatures?.items ?? []}
            totalCount={defaultFeatures?.totalCount ?? 0}
          />
        );
      default:
        return null;
    }
  }, [
    currentTab,
    rewardConfig,
    referralConfig,
    chatTranslationConfig,
    defaultFeatures,
  ]);

  return (
    <div>
      {/* Header with Tabs */}
      <div className="bg-bgwhite rounded-t-[12px] dark:bg-darkbgprimary dark:border-darkbordercolor1">
        <div className="p-6 dark:border-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-textprimary dark:text-bgwhite">
                Configurations
              </h2>
              {/* <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                Manage system configurations and settings
              </p> */}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-6 border-b border-bordercolor1 dark:border-bordercolor2/80">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`relative px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                currentTab === tab.id
                  ? "text-primarycolor dark:text-secondarycolor"
                  : "text-sidebartext hover:text-gray-600 dark:text-gray-500 dark:hover:text-darklabelprimary"
              }`}
            >
              <span className="relative z-10">{tab.label}</span>
              {currentTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primarycolor dark:bg-secondarycolor rounded-t-full shadow-[0_-1px_10px_rgba(67,24,255,0.3)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-bgwhite rounded-b-[20px] dark:bg-darkbgprimary dark:border-darkbordercolor1">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ConfigTabs;
