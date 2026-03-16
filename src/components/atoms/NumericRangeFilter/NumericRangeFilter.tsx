"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { debounce } from "@/shared/utils";
import RangeInput from "@/components/atoms/RangeInput";

const LABEL_CLASS =
  "block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2";

interface NumericRangeFilterProps {
  label: string;
  minParamName: string;
  maxParamName: string;
  placeholderMin?: string;
  placeholderMax?: string;
  step?: string | number;
  min?: number;
  className?: string;
}

const NumericRangeFilter = ({
  label,
  minParamName,
  maxParamName,
  placeholderMin = "Min",
  placeholderMax = "Max",
  step = "0.01",
  min = 0,
  className = "",
}: NumericRangeFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minVal, setMinVal] = useState(searchParams.get(minParamName) ?? "");
  const [maxVal, setMaxVal] = useState(searchParams.get(maxParamName) ?? "");

  // Sync from URL when params change externally (e.g. clear all)
  useEffect(() => {
    setMinVal(searchParams.get(minParamName) ?? "");
    setMaxVal(searchParams.get(maxParamName) ?? "");
  }, [searchParams, minParamName, maxParamName]);

  const pushParams = useMemo(
    () =>
      debounce((minV: string, maxV: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("skip");

        if (minV) {
          newParams.set(minParamName, minV);
        } else {
          newParams.delete(minParamName);
        }

        if (maxV) {
          newParams.set(maxParamName, maxV);
        } else {
          newParams.delete(maxParamName);
        }

        router.push(`?${newParams.toString()}`);
      }, 500),
    [router, searchParams, minParamName, maxParamName],
  );

  const handleMinChange = (val: string) => {
    setMinVal(val);
    pushParams(val, maxVal);
  };

  const handleMaxChange = (val: string) => {
    setMaxVal(val);
    pushParams(minVal, val);
  };

  return (
    <div className={className}>
      <label className={LABEL_CLASS}>{label}</label>
      <div className="flex items-center gap-2">
        <RangeInput
          value={minVal}
          onChange={handleMinChange}
          placeholder={placeholderMin}
          min={min}
          step={step}
        />
        <span className="text-gray-400 dark:text-gray-500 text-sm flex-shrink-0">
          –
        </span>
        <RangeInput
          value={maxVal}
          onChange={handleMaxChange}
          placeholder={placeholderMax}
          min={min}
          step={step}
        />
      </div>
    </div>
  );
};

export default NumericRangeFilter;
