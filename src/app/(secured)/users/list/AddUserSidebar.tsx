import { X } from "lucide-react";
import React, { SetStateAction, useTransition } from "react";
import { parsePhoneNumber } from "react-phone-number-input";
import { toast } from "react-toastify";

import { addUserAction } from "@/api/user";
import FormBuilder from "@/components/molecules/FormBuilder";
import { FormConfig } from "@/components/molecules/FormBuilder/types";
import { USER_ROLES, USER_STATUS } from "@/shared/constants";
import { REGEX } from "@/shared/strings";

import { USER_ROLE_OPTIONS } from "../helpers/constant";

export type AddUserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  role: USER_ROLES;
  contactNumber: string;
  password: string;
  dob: string;
  status: USER_STATUS;
  isSuspended: boolean;
};

const AddUserSidebar = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const [isLoading, startTransition] = useTransition();
  const submit = (data: AddUserFormValues) => {
    console.log(data, "data");
    startTransition(async () => {
      const res = await addUserAction({
        ...data,
        contactNumber: data?.contactNumber
          ? parsePhoneNumber(data?.contactNumber)?.number?.toString() || ""
          : "",
        phoneCode: data?.contactNumber
          ? parsePhoneNumber(
              data?.contactNumber,
            )?.countryCallingCode?.toString() || ""
          : "",
        status: USER_STATUS.ACTIVE,
        isSuspended: false,
      });
      console.log(res, "res");
      if (res.status) {
        toast.success(res.message);
        setOpen(false);
      } else {
        toast.error(res.message);
      }
    });
  };
  const config: FormConfig<AddUserFormValues> = [
    {
      type: "text",
      name: "firstName",
      label: "First Name",
      placeholder: "Enter First Name",
      validation: {
        required: true,
        pattern: {
          value: REGEX.NAME,
          message: "Invalid name ",
        },
      },
    },
    {
      type: "text",
      name: "lastName",
      label: "Last Name",
      placeholder: "Enter Last Name",
      validation: {
        required: true,
        pattern: {
          value: REGEX.NAME,
          message: "Invalid name ",
        },
      },
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      placeholder: "Enter Email",
      validation: {
        required: true,
        pattern: {
          value: REGEX.EMAIL,
          message: "Invalid email format",
        },
      },
    },
    {
      type: "password",
      name: "password",
      label: "Password",
      placeholder: "Enter Password",
      validation: {
        required: true,
      },
    },
    {
      type: "date",
      name: "dob",
      label: "Date of Birth",
      placeholder: "Select Date of Birth",
      validation: {
        required: true,
      },
    },
    {
      type: "phone",
      name: "contactNumber",
      label: "Contact",
      placeholder: "Enter Contact Number",
      validation: {
        required: true,
      },
    },
    {
      type: "select",
      name: "role",
      label: "Role",
      placeholder: "Select Role",
      validation: {
        required: true,
      },
      options: USER_ROLE_OPTIONS,
    },
  ];
  return (
    <>
      {/* Overlay */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 bgbgblack/30 z-[100] backdrop-blur-sm transition-opacity cursor-default"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
          tabIndex={-1}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-bgwhite shadow-lg z-[110] transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-bordergray200">
          <h2 className="text-lg font-semibold text-gray-800">Add User</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="bordercolor1 hover:text-gray-600 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="text-2xl" />
          </button>
        </div>
        {open && (
          <FormBuilder<AddUserFormValues>
            formConfig={config}
            onSubmit={submit}
            isLoading={isLoading}
            className="mx-4 mt-3"
          />
        )}
      </div>
    </>
  );
};

export default AddUserSidebar;
