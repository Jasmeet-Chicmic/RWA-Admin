import StatCard from "@/components/atoms/StatCard";

interface CompanyPerformanceSidebarProps {
  stats: {
    title: string;
    value: number | null | undefined;
    subtitle: string;
    icon: JSX.Element;
    color: string;
  }[];
  t: (key: string) => string;
}

const CompanyPerformanceSidebar = ({
  stats,
  t,
}: CompanyPerformanceSidebarProps) => {
  return (
    <div className="space-y-4 sticky top-[20px]">
      <h3 className="text-base font-semibold text-textprimary dark:text-sidebartext">
        {t("Company performance")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
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
    </div>
  );
};

export default CompanyPerformanceSidebar;
