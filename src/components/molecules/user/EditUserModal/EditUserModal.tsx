import { COUNTRIES, USER_ROLES, USER_STATUS } from "@/shared/constants";
import { FIELD_NAMES } from "@/shared/strings";
import { User } from "@/shared/types";

import CustomModal from "../../CustomModal";
import FormBuilder from "../../FormBuilder";
import { userFieldConfig, UserFormValues } from "./helpers/constants";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormValues) => void;
  userData: User;
  isLoading?: boolean;
}

const EditUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  userData,
  isLoading = false,
}: EditUserModalProps) => {
  const {
    firstName = "Unknown",
    lastName = "Unknown",
    email = "N/A",
    // contactNumber = "N/A",
    status = USER_STATUS.ACTIVE,
    role = USER_ROLES.ENTERPRISE,
    companyName = "N/A",
    country = COUNTRIES.AUSTRALIA,
  } = userData;
  const editUsernameDefaultValues = {
    [FIELD_NAMES.FIRST_NAME]: firstName,
    [FIELD_NAMES.LAST_NAME]: lastName,
    [FIELD_NAMES.EMAIL]: email,
    [FIELD_NAMES.COUNTRY]: country,
    [FIELD_NAMES.ROLE]: role,
    [FIELD_NAMES.STATUS]: status,
    // [FIELD_NAMES.CONTACT]: contactNumber,
    [FIELD_NAMES.COMPANY_NAME]: companyName,
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="2xl">
      {/* Heading and Description */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-sidebartext">
          Edit User Information
        </h2>
        <p className="text-sm text-gray-500 dark:text-sidebartext">
          Updating user details will receive a privacy audit.
        </p>
      </div>

      {/* Form */}
      <FormBuilder
        onSubmit={onSubmit}
        formConfig={userFieldConfig}
        defaultValues={
          editUsernameDefaultValues as unknown as { [key: string]: string }
        }
        scrollable={true}
        isLoading={isLoading}
        numberOfCols={2}
      />
    </CustomModal>
  );
};

export default EditUserModal;
