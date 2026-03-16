import {
  USER_COUNTRY_OPTIONS,
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
} from "@/app/(secured)/users/helpers/constant";
import { getRequiredFieldMessage } from "@/components/molecules/FormBuilder/helpers/utils";
import { FieldConfig } from "@/components/molecules/FormBuilder/types";
import {
  COUNTRIES,
  FORM_FIELDS_TYPES,
  USER_ROLES,
  USER_STATUS,
} from "@/shared/constants";
import { FIELD_NAMES, REGEX, STRING } from "@/shared/strings";

export type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  country: COUNTRIES;
  role: USER_ROLES;
  status: USER_STATUS;
  contactNumber: string;
  companyName: string;
  taxId: string;
  vatNumber: string;
  billingEmail: string;
  state: string;
  zipcode: string;
};

export const userFieldConfig: FieldConfig<UserFormValues>[] = [
  {
    name: FIELD_NAMES.EMAIL,
    label: STRING.EMAIL,
    type: FORM_FIELDS_TYPES.EMAIL,
    placeholder: "jane.doe@example.com",
    validation: {
      required: getRequiredFieldMessage(STRING.EMAIL),
      pattern: {
        value: REGEX.EMAIL,
        message: "Invalid email format",
      },
    },
  },
  {
    name: FIELD_NAMES.STATUS,
    label: STRING.STATUS,
    type: FORM_FIELDS_TYPES.SELECT,
    options: USER_STATUS_OPTIONS,
    validation: {
      required: getRequiredFieldMessage(STRING.STATUS),
    },
  },
  {
    name: FIELD_NAMES.CONTACT,
    label: STRING.CONTACT,
    type: FORM_FIELDS_TYPES.TEXT,
    placeholder: "+1 555-123-4567",
    validation: {
      required: getRequiredFieldMessage(STRING.CONTACT),
    },
  },
  {
    name: FIELD_NAMES.COMPANY_NAME,
    label: STRING.COMPANY_NAME,
    type: FORM_FIELDS_TYPES.TEXT,
    placeholder: "Tech Solutions Inc.",
    validation: {
      required: getRequiredFieldMessage(STRING.COMPANY_NAME),
    },
  },
  {
    name: FIELD_NAMES.COUNTRY,
    label: STRING.COUNTRY,
    type: FORM_FIELDS_TYPES.SELECT,
    options: USER_COUNTRY_OPTIONS,
    validation: {
      required: getRequiredFieldMessage(STRING.COUNTRY),
    },
  },
  {
    name: FIELD_NAMES.ROLE,
    label: STRING.ROLE,
    type: FORM_FIELDS_TYPES.SELECT,
    options: USER_ROLE_OPTIONS,
    validation: {
      required: getRequiredFieldMessage(STRING.ROLE),
    },
  },
];
