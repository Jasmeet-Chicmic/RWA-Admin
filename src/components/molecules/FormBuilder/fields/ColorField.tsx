import { useState } from "react";
// Library
import {
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";

import CheckClickOutside from "@/components/atoms/CheckClickOutside";
import { Chrome } from "@uiw/react-color";

import { FormFieldType } from "../types";

interface ColorFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  validation?: RegisterOptions<T, Path<T>>;
  className?: string;
  width?: string;
}

export function ColorField<T extends FieldValues>({
  name,
  label,
  className = "",
  width = "w-full",
}: Readonly<ColorFieldProps<T>>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const fieldError = errors[name];
  const [open, setOpen] = useState(false);
  return (
    <div className={`mb-4 ${width} ${className}`}>
      <label
        htmlFor={name}
        className="block mb-1 font-medium dark:text-sidebartext"
      >
        {label}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-6 h-6 rounded-full cursor-pointer border border-darklabelprimary hover:border-gray-400 transition-all duration-300 ease-in-out"
                style={{ backgroundColor: field.value }}
                onClick={() => setOpen(true)}
                aria-label={`Select color for ${label}`}
              ></button>
            </div>
            {open && (
              <CheckClickOutside onClick={() => setOpen(false)}>
                <Chrome
                  style={{ marginLeft: 20 }}
                  color={field.value}
                  onChange={(color) => {
                    field.onChange(color.hex);
                  }}
                />
              </CheckClickOutside>
            )}
          </>
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
