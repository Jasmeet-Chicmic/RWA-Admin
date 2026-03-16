import { ReactNode } from "react";

interface CompanyScrollableSectionProps {
  title: string;
  count: number;
  maxWithoutScroll?: number;
  children: ReactNode;
}

const CompanyScrollableSection = ({
  title,
  count,
  maxWithoutScroll = 4,
  children,
}: CompanyScrollableSectionProps) => {
  const shouldScroll = count > maxWithoutScroll;

  return (
    <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6">
      <h4 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext mb-2">
        {title}
      </h4>
      <div
        className={`space-y-3 ${
          shouldScroll ? "max-h-80 overflow-y-auto pr-1 custom-scrollbar" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default CompanyScrollableSection;
