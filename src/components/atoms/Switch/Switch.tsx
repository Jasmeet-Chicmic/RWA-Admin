import React from "react";

type ToggleSwitchProps = {
  enabled: boolean;
  onToggle: () => void;
  label?: string;
};

const Switch: React.FC<ToggleSwitchProps> = ({ enabled, onToggle, label }) => {
  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className="text-sm font-medium dark:text-sidebartext">
          {label}
        </span>
      )}
      <button
        onClick={onToggle}
        type="button"
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none dark:bg-labelprimary ${
          enabled ? "bg-blue-600" : "bg-darklabelprimary"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bgwhite shadow-md ring-0 transition duration-300 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default Switch;
