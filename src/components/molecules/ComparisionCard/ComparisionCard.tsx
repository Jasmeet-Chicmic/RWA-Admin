import React from "react";

import { formatNumberValue } from "@/shared/utils";

type ComparisonItem = {
  label: string;
  icon: React.ReactNode;
  percent: number; // 0–100
  value: number;
  color: string; // Tailwind color class e.g. 'bg-cyan-500'
  type?: string;
};

type Props = {
  title: string;
  totalValue: string;
  changePercent?: number; // for the top-right +18.2%
  items: ComparisonItem[];
};

export default function ComparisonCard({
  title,
  totalValue,
  changePercent,
  items,
}: Props) {
  const totalPercent = items.reduce((sum, i) => sum + i.percent, 0);
  return (
    <div className="rounded-[5px] shadow-customsm bg-bgwhite p-[25px] w-full max-w-sm dark:bg-darkbgprimary">
      <div className="flex justify-between items-center mb-0">
        <div className="text-subtitle text-gray-500 dark:bordercolor1">
          {title}
        </div>
        {changePercent !== undefined && (
          <div
            className={`text-subtitle font-semibold ${changePercent >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            {changePercent >= 0 ? "+" : ""}
            {formatNumberValue(changePercent)}%
          </div>
        )}
      </div>

      <div className="text-subheading mb-[10px] dark:bordercolor1">
        {totalValue}
      </div>

      <div className="flex justify-between items-center text-center gap-y-4 mb-[10px]">
        {items.map((item, i) => (
          <>
            <div key={i}>
              <div className="flex items-center justify-center gap-2 mb-[12px] text-gray-600 dark:bordercolor1">
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div
                className={`text-lg font-semibold dark:bordercolor1 ${i % 2 !== 0 ? "text-right" : "text-left"}`}
              >
                {item.percent.toFixed(1)}%
              </div>
              <div
                className={`text-[0.875] bordercolor1 dark:bordercolor1 ${i % 2 !== 0 ? "text-right" : "text-left"}`}
              >
                {item.value.toLocaleString()}
              </div>
            </div>
            {i % 2 === 0 ? (
              <div key={`vs_${i + 1}`}>
                <div className="flex flex-col items-center justify-center h-32 gap-[3px]">
                  <div className="w-px h-6 bg-darklabelprimary"></div>
                  <div className="rounded-full bg-gray-100 text-muted text-content w-[28px] h-[28px] text-center flex justify-center items-center dark:bg-darkbgprimary dark:bordercolor1">
                    VS
                  </div>
                  <div className="w-px h-6 bg-darklabelprimary"></div>
                </div>
              </div>
            ) : null}
          </>
        ))}
      </div>

      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-darkbgprimary">
        {items.map((item, i) => (
          <div
            key={i}
            className={`${item.color} h-full`}
            style={{ width: `${(item.percent / totalPercent) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
