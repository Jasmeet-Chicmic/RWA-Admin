"use client";

import { Calendar, Briefcase } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatMonthYear } from "@/shared/utils";
import SeeMore from "@/components/atoms/SeeMore";

type WorkHistory = {
  id: string;
  company?: string | null;
  designation?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

type Props = {
  workHistoryList: WorkHistory[];
};

export function WorkHistorySection({ workHistoryList }: Props) {
  const t = useTranslations("users");
  const formatEducationDate = (dateString: string | null) =>
    formatMonthYear(dateString, t("N/A"));
  return (
    <div className="bg-bgwhite rounded-lg shadow p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1 border border-bordercolor1">
      <div className="flex items-center gap-2 mb-6">
        <Briefcase className="w-5 h-5 text-primarycolor dark:text-white" />
        <h3 className="text-lg font-semibold text-textprimary dark:text-sidebartext">
          {t("Work History")}
        </h3>
      </div>

      {workHistoryList.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t("No work history information available")}</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
          {workHistoryList.map((job) => (
            <div
              key={job.id}
              className="border border-bordercolor1 dark:border-darkbordercolor1 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primarycolor/10 dark:bg-secondarycolor/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-primarycolor dark:text-secondarycolor" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-base font-semibold text-textprimary dark:text-sidebartext">
                    {job.company}
                  </h4>
                  {job.designation && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {job.designation}
                    </p>
                  )}
                  {job.location && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <SeeMore
                        description={job.location}
                        maxLines={1}
                        className="text-xs"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {formatEducationDate(job.startDate ?? null)}
                      {job.endDate
                        ? ` - ${formatEducationDate(job.endDate ?? null)}`
                        : ` - ${t("Present")}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
