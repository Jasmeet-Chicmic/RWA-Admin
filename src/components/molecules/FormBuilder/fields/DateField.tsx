import React from "react";
import {
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";

interface DateFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  validation?: RegisterOptions<T, Path<T>>;
  defaultValue?: string;
  className?: string;
  width?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  returnISOFormat?: boolean;
}

const DateField = <T extends FieldValues>({
  name,
  label,
  placeholder,
  validation,
  className = "",
  width = "w-full",
  disabled = false,
  min,
  max,
  returnISOFormat = false,
}: Readonly<DateFieldProps<T>>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const fieldError = errors[name];

  return (
    <div className={`mb-4 ${width} ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block mb-1 font-medium text-sidebartext"
        >
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={validation}
        render={({ field }) => {
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (returnISOFormat && value) {
              // Convert date string to ISO format
              const date = new Date(value);
              const isoString = date.toISOString();
              field.onChange(isoString);
            } else {
              field.onChange(value);
            }
          };

          const displayValue =
            returnISOFormat && field.value
              ? new Date(field.value as string).toISOString().split("T")[0]
              : (field.value as string) || "";

          return (
            <input
              id={name}
              type="date"
              placeholder={placeholder}
              onChange={handleChange}
              onBlur={field.onBlur}
              disabled={disabled}
              min={min}
              max={max}
              value={displayValue}
              className="w-full px-3 py-2 border border-darklabelprimary rounded-md focus:outline-none focus:ring-2 focus:ring-primarycolor focus:border-transparent dark:!bg-black dark:border-gray-600 dark:text-sidebartext disabled:opacity-50 disabled:cursor-not-allowed"
            />
          );
        }}
      />
      {fieldError && (
        <p className="text-red-500 text-[0.875] mt-1">
          {fieldError.message?.toString()}
        </p>
      )}
    </div>
  );
};

export default DateField;
