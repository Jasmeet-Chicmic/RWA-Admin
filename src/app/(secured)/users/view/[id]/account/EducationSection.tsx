"use client";

import Image from "next/image";
import { GraduationCap, Calendar, Award } from "lucide-react";
import { Education } from "@/shared/types";
import { buildImageUrl, formatMonthYear } from "@/shared/utils";
import { useTranslations } from "next-intl";
import SeeMore from "@/components/atoms/SeeMore";

type Props = {
  educationList: Education[];
};

export function EducationSection({ educationList }: Props) {
  const t = useTranslations("users");
  const formatEducationDate = (dateString: string | null) =>
    formatMonthYear(dateString, t("N/A"));

  return (
    <div className="bg-bgwhite rounded-lg shadow p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1 border border-bordercolor1">
      <div className="flex items-center gap-2 mb-6">
        <GraduationCap className="w-5 h-5 text-primarycolor dark:text-white" />
        <h3 className="text-lg font-semibold text-textprimary dark:text-sidebartext">
          {t("Education")}
        </h3>
      </div>

      {educationList.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t("No education information available")}</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
          {educationList.map((edu) => (
            <div
              key={edu.id}
              className="border border-bordercolor1 dark:border-darkbordercolor1 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {edu.logoUrl ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 relative">
                    <Image
                      src={buildImageUrl(edu.logoUrl)}
                      alt={edu.school}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-primarycolor/10 dark:bg-secondarycolor/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-8 h-8 text-primarycolor dark:text-secondarycolor" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-textprimary dark:text-sidebartext mb-1">
                    {edu.school}
                  </h4>

                  <div className="space-y-2 mt-2">
                    {(edu.degree || edu.fieldOfStudy) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Award className="w-4 h-4" />
                        <span>
                          {(() => {
                            const degree = (edu.degree || "").trim();
                            const field = (edu.fieldOfStudy || "").trim();
                            if (degree && field) {
                              return degree.toLowerCase() ===
                                field.toLowerCase()
                                ? degree
                                : `${degree} - ${field}`;
                            }
                            return degree || field;
                          })()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatEducationDate(edu.startDate)}
                          {edu.endDate &&
                            ` - ${formatEducationDate(edu.endDate)}`}
                          {!edu.endDate && ` - ${t("Present")}`}
                        </span>
                      </div>
                    </div>

                    {edu.grade && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">
                          {t("Grade")}
                          {": "}
                        </span>
                        {edu.grade}
                      </div>
                    )}

                    {edu.description && (
                      <div className="mt-2">
                        <SeeMore description={edu.description} maxLines={2} />
                      </div>
                    )}
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
