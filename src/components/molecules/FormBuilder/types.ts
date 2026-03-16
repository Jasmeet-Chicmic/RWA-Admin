import {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormReturn,
} from "react-hook-form";

import {
  AsyncSelectGetDataParams,
  OptionType,
} from "@/components/atoms/AsyncSelect/AsyncSelect";
import { FORM_FIELDS_TYPES } from "@/shared/constants";

export type FormFieldType =
  (typeof FORM_FIELDS_TYPES)[keyof typeof FORM_FIELDS_TYPES];
export type FormConfig<T extends FieldValues = FieldValues> =
  | FieldConfig<T>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((methods: UseFormReturn<T, any, T>) => FieldConfig<T>[]);

export type FieldConfig<T extends FieldValues = FieldValues> = {
  name: Path<T>;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  validation?: RegisterOptions<T, Path<T>>;
  options?: { label: string; value: string | number }[];
  className?: string;
  interceptor?: (val: string) => string;
  getData?: (params: AsyncSelectGetDataParams) => Promise<{
    data: OptionType[];
    count: number;
  }>;
  items?: { type: FormFieldType };
  isMutliOptions?: boolean;
  width?: string;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  returnISOFormat?: boolean;
};

export type DefaultValuesType = {
  [key: string]: string;
};
