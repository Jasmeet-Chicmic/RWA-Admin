"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Select from "../Select";

interface Option<T> {
  label: string;
  value: T;
}

interface SelectFilterProps<T> {
  paramName: string;
  options: Option<T>[];
  placeholder?: string;
  isClearable?: boolean;
  className?: string;
  defaultValue?: Option<T> | null;
  id?: string;
}

export default function SelectFilter<T>({
  paramName,
  options,
  placeholder = "Select...",
  isClearable = true,
  className = "",
  defaultValue = null,
  id,
}: SelectFilterProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState<Option<T> | null>(
    defaultValue,
  );

  // Set initial state from URL
  useEffect(() => {
    const currentValue = searchParams.get(paramName);
    if (currentValue) {
      const match = options.find((opt) => opt.value == currentValue);
      if (match) setSelectedOption(match);
    } else {
      setSelectedOption(null);
    }
  }, [searchParams, paramName, options]);

  const handleChange = (option: Option<T> | null) => {
    setSelectedOption(option);
    const newParams = new URLSearchParams(searchParams.toString());

    // Reset pagination when filtering
    newParams.delete("skip");

    if (option?.value) {
      newParams.set(paramName, option.value as string);
    } else {
      newParams.delete(paramName);
    }

    router.push(`?${newParams.toString()}`);
  };

  return (
    <div className={className}>
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isClearable={isClearable}
        placeholder={placeholder}
        classNamePrefix="react-select"
        className="dark:bg-darkbgprimary dark:border-darkbordercolor1"
        inputId={id}
      />
    </div>
  );
}
