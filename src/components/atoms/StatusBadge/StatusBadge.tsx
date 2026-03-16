"use client";

import { USER_STATUS } from "@/shared/constants";

interface StatusBadgeToggleProps {
  value: USER_STATUS;
}

const StatusBadgeToggle = ({ value }: StatusBadgeToggleProps) => {
  return (
    <button
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        value === USER_STATUS.ACTIVE
          ? "bg-green-100 text-green-700"
          : "bg-gray-200 text-gray-600"
      }`}
    >
      {value === USER_STATUS.ACTIVE ? "Active" : "Inactive"}
    </button>
  );
};

export default StatusBadgeToggle;
