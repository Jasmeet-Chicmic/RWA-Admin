import Image from "next/image";

import { Building2, Globe2, MapPin } from "lucide-react";

import { AdminCompanyDetail } from "@/app/(secured)/companies/helpers/types";
import { buildImageUrl } from "@/shared/utils";
import FormattedDate from "@/components/atoms/FormattedDate";

interface CompanyHeaderSectionProps {
  company: AdminCompanyDetail;
  t: (key: string) => string;
}

const CompanyHeaderSection = ({ company, t }: CompanyHeaderSectionProps) => {
  return (
    <div className="bg-bgwhite dark:bg-darkbgprimary rounded-[20px] border border-bordercolor1 dark:border-darkbordercolor1 shadow-sm">
      {/* Cover */}
      <div className="relative h-[300px] md:h-[400px] w-full bg-gradient-to-r from-primarycolor/60 to-secondarycolor/60 dark:from-primarycolor/40 dark:to-secondarycolor/40 overflow-hidden rounded-t-[20px]">
        {company.coverPicture && (
          <Image
            src={buildImageUrl(company.coverPicture)}
            alt={company.name}
            fill
            className="object-cover"
          />
        )}
        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="px-4 pb-6 -mt-10 md:-mt-12 relative z-10">
        <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl shadow-md px-4 py-4 md:px-[30px] md:py-[40px] flex flex-col md:flex-row md:items-start gap-[30px]">
          {/* Logo */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-bgwhite dark:border-darkbgprimary overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow">
            {company.logoPicture ? (
              <Image
                src={buildImageUrl(company.logoPicture)}
                alt={company.name}
                fill
                className="object-cover"
              />
            ) : (
              <Building2 className="w-10 h-10 text-primarycolor dark:text-secondarycolor" />
            )}
          </div>

          {/* Title & meta */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-textprimary dark:text-sidebartext">
                  {company.name}
                </h1>
                {company.tagLine && (
                  <p className="text-sm md:text-base text-textparagraph dark:text-textparagraphlight mt-1">
                    {company.tagLine}
                  </p>
                )}
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    company.isActive
                      ? "bg-green-50 text- dark:text-white"
                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current mr-2" />
                  {company.isActive ? t("Active") : t("Inactive")}
                </span>

                {company.isSuspended && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    {t("Suspended")}
                  </span>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs md:text-sm text-textparagraph dark:text-textparagraphlight">
              {company.industry && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 opacity-70" />
                  <span>{company.industry}</span>
                </div>
              )}
              {company.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 opacity-70" />
                  <span>{company.location}</span>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-2 w-full text-primarycolor">
                  <Globe2 className="w-6 h-6 opacity-70" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-secondarycolor dark:hover:text-secondarycolor"
                  >
                    {company.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-bgblack/60 mt-2">
                <span className="font-medium">{t("Joined on")}:</span>
                <FormattedDate date={company.createdOn} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHeaderSection;
