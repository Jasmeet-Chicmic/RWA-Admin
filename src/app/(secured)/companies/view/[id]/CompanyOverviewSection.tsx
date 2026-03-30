import { AdminCompanyDetail } from "@/app/(secured)/companies/helpers/types";
import StatCard from "@/components/atoms/StatCard";
import { getSafeText } from "@/shared/utils";

interface CompanyOverviewSectionProps {
  company: AdminCompanyDetail;
  mainstats: {
    title: string;
    value: number | null | undefined;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
  }[];
  t: (key: string) => string;
}

const CompanyOverviewSection = ({
  company,
  mainstats,
  t,
}: CompanyOverviewSectionProps) => {
  return (
    <>
      {/* About */}
      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6">
        <h2 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext mb-2">
          {t("aboutCompany")}
        </h2>
        <p className="text-sm leading-relaxed text-textparagraph dark:text-textparagraphlight whitespace-pre-line">
          {getSafeText(company.description, t("notAvailable"))}
        </p>
      </div>

      {/* Additional info */}
      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6">
        <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext mb-2">
          {t("companyInformation")}
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="text-[16px] mb-1 font-medium text-textprimary dark:text-sidebartext">
              {t("industry")}
            </dt>
            <dd className="text-[14px] text-textparagraph dark:text-textparagraphlight">
              {getSafeText(company.industry, t("notAvailable"))}
            </dd>
          </div>
          <div>
            <dt className="text-[16px] mb-1 font-medium text-textprimary dark:text-sidebartext">
              {t("location")}
            </dt>
            <dd className="text-[14px] text-textparagraph dark:text-textparagraphlight">
              {getSafeText(company.location, t("notAvailable"))}
            </dd>
          </div>
          <div>
            <dt className="text-[16px] mb-1 font-medium text-textprimary dark:text-sidebartext">
              {t("website")}
            </dt>
            <dd className="text-[14px] text-textparagraph dark:text-textparagraphlight">
              {getSafeText(company.website, t("notAvailable"))}
            </dd>
          </div>
          <div>
            <dt className="text-[16px] mb-1 font-medium text-textprimary dark:text-sidebartext">
              {t("status")}
            </dt>
            <dd className="text-[14px] text-textparagraph dark:text-textparagraphlight">
              {company.isActive ? t("active") : t("inactive")}
            </dd>
          </div>
          <div>
            <dt className="text-[16px] mb-1 font-medium text-textprimary dark:text-sidebartext">
              {t("companySize")}
            </dt>
            <dd className="text-[14px] text-textparagraph dark:text-textparagraphlight">
              {getSafeText(company.companySize, t("notAvailable"))}
            </dd>
          </div>
          <div>
            <dt className="text-[16px] mb-1 font-medium text-textprimary dark:text-sidebartext">
              {t("annualRevenue")}
            </dt>
            <dd className="text-[14px] text-textparagraph dark:text-textparagraphlight">
              {getSafeText(company.annualRevenue, t("notAvailable"))}
            </dd>
          </div>
        </dl>
      </div>

      {/* High-level stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {mainstats.map((stat, index) => (
          <StatCard
            key={stat.title}
            stat={{
              ...stat,
              index,
              value: stat.value ?? 0,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default CompanyOverviewSection;
