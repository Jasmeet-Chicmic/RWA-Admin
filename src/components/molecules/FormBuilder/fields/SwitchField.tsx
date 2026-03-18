// Library
import {
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";
import Switch from "react-switch";

import { FormFieldType } from "../types";

interface SwitchFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  validation?: RegisterOptions<T, Path<T>>;
  className?: string;
  width?: string;
}

export function SwitchField<T extends FieldValues>({
  name,
  label,
  className = "",
  width = "w-full",
}: Readonly<SwitchFieldProps<T>>) {
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
        control={control}
        name={name}
        render={({ field }) => (
          <Switch
            checked={field.value}
            onChange={field.onChange}
            onColor="#c97254"
            offColor="#bababa"
            onHandleColor="#ffffff"
            offHandleColor="#ffffff"
            checkedIcon={false}
            uncheckedIcon={false}
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
