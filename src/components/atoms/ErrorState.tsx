"use client";

import { useTranslations } from "next-intl";

interface ErrorStateProps {
  title: string;
}

const ErrorState = ({ title }: ErrorStateProps) => {
  const tCommon = useTranslations("common");

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-2">
            {tCommon("ErrorState.title", { title })}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {tCommon("ErrorState.description")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
