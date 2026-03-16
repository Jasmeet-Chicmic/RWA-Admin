import { FieldValues } from "react-hook-form";

import { FORM_FIELDS_TYPES } from "@/shared/constants";

import ArrayField from "./fields/ArrayField";
import { AsyncSelectField } from "./fields/AsyncSelectField";
import { ColorField } from "./fields/ColorField";
import DateField from "./fields/DateField";
import { InputField } from "./fields/InputField";
import { PasswordField } from "./fields/PasswordInput";
import { PhoneField } from "./fields/PhoneField";
import { SelectField } from "./fields/SelectField";
import { SwitchField } from "./fields/SwitchField";
import { TextareaField } from "./fields/TextareaField";
import { FieldConfig } from "./types";

const RenderField = <T extends FieldValues>({
  field,
}: {
  field: FieldConfig<T>;
}) => {
  switch (field.type) {
    case FORM_FIELDS_TYPES.PHONE:
      return <PhoneField<T> key={field.name} {...field} />;
    case FORM_FIELDS_TYPES.PASSWORD:
      return <PasswordField<T> key={field.name} {...field} />;
    case FORM_FIELDS_TYPES.SELECT:
      return (
        <SelectField<T>
          key={field.name}
          {...field}
          options={field.options || []}
          disabled={field.disabled}
        />
      );
    case FORM_FIELDS_TYPES.ASYNC_SELECT:
      return (
        <AsyncSelectField<T>
          key={field.name}
          {...field}
          getData={field?.getData}
        />
      );
    case FORM_FIELDS_TYPES.TEXTAREA:
      return (
        <TextareaField<T>
          key={field.name}
          {...field}
          disabled={field.disabled}
        />
      );
    case FORM_FIELDS_TYPES.ARRAY:
      return <ArrayField<T> key={field.name} {...field} />;
    case FORM_FIELDS_TYPES.SWITCH:
      return <SwitchField<T> key={field.name} {...field} />;
    case FORM_FIELDS_TYPES.COLOR:
      return <ColorField<T> key={field.name} {...field} />;
    case FORM_FIELDS_TYPES.DATE:
      return (
        <DateField
          key={field.name}
          {...field}
          disabled={field.disabled}
          min={typeof field.min === "number" ? String(field.min) : field.min}
          max={typeof field.max === "number" ? String(field.max) : field.max}
          returnISOFormat={field.returnISOFormat}
        />
      );
    default:
      return (
        <InputField<T>
          key={field.name}
          {...field}
          min={field.min}
          max={field.max}
          disabled={field.disabled}
        />
      );
  }
};

export default RenderField;
