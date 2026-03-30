"use client";

import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

type UserIndustry = {
  industryId: string;
  industryName?: string | null;
  subIndustryNames?: string[] | null;
};

type Props = {
  industriesList: UserIndustry[];
};

export function IndustriesSection({ industriesList }: Props) {
  const t = useTranslations("users");
  return (
    <div className="bg-bgwhite rounded-lg shadow p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1 border border-bordercolor1">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-primarycolor dark:text-white" />
        <h3 className="text-lg font-semibold text-textprimary dark:text-sidebartext">
          {t("industries")}
        </h3>
      </div>
      {industriesList.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("noIndustriesInformationAvailable")}
        </p>
      ) : (
        <div className="max-h-[300px] overflow-y-auto space-y-3">
          {industriesList.map((industry) => (
            <div
              key={industry.industryId}
              className="border border-bordercolor1 dark:border-darkbordercolor1 rounded-lg p-3"
            >
              <p className="text-sm font-semibold text-textprimary dark:text-sidebartext">
                {industry.industryName}
              </p>
              {Array.isArray(industry.subIndustryNames) &&
                industry.subIndustryNames.length > 0 && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">
                      {t("subIndustries")}
                      {": "}
                    </span>
                    {industry.subIndustryNames.join(", ")}
                  </p>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
