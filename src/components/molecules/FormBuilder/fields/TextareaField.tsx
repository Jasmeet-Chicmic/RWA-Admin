// Library
import {
  FieldValues,
  Path,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";

import { FormFieldType } from "../types";

interface InputFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  validation?: RegisterOptions<T, Path<T>>;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interceptor?: (val: string) => any;
  width?: string;
  disabled?: boolean;
}

export function TextareaField<T extends FieldValues>({
  name,
  label,
  placeholder,
  validation,
  className = "",
  width = "w-full",
  interceptor = (val: string) => val,
  disabled = false,
}: Readonly<InputFieldProps<T>>) {
  const {
    setValue,
    register,
    formState: { errors },
  } = useFormContext<T>();

  const fieldError = errors[name];
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValue(name, interceptor(value));
  };

  return (
    <div className={`mb-4 ${width} ${className}`}>
      <label
        htmlFor={name}
        className="block mb-1 font-medium dark:text-sidebartext"
      >
        {label}
      </label>
      <textarea
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name, validation)}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primarycolor textbgblack dark:bg-darkbgprimary dark:border-darkbordercolor1 dark:text-sidebartext disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {fieldError && (
        <span className="text-red-500 text-[0.875] mt-1">
          {fieldError.message?.toString()}
        </span>
      )}
    </div>
  );
}
