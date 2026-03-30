import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CreditCard,
  Users,
  Building2,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getCompanyByIdAction } from "@/api/companies";
import { AdminCompanyDetail } from "@/app/(secured)/companies/helpers/types";
import { PRIVATE_ROUTES } from "@/shared/routes";
import CompanyHeaderSection from "./CompanyHeaderSection";
import CompanyOverviewSection from "./CompanyOverviewSection";
import CompanyTeamSection from "./CompanyTeamSection";
import CompanyRelationsSection from "./CompanyRelationsSection";
import CompanyPerformanceSidebar from "./CompanyPerformanceSidebar";

const CompanyViewPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const t = await getTranslations("companies");

  const response = await getCompanyByIdAction(id);
  const company: AdminCompanyDetail | undefined = response?.data;

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-2">
            {t("companyNotFound")}
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: t("jobs"),
      value: company.jobsCount,
      subtitle: t("totalJobs"),
      icon: <CreditCard className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    {
      title: t("content"),
      value: company.contentCount,
      subtitle: t("totalContent"),
      icon: <Building2 className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    {
      title: t("followers"),
      value: company.followersCount,
      subtitle: t("totalFollowers"),
      icon: <Users className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    {
      title: t("employees"),
      value: company.employeesCount,
      subtitle: t("totalEmployees"),
      icon: <Users className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    {
      title: t("groups"),
      value: company.groupsCount ?? company.groups?.length ?? 0,
      subtitle: t("totalGroups"),
      icon: <Users className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
  ];

  const mainstats = [
    {
      title: t("events"),
      value: company.eventsCount,
      subtitle: t("totalEvents"),
      icon: <CreditCard className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    {
      title: t("reviews"),
      value: company.reviewsCount,
      subtitle: t("totalReviews"),
      icon: <Activity className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    {
      title: t("managers"),
      value: company.managersCount ?? company.managers?.length ?? 0,
      subtitle: t("totalManagers"),
      icon: <Users className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
  ];

  return (
    <div className="space-y-6 mt-[20px]">
      {/* Back to list */}
      <div className="flex">
        <Link
          href={PRIVATE_ROUTES.COMPANIES_LIST}
          className="inline-flex items-center gap-2 text-sm font-medium text-textparagraph dark:text-textparagraphlight hover:text-primarycolor dark:hover:text-primarycolor transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("backToCompanies")}</span>
        </Link>
      </div>

      {/* Hero section */}
      <CompanyHeaderSection company={company} t={t} />

      {/* Content grid */}
      <div className="grid items-start grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
        {/* Left: description, details, team, related entities */}
        <div className="space-y-4">
          <CompanyOverviewSection
            company={company}
            mainstats={mainstats}
            t={t}
          />
          <CompanyTeamSection company={company} t={t} />
          <CompanyRelationsSection company={company} t={t} />
        </div>

        {/* Right: performance stats */}
        <CompanyPerformanceSidebar stats={stats} t={t} />
      </div>
    </div>
  );
};

export default CompanyViewPage;
