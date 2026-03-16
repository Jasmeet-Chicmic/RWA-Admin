//Library
import "react-phone-number-input/style.css";

import {
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

interface InputFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  validation?: RegisterOptions<T, Path<T>>;
  className?: string;
  width?: string;
}

export function PhoneField<T extends FieldValues>({
  name,
  label,
  placeholder,
  className = "",
  width = "w-full",
}: Readonly<InputFieldProps<T>>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const fieldError = errors[name];
  return (
    <div className={`mb-4  ${width} ${className}`}>
      <label htmlFor={name}>{label}</label>
      <div className="mt-1 relative">
        <Controller
          control={control}
          name={name}
          rules={{
            validate: (value) => {
              console.log(value, "sdhjdsbhjdfsbhij");
              if (!value) return "Required";
              return (
                isValidPhoneNumber(value as string) ||
                "Invalid Contact Number format"
              );
            },
          }}
          render={({ field }) => (
            <PhoneInput
              value={field.value}
              onChange={field.onChange}
              placeholder={placeholder}
              addInternationalOption={false}
              defaultCountry="IN"
              countryCallingCodeEditable={true}
            />
          )}
        />
      </div>
      {fieldError && (
        <span className="text-red-500 text-[0.875] mt-1">
          {fieldError.message?.toString()}
        </span>
      )}
    </div>
  );
}
