import {
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";

// Library
import AsyncSelect, {
  AsyncSelectGetDataParams,
  OptionType,
} from "@/components/atoms/AsyncSelect/AsyncSelect";

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  getData?: (params: AsyncSelectGetDataParams) => Promise<{
    data: OptionType[];
    count: number;
  }>;
  placeholder?: string;
  validation?: RegisterOptions<T, Path<T>>;
  className?: string;
  isMutliOptions?: boolean;
  width?: string;
}

export function AsyncSelectField<T extends FieldValues>({
  name,
  label,
  getData,
  placeholder,
  validation,
  className = "",
  isMutliOptions = false,
  width = "w-full",
}: SelectFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const fieldError = errors[name];

  return (
    <div className={`mb-4 ${width} ${className}`}>
      <label
        htmlFor={name}
        className="block mb-1 font-medium dark:text-sidebartext"
      >
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        rules={validation}
        render={({ field }) => (
          <AsyncSelect
            value={field.value}
            onChange={field.onChange}
            placeholder={placeholder}
            getData={getData}
            isMutliOptions={isMutliOptions}
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
