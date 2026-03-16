"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { CURRENCY_TYPE_NAMES } from "@/shared/constants";
import Select from "@/components/atoms/Select";
import { formatCurrency } from "@/shared/utils";

interface CurrencyGGR {
  currency: number;
  amount: number;
}

interface GGRStatCardProps {
  stats: CurrencyGGR[];
  title?: string;
  color?: string;
}

interface CurrencyOption {
  label: string;
  value: number;
}

const GGRStatCard: React.FC<GGRStatCardProps> = ({
  stats,
  title = "Gross Gaming Revenue",
  color = "bg-primarycolor dark:bg-secondarycolor",
}) => {
  const currencyOptions: CurrencyOption[] = useMemo(
    () =>
      stats.map((stat) => ({
        label:
          CURRENCY_TYPE_NAMES[stat.currency] || `Currency ${stat.currency}`,
        value: stat.currency,
      })),
    [stats],
  );

  const [selectedOption, setSelectedOption] = useState<CurrencyOption | null>(
    currencyOptions[0] || null,
  );

  const selectedStat = stats.find((s) => s.currency === selectedOption?.value);
  const ggrValue = selectedStat?.amount || 0;

  return (
    <div className="bg-bgwhite border border-b border-bordergray200ordercolor1 shadow-sm dark:bg-darkbgprimary dark:border-darkbordercolor1 rounded-[20px] p-6 transition-all duration-300 [&_svg]:transition-colors [&_svg]:duration-300">
      <div className="flex flex-col w-full items-center justify-between">
        <div className="flex w-full items-center justify-between">
          <div className="flex">
            <p className="text-[0.875rem] font-medium text-[#364153] dark:text-[#D1D5D0] mb-0 group-hover:!text-bgwhite transition-colors duration-300">
              {title}
            </p>
          </div>
          <div className="flex flex-col">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${color} text-bgwhite dark:text-bgblack group-hover:bg-bgwhite [&_svg]:group-hover:!text-bgpurple1`}
            >
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-start flex-col justify-between">
            <h3 className="text-[1.5rem] lg:text-[1.75rem] font-bold text-darkbordercolor1 dark:text-bgwhite group-hover:!text-bgwhite transition-colors duration-300">
              {formatCurrency(ggrValue)}
            </h3>
            <p className="text-[0.8rem] font-medium text-textparagraphlight dark:text-textparagraphlight mb-0 group-hover:!text-bgwhite transition-colors duration-300">
              {selectedOption?.label || "Selected currency"} GGR
            </p>
          </div>
          <div className="flex items-center justify-between">
            {/* Currency Select Dropdown */}
            <div className="w-32 group-hover:opacity-90 transition-opacity">
              <Select
                value={selectedOption}
                onChange={(option) =>
                  setSelectedOption(option as CurrencyOption | null)
                }
                options={currencyOptions}
                isClearable={false}
                placeholder="Currency"
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GGRStatCard;
