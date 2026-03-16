"use client";

import { Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import SeeMore from "@/components/atoms/SeeMore";
import SeeMoreList from "@/components/atoms/SeeMoreList";

type UserSkill = {
  id: string;
  skillName?: string | null;
};

type Props = {
  skillsList: UserSkill[];
};

export function SkillsSection({ skillsList }: Props) {
  const t = useTranslations("users");
  return (
    <div className="bg-bgwhite rounded-lg shadow p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1 border border-bordercolor1">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-primarycolor dark:text-white" />
        <h3 className="text-lg font-semibold text-textprimary dark:text-sidebartext">
          {t("Skills")}
        </h3>
      </div>
      {skillsList.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("No skills information available")}
        </p>
      ) : (
        <div className="max-h-[300px] overflow-y-auto space-y-3">
          <SeeMoreList<UserSkill>
            data={skillsList}
            initialCount={12}
            keyExtractor={(s) => s.id}
            className="flex flex-wrap gap-2"
            isButtonBlock={false}
            renderItem={(skill) => (
              <span className="inline-flex items-center rounded-full bg-primarycolor/10 text-primarycolor dark:bg-secondarycolor/10 dark:text-secondarycolor px-3 py-1 text-xs font-medium max-w-full">
                {skill.skillName ? (
                  <SeeMore
                    description={skill.skillName}
                    maxLines={1}
                    className="text-xs"
                  />
                ) : (
                  "—"
                )}
              </span>
            )}
          />
        </div>
      )}
    </div>
  );
}
