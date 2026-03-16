import { TrashIcon } from "lucide-react";
import {
  ArrayPath,
  FieldValues,
  useFieldArray,
  useFormContext,
} from "react-hook-form";

import Button from "@/components/atoms/Button";

import RenderField from "../RenderField";
import { FieldConfig, FormFieldType } from "../types";

interface ArrayFieldProps<T extends FieldValues> {
  name: string;
  label: string;
  items?: FieldConfig<T>["items"];
}
const ArrayField = <T extends FieldValues>({
  name,
  label,
  items,
}: Readonly<ArrayFieldProps<T>>) => {
  const { control } = useFormContext<T>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as ArrayPath<T>,
  });
  return (
    <div className="w-full">
      <label htmlFor={name} className="block mb-1 font-medium">
        {label}
      </label>
      <div className="flex flex-col gap-2">
        {fields.map((field, idx) => (
          <div
            className="flex justify-between items-center gap-2"
            key={field.id}
          >
            <RenderField
              key={field.id}
              field={{
                type: items?.type as FormFieldType,
                name: `${name}[${idx}]`,
                label: "",
                className: "w-full",
              }}
            />
            <button type="button" onClick={() => remove(idx)}>
              <TrashIcon className="w-4 h-4 mb-3" />
            </button>
          </div>
        ))}
        {/* @ts-expect-error - append is not a valid prop for useFieldArray */}
        <Button variant="secondary" type="button" onClick={() => append("")}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default ArrayField;
