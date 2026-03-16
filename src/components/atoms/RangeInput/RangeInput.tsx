"use client";

const INPUT_CLASS =
  "w-full px-3 py-2 text-sm rounded-lg border border-bordercolor1 dark:border-darkbordercolor1 bg-bgwhite dark:bg-darkbgprimary text-textprimary dark:text-sidebartext focus:outline-none focus:ring-2 focus:ring-primarycolor/30 dark:focus:ring-secondarycolor/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500";

interface RangeInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  min?: number | string;
  step?: number | string;
  className?: string;
}

const RangeInput = ({
  value,
  onChange,
  placeholder,
  min,
  step,
  className = "",
}: RangeInputProps) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    min={min}
    step={step}
    className={`${INPUT_CLASS} ${className}`}
  />
);

export default RangeInput;
