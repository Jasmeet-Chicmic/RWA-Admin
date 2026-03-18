import {
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";

// Library
import Select from "@/components/atoms/Select";

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  options: { label: string; value: string | number }[];
  placeholder?: string;
  validation?: RegisterOptions<T, Path<T>>;
  className?: string;
  width?: string;
  disabled?: boolean;
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  validation,
  className = "",
  width = "w-full",
  disabled = false,
}: SelectFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const fieldError = errors[name];

  return (
    <div className={`mb-4 ${width} ${className}`}>
      <label htmlFor={name} className="block mb-1 font-medium text-sidebartext">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        rules={validation}
        render={({ field }) => (
          <Select
            value={options.find((item) => item.value == field.value)}
            onChange={(value) => field.onChange(value?.value)}
            placeholder={placeholder}
            options={options}
            isDisabled={disabled}
          />
        )}
      />
      {fieldError && (
        <span className="text-red-500 text-[0.875] mt-1">
          {fieldError.message?.toString()}
        </span>
      )}
    </div>
  );
}
